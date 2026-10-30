// Logica di sincronizzazione, senza dipendenze dal browser né da Supabase (così si può provare da sola).
//
// Regole:
// - ogni modifica locale segna il record come "da inviare" (dirty);
// - si inviano i record da inviare e quelli che online non esistono ancora;
// - si scaricano i record online che non sono da inviare: online vince sul locale, tranne per i record
//   modificati da questo dispositivo e non ancora inviati;
// - alla primissima sincronizzazione di un dispositivo, tutto ciò che è già locale è "da inviare".

import type { Entry } from "./types";

export type Local = {
  listEntries(): Promise<Entry[]>;
  listKv(): Promise<Record<string, unknown>>;
  putEntry(e: Entry): Promise<void>;
  putKv(key: string, value: unknown): Promise<void>;
  getSyncValue<T>(key: "sync:dirty" | "sync:init"): Promise<T | undefined>;
  setSyncValue(key: "sync:dirty" | "sync:init", value: unknown): Promise<void>;
};

export type Remote = {
  listEntries(): Promise<{ giorno: string; dati: Entry }[]>;
  listKv(): Promise<{ chiave: string; valore: unknown }[]>;
  upsertEntries(rows: { giorno: string; dati: Entry }[]): Promise<void>;
  upsertKv(rows: { chiave: string; valore: unknown }[]): Promise<void>;
};

export type SyncResult = { pushed: number; pulled: number; changedLocal: boolean };

/** Rappresentazione stabile (chiavi ordinate, senza undefined) per confrontare i valori. */
export function canon(v: unknown): string {
  if (v === undefined) return "null";
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
    .join(",")}}`;
}

export async function runSync(local: Local, remote: Remote): Promise<SyncResult> {
  const [remoteEntries, remoteKv, localEntries, localKv] = await Promise.all([
    remote.listEntries(),
    remote.listKv(),
    local.listEntries(),
    local.listKv(),
  ]);

  const firstRun = !(await local.getSyncValue<boolean>("sync:init"));
  const dirty = new Set((await local.getSyncValue<string[]>("sync:dirty")) ?? []);
  if (firstRun) {
    for (const e of localEntries) dirty.add(`e:${e.date}`);
    for (const k of Object.keys(localKv)) dirty.add(`k:${k}`);
  }

  const remoteEntryMap = new Map(remoteEntries.map((r) => [r.giorno, r.dati]));
  const remoteKvMap = new Map(remoteKv.map((r) => [r.chiave, r.valore]));

  // ---- invio
  const pushEntries = localEntries.filter(
    (e) => dirty.has(`e:${e.date}`) || !remoteEntryMap.has(e.date),
  );
  const pushKv = Object.entries(localKv).filter(
    ([k]) => dirty.has(`k:${k}`) || !remoteKvMap.has(k),
  );

  // non rimandare ciò che online è già identico
  const realEntries = pushEntries.filter(
    (e) => !remoteEntryMap.has(e.date) || canon(remoteEntryMap.get(e.date)) !== canon(e),
  );
  const realKv = pushKv.filter(
    ([k, v]) => !remoteKvMap.has(k) || canon(remoteKvMap.get(k)) !== canon(v),
  );

  if (realEntries.length) {
    await remote.upsertEntries(realEntries.map((e) => ({ giorno: e.date, dati: e })));
  }
  if (realKv.length) {
    await remote.upsertKv(realKv.map(([k, v]) => ({ chiave: k, valore: v })));
  }

  // il segno "da inviare" cade solo se il record locale non è cambiato mentre si inviava
  const stillDirty = new Set((await local.getSyncValue<string[]>("sync:dirty")) ?? []);
  const nowEntries = new Map((await local.listEntries()).map((e) => [e.date, e]));
  const nowKv = await local.listKv();
  for (const e of pushEntries) {
    const id = `e:${e.date}`;
    const cur = nowEntries.get(e.date);
    if (cur && canon(cur) === canon(e)) {
      dirty.delete(id);
      stillDirty.delete(id);
    } else {
      stillDirty.add(id);
    }
  }
  for (const [k, v] of pushKv) {
    const id = `k:${k}`;
    if (k in nowKv && canon(nowKv[k]) === canon(v)) {
      dirty.delete(id);
      stillDirty.delete(id);
    } else {
      stillDirty.add(id);
    }
  }
  // ciò che era da inviare ma non è stato toccato resta com'era (non dovrebbe esserci), le modifiche
  // arrivate durante l'invio restano da inviare
  const finalDirty = new Set<string>([...dirty, ...stillDirty]);

  // ---- scarico
  const startEntries = new Map(localEntries.map((e) => [e.date, e]));
  let pulled = 0;
  for (const r of remoteEntries) {
    if (finalDirty.has(`e:${r.giorno}`)) continue;
    const cur = nowEntries.get(r.giorno);
    const start = startEntries.get(r.giorno);
    // modificato su questo dispositivo mentre si sincronizzava: non sovrascrivere
    if (cur && (!start || canon(cur) !== canon(start))) continue;
    if (!cur || canon(cur) !== canon(r.dati)) {
      await local.putEntry(r.dati);
      pulled++;
    }
  }
  for (const r of remoteKv) {
    if (finalDirty.has(`k:${r.chiave}`)) continue;
    if (r.chiave in nowKv && (!(r.chiave in localKv) || canon(nowKv[r.chiave]) !== canon(localKv[r.chiave]))) continue;
    if (!(r.chiave in nowKv) || canon(nowKv[r.chiave]) !== canon(r.valore)) {
      await local.putKv(r.chiave, r.valore);
      pulled++;
    }
  }

  await local.setSyncValue("sync:dirty", [...finalDirty]);
  await local.setSyncValue("sync:init", true);
  return { pushed: realEntries.length + realKv.length, pulled, changedLocal: pulled > 0 };
}
