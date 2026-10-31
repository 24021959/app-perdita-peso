import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { OWNER_EMAIL, SUPABASE_KEY, SUPABASE_URL } from "./config";
import {
  allKv,
  getAllEntries,
  getMeta,
  putEntryRaw,
  putMetaRaw,
  setChangeListener,
} from "./db";
import { runSync, type Local, type Remote } from "./syncCore";
import type { Entry } from "./types";

export type SyncStatus = {
  phase: "off" | "out" | "idle" | "syncing" | "error";
  email?: string;
  lastSync?: string;
  error?: string;
  pending: number;
  linkSent?: boolean;
  /** vero quando Supabase ha letto la sessione salvata (serve a non mostrare la pagina di accesso per sbaglio) */
  ready?: boolean;
  /** vero se l'account ha già una password scelta (altrimenti dopo il link via email si propone di sceglierla) */
  hasPassword?: boolean;
};

let status: SyncStatus = { phase: "off", pending: 0 };
const subs = new Set<() => void>();
function setStatus(p: Partial<SyncStatus>) {
  status = { ...status, ...p };
  subs.forEach((f) => f());
}
export const subscribeSync = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
export const getSyncStatus = () => status;

let supa: SupabaseClient | null = null;
function client(): SupabaseClient {
  supa ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return supa;
}

let session: Session | null = null;
let passwordLogin = false; // l'ultimo accesso è avvenuto con la password: quindi la password esiste
let started = false;
let running = false;
let rerun = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastRun = 0;

// ---- segni "da inviare": salvati in locale, in coda per non sovrapporre le scritture
let marks = Promise.resolve();
let buffered = new Set<string>();

const localAdapter: Local = {
  listEntries: getAllEntries,
  listKv: allKv,
  putEntry: putEntryRaw,
  putKv: putMetaRaw,
  getSyncValue: <T>(k: "sync:dirty" | "sync:init") => getMeta<T>(k),
  setSyncValue: putMetaRaw as Local["setSyncValue"],
};

async function readDirty(): Promise<string[]> {
  return (await getMeta<string[]>("sync:dirty")) ?? [];
}

function mark(ids: string[]) {
  marks = marks
    .then(async () => {
      const d = new Set(await readDirty());
      ids.forEach((i) => d.add(i));
      await putMetaRaw("sync:dirty", [...d]);
      setStatus({ pending: d.size });
    })
    .catch(() => {});
}

function onLocalChange(id: string) {
  if (running) {
    buffered.add(id);
  } else {
    mark([id]);
  }
  if (session) schedule(2000);
}

function schedule(delay: number, minGap = 0) {
  if (!session) return;
  if (minGap && Date.now() - lastRun < minGap) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void syncNow(), delay);
}

