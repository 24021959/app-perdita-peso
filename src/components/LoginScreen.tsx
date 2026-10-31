"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OWNER_EMAIL } from "@/lib/config";
import { WELCOME_SEEN_KEY } from "@/lib/greeting";
import { signInWithEmail, signInWithPassword } from "@/lib/sync";
import { useSyncStatus } from "@/lib/useSync";
import Entrata from "./Entrata";

/** Pagina di accesso: appare all'apertura se non si è collegati e dopo "Esci". */
export default function LoginScreen() {
  const s = useSyncStatus();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setMsg("");
    const err = await signInWithPassword(password);
    setBusy(false);
    if (err) setMsg(err);
    else {
      setPassword("");
      router.replace("/"); // dopo l'accesso si apre sempre "Oggi"
      try {
        sessionStorage.setItem(WELCOME_SEEN_KEY, "1"); // il benvenuto l'hai già visto qui
      } catch {
        /* ignora */
      }
    }
  }

  async function sendLink() {
    setBusy(true);
    setMsg("");
    const err = await signInWithEmail(OWNER_EMAIL);
    setBusy(false);
    if (err) setMsg(err);
  }

  return (
    <Entrata>
      <p className="mb-4 text-center text-muted">Inserisci la password per entrare</p>
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
    </Entrata>
  );
}
