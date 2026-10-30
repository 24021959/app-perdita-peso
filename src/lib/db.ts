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

export async function getAllEntries(): Promise<Entry[]> {
  const db = await open();
  const all = await wrap<Entry[]>(
    db.transaction("entries").objectStore("entries").getAll(),
  );
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveEntry(entry: Entry): Promise<void> {
  const db = await open();
  await wrap(
    db.transaction("entries", "readwrite").objectStore("entries").put(entry),
  );
}

export async function getSettings(): Promise<Settings> {
  const db = await open();
  const saved = await wrap<Settings | undefined>(
    db.transaction("settings").objectStore("settings").get("main"),
  );
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await open();
  await wrap(
    db
      .transaction("settings", "readwrite")
      .objectStore("settings")
      .put(settings, "main"),
  );
}

export async function exportBackup(): Promise<string> {
  const [entries, settings] = await Promise.all([
    getAllEntries(),
    getSettings(),
  ]);
  return JSON.stringify(
    { app: "app-perdita-peso", version: 1, settings, entries },
    null,
    2,
  );
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
  return data.entries.length;
}