function remoteAdapter(c: SupabaseClient, userId: string): Remote {
  const chunk = <T>(a: T[], n: number) =>
    Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
  return {
    async listEntries() {
      const out: { giorno: string; dati: Entry }[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await c
          .from("peso_sync_entries")
          .select("giorno,dati")
          .order("giorno")
          .range(from, from + 999);
        if (error) throw error;
        out.push(...(data as { giorno: string; dati: Entry }[]));
        if (data.length < 1000) break;
      }
      return out;
    },
    async listKv() {
      const out: { chiave: string; valore: unknown }[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await c
          .from("peso_sync_kv")
          .select("chiave,valore")
          .order("chiave")
          .range(from, from + 999);
        if (error) throw error;
        out.push(...(data as { chiave: string; valore: unknown }[]));
        if (data.length < 1000) break;
      }
      return out;
    },
    async upsertEntries(rows) {
      for (const part of chunk(rows, 200)) {
        const { error } = await c.from("peso_sync_entries").upsert(
          part.map((r) => ({
            user_id: userId,
            giorno: r.giorno,
            dati: r.dati,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "user_id,giorno" },
        );
        if (error) throw error;
      }
    },
    async upsertKv(rows) {
      for (const part of chunk(rows, 200)) {
        const { error } = await c.from("peso_sync_kv").upsert(
          part.map((r) => ({
            user_id: userId,
            chiave: r.chiave,
            valore: r.valore,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "user_id,chiave" },
        );
        if (error) throw error;
      }
    },
  };
}

function friendly(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "Senza connessione: i dati restano sul dispositivo e partiranno appena torna internet.";
  }
  if (/fetch|network|load failed/i.test(msg)) {
    return "Non riesco a raggiungere il database. Riprova tra poco: i dati restano sul dispositivo.";
  }
  if (/row-level security|permission denied|42501/i.test(msg)) {
    return "Accesso negato dal database: questo indirizzo email non è abilitato.";
  }
  return msg;
}

async function ensureOwner(c: SupabaseClient): Promise<boolean> {
  const { data, error } = await c.rpc("peso_claim_owner");
  if (error) throw error;
  return data === true;
}

export async function syncNow(): Promise<void> {
  if (!session) return;
  if (running) {
    rerun = true;
    return;
  }
  running = true;
  lastRun = Date.now();
  setStatus({ phase: "syncing", error: undefined });
  try {
    const c = client();
    if (!(await ensureOwner(c))) {
      setStatus({
        phase: "error",
        error: "Questo indirizzo email non è autorizzato a salvare i dati online.",
      });
      return;
    }
    await marks;
    const res = await runSync(localAdapter, remoteAdapter(c, session.user.id));
    if (buffered.size) {
      const ids = [...buffered];
      buffered = new Set();
      mark(ids);
      rerun = true;
    }
    await marks;
    setStatus({
      phase: "idle",
      lastSync: new Date().toISOString(),
      pending: (await readDirty()).length,
    });
    if (res.changedLocal && typeof window !== "undefined") {
      window.dispatchEvent(new Event("peso-data-changed"));
    }
  } catch (e) {
    setStatus({ phase: "error", error: friendly(e) });
  } finally {
    running = false;
    if (rerun) {
      rerun = false;
      schedule(500);
    }
  }
}

async function onSession(s: Session | null) {
  session = s;
  if (!s) {
    setStatus({ phase: "out", ready: true, email: undefined, error: undefined, pending: (await readDirty()).length });
    return;
  }
  setStatus({ phase: "idle", ready: true, hasPassword: s.user.user_metadata?.has_password === true || passwordLogin, email: s.user.email ?? undefined, linkSent: false, pending: (await readDirty()).length });
  schedule(0);
}

/** Da chiamare una volta all'avvio dell'app (nel browser). */
export function initSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  setChangeListener(onLocalChange);
  setStatus({ phase: "out" });
  // non chiamare altre funzioni di Supabase dentro questa callback: si rimanda con setTimeout
  client().auth.onAuthStateChange((_event, s) => {
    setTimeout(() => void onSession(s), 0);
  });
  window.addEventListener("online", () => schedule(0));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") schedule(0, 30_000);
  });
}

export async function signInWithEmail(email: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const { error } = await client().auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: `${window.location.origin}${base}/` },
  });
  if (error) return friendly(error);
  setStatus({ linkSent: true });
  return null;
}

/** Accesso con la sola password: l'email del proprietario è fissa. */
export async function signInWithPassword(password: string): Promise<string | null> {
  passwordLogin = true;
  const { error } = await client().auth.signInWithPassword({ email: OWNER_EMAIL, password });
  if (!error) {
    // segna sull'account che la password esiste, così il link via email non la richiede di nuovo
    setTimeout(() => void client().auth.updateUser({ data: { has_password: true } }), 0);
    return null;
  }
  passwordLogin = false;
  if (/invalid login credentials/i.test(error.message)) {
    return "Password non corretta. Se non l'hai ancora scelta, entra una volta con il link via email e impostala da qui.";
  }
  return friendly(error);
}

/** Sceglie o cambia la password dell'account (serve essere già collegati). */
export async function setPassword(password: string): Promise<string | null> {
  const { error } = await client().auth.updateUser({ password, data: { has_password: true } });
  if (error) return friendly(error);
  passwordLogin = true;
  setStatus({ hasPassword: true });
  return null;
}

export async function signOut() {
  await client().auth.signOut();
}

export type SendResult = { ok: true } | { ok: false; code: string; error: string };

/** Invia la lista della spesa per email, tramite la funzione sul server (Resend). */
export async function sendShoppingEmail(to: string, subject: string, text: string): Promise<SendResult> {
  if (!session) {
    return {
      ok: false,
      code: "signed_out",
      error: "Per inviare l'email devi prima accedere: Impostazioni → Salvataggio online.",
    };
  }
  try {
    const { error } = await client().functions.invoke("peso-send-shopping-list", { body: { to, subject, text } });
    if (!error) return { ok: true };
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const b = (await ctx.json()) as { code?: string; error?: string };
        return { ok: false, code: b.code ?? "error", error: b.error ?? "Invio non riuscito." };
      } catch {
        /* risposta non leggibile */
      }
    }
    return { ok: false, code: "network", error: friendly(error) };
  } catch (e) {
    return { ok: false, code: "network", error: friendly(e) };
  }
}
