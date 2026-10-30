"use client";

import { useState } from "react";
import { signInWithEmail, signOut, syncNow } from "@/lib/sync";
import { useSyncStatus } from "@/lib/useSync";

export default function SyncPanel() {
  const s = useSyncStatus();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setMsg("");
    const err = await signInWithEmail(email);
    setBusy(false);
    if (err) setMsg(err);
  }

  const last = s.lastSync
    ? new Date(s.lastSync).toLocaleString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <section className="rounded-2xl bg-peach text-peach-ink p-4 space-y-3">
      <h2 className="text-lg font-semibold">Salvataggio online</h2>

      {s.phase === "out" || s.phase === "off" ? (
        s.linkSent ? (
          <div className="space-y-2">
            <p>
              Ti ho scritto un&apos;email con il link di accesso. Aprilo <strong>su questo stesso telefono o
              computer</strong>: l&apos;app si apre già collegata.
            </p>
            <p className="text-sm opacity-80">Controlla anche la cartella dello spam. Il link vale poco tempo.</p>
          </div>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Collegando il tuo indirizzo email, i dati vengono copiati in un database protetto e sono disponibili
              su tutti i tuoi dispositivi. Nessuna password: ricevi un link per entrare.
            </p>
            <label className="block">
              <span className="text-sm opacity-80">Email</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
              />
            </label>
            <button
              type="button"
              disabled={busy || !email.includes("@")}
              onClick={send}
              className="w-full rounded-xl bg-accent text-on-accent py-4 text-lg font-semibold disabled:opacity-50"
            >
              {busy ? "Invio…" : "Mandami il link di accesso"}
            </button>
          </>
        )
      ) : (
        <>
          <p>
            Collegato come <strong>{s.email}</strong>.
          </p>
          <p className="text-sm opacity-80">
            {s.phase === "syncing" ? "Sincronizzo…" : last ? `Ultima sincronizzazione: ${last}.` : "Non ancora sincronizzato."}
            {s.pending > 0 ? ` ${s.pending} modifiche in attesa di essere inviate.` : ""}
          </p>
          {s.error && <p className="text-sm text-rose-ink">{s.error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void syncNow()}
              disabled={s.phase === "syncing"}
              className="rounded-xl bg-accent text-on-accent py-3 font-semibold disabled:opacity-50"
            >
              Sincronizza ora
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl border border-peach-ink/30 bg-card text-foreground py-3"
            >
              Esci
            </button>
          </div>
          <p className="text-xs opacity-80">
            Uscendo, i dati restano su questo dispositivo ma smettono di essere inviati online.
          </p>
        </>
      )}
      {msg && <p className="text-sm text-rose-ink">{msg}</p>}
    </section>
  );
}
