import { DEFAULT_SETTINGS, type Entry, type Settings } from "./types";

const DB_NAME = "app-perdita-peso";
const DB_VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("entries")) {
        db.createObjectStore("entries", { keyPath: "date" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---- notifica delle modifiche locali (usata dalla sincronizzazione online)
// id: "e:<data>" per un giorno, "k:<chiave>" per un valore generico (impostazioni = "k:main")
let listener: ((id: string) => void) | null = null;
export function setChangeListener(fn: ((id: string) => void) | null) {
  listener = fn;
}

// ---- giorni
export async function getAllEntries(): Promise<Entry[]> {
  const db = await open();
  const all = await wrap<Entry[]>(db.transaction("entries").objectStore("entries").getAll());
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

/** Scrive senza avvisare la sincronizzazione (serve alla sincronizzazione stessa). */
export async function putEntryRaw(entry: Entry): Promise<void> {
  const db = await open();
  await wrap(db.transaction("entries", "readwrite").objectStore("entries").put(entry));
}

export async function saveEntry(entry: Entry): Promise<void> {
  await putEntryRaw(entry);
  listener?.(`e:${entry.date}`);
}

// ---- valori generici (impostazioni, esami, menu, spesa, stato della sincronizzazione)
export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await open();
  return wrap<T | undefined>(db.transaction("settings").objectStore("settings").get(key));
}

export async function putMetaRaw(key: string, value: unknown): Promise<void> {
  const db = await open();
  await wrap(db.transaction("settings", "readwrite").objectStore("settings").put(value, key));
}

/** Le chiavi "sync:..." sono solo locali e non vengono mai inviate online. */
export async function putMeta(key: string, value: unknown): Promise<void> {
  await putMetaRaw(key, value);
  if (!key.startsWith("sync:")) listener?.(`k:${key}`);
}

/** Tutti i valori generici tranne quelli di sincronizzazione (compresa la chiave "main" = impostazioni). */
export async function allKv(): Promise<Record<string, unknown>> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const out: Record<string, unknown> = {};
    const req = db.transaction("settings").objectStore("settings").openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return resolve(out);
      const k = String(cur.key);
      if (!k.startsWith("sync:")) out[k] = cur.value;
      cur.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

// ---- impostazioni
export async function getSettings(): Promise<Settings> {
  const saved = await getMeta<Settings>("main");
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await putMeta("main", settings);
}

// ---- backup
export async function exportBackup(): Promise<string> {
  const [entries, settings, kv] = await Promise.all([getAllEntries(), getSettings(), allKv()]);
  const meta = { ...kv };
  delete meta.main;
  return JSON.stringify({ app: "app-perdita-peso", version: 2, settings, entries, meta }, null, 2);
}

export async function importBackup(json: string): Promise<number> {
  const data = JSON.parse(json);
  if (data?.app !== "app-perdita-peso" || !Array.isArray(data.entries)) {
    throw new Error("File non valido");
  }
  for (const e of data.entries as Entry[]) {
    if (typeof e.date === "string") await saveEntry(e);
  }
  if (data.settings) await saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
  if (data.meta && typeof data.meta === "object") {
    for (const [k, v] of Object.entries(data.meta)) {
      if (!k.startsWith("sync:") && k !== "main") await putMeta(k, v);
    }
  }
  return data.entries.length;
}
