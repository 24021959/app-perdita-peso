"use client";

import { useState } from "react";
import { OWNER_EMAIL } from "@/lib/config";
import { setPassword, signInWithEmail, signInWithPassword, signOut, syncNow } from "@/lib/sync";
import { useSyncStatus } from "@/lib/useSync";

const inputCls = "mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground";

export default function SyncPanel() {
  const s = useSyncStatus();
  const [password, setPasswordValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setMsg("");
    const err = await signInWithPassword(password);
    setBusy(false);
    if (err) setMsg(err);
    else setPasswordValue("");
  }

  async function sendLink() {
    setBusy(true);
    setMsg("");
    const err = await signInWithEmail(OWNER_EMAIL);
    setBusy(false);
    if (err) setMsg(err);
  }

  async function savePassword() {
    setBusy(true);
    setMsg("");
    setOk("");
    const err = await setPassword(newPassword);
    setBusy(false);
    if (err) setMsg(err);
    else {
      setNewPassword("");
      setOk("Password salvata. Da ora puoi entrare con la sola password.");
    }
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
              computer</strong>: l&apos;app si apre già collegata. Poi scegli la password qui sotto, così la prossima
              volta basta quella.
            </p>
            <p className="text-sm opacity-80">Controlla anche la cartella dello spam. Il link vale poco tempo.</p>
          </div>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Inserisci la password per salvare i dati online e averli su tutti i tuoi dispositivi. Resti collegato
              per mesi su questo dispositivo.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void login();
              }}
              className="space-y-3"
            >
              <input type="email" name="email" autoComplete="username" defaultValue={OWNER_EMAIL} hidden readOnly />
              <label className="block">
                <span className="text-sm opacity-80">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className={inputCls}
                />
              </label>
              <button
                type="submit"
                disabled={busy || password.length < 8}
                className="w-full rounded-xl bg-accent text-on-accent py-4 text-lg font-semibold disabled:opacity-50"
              >
                {busy ? "Attendi…" : "Accedi"}
              </button>
            </form>
            <button type="button" disabled={busy} onClick={sendLink} className="w-full text-center text-sm underline disabled:opacity-50">
              Prima volta o password dimenticata? Mandami il link via email
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
          <details className="rounded-xl border border-peach-ink/30 p-3">
            <summary className="cursor-pointer font-semibold">Scegli o cambia la password</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void savePassword();
              }}
              className="mt-3 space-y-3"
            >
              <input type="email" name="email" autoComplete="username" defaultValue={OWNER_EMAIL} hidden readOnly />
              <label className="block">
                <span className="text-sm opacity-80">Nuova password (almeno 8 caratteri)</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls}
                />
              </label>
              <button
                type="submit"
                disabled={busy || newPassword.length < 8}
                className="w-full rounded-xl bg-accent text-on-accent py-3 font-semibold disabled:opacity-50"
              >
                Salva la password
              </button>
              {ok && <p className="text-sm font-medium">{ok}</p>}
            </form>
          </details>
        </>
      )}
      {msg && <p className="text-sm text-rose-ink">{msg}</p>}
    </section>
  );
}
