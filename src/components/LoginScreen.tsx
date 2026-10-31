"use client";

import { useState } from "react";
import { APP_NAME, OWNER_EMAIL } from "@/lib/config";
import { signInWithEmail, signInWithPassword } from "@/lib/sync";
import { useSyncStatus } from "@/lib/useSync";

/** Pagina di accesso: appare all'apertura se non si è collegati e dopo "Esci". */
export default function LoginScreen() {
  const s = useSyncStatus();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setMsg("");
    const err = await signInWithPassword(password);
    setBusy(false);
    if (err) setMsg(err);
    else setPassword("");
  }

  async function sendLink() {
    setBusy(true);
    setMsg("");
    const err = await signInWithEmail(OWNER_EMAIL);
    setBusy(false);
    if (err) setMsg(err);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center text-accent">
        <svg width="56" height="56" viewBox="0 0 26 26" aria-hidden="true" className="mx-auto">
          <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M13 13 L18 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="13" cy="13" r="1.8" fill="currentColor" />
        </svg>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-1 text-muted">Inserisci la password per entrare</p>
      </div>

      {s.linkSent ? (
        <div className="space-y-3 rounded-2xl bg-peach p-4 text-peach-ink">
          <p>
            Ti ho scritto un&apos;email con il link di accesso. Aprilo <strong>su questo stesso telefono o computer</strong>:
            l&apos;app si apre già collegata. Poi scegli la password in Impostazioni.
          </p>
          <p className="text-sm opacity-80">Controlla anche la cartella dello spam. Il link vale poco tempo.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
          className="space-y-4 rounded-2xl bg-peach p-4 text-peach-ink"
        >
          <input type="email" name="email" autoComplete="username" defaultValue={OWNER_EMAIL} hidden readOnly />
          <label className="block">
            <span className="text-sm opacity-80">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
            />
          </label>
          {msg && (
            <p role="alert" className="text-sm font-medium text-rose-ink">
              {msg}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || password.length < 8}
            className="w-full rounded-xl bg-accent py-4 text-lg font-semibold text-on-accent disabled:opacity-50"
          >
            {busy ? "Attendi…" : "Entra"}
          </button>
          <button type="button" disabled={busy} onClick={sendLink} className="w-full text-center text-sm underline disabled:opacity-50">
            Prima volta o password dimenticata? Mandami il link via email
          </button>
        </form>
      )}
      {s.linkSent && msg && <p className="mt-3 text-sm text-rose-ink">{msg}</p>}
    </main>
  );
}
