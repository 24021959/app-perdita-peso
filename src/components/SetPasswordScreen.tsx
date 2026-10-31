"use client";

import { useState } from "react";
import { APP_NAME, OWNER_EMAIL } from "@/lib/config";
import { setPassword } from "@/lib/sync";

/** Dopo il link via email: una pagina semplice per scegliere la password. */
export default function SetPasswordScreen({ onSkip }: { onSkip: () => void }) {
  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const tooShort = one.length > 0 && one.length < 8;
  const mismatch = two.length > 0 && one !== two;

  async function save() {
    setBusy(true);
    setMsg("");
    const err = await setPassword(one);
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
        <p className="mt-1 text-muted">Scegli la tua password</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (one.length >= 8 && one === two) void save();
        }}
        className="space-y-4 rounded-2xl bg-peach p-4 text-peach-ink"
      >
        <p className="text-sm opacity-80">
          Da ora, per entrare, ti basterà questa password. Usane una lunga, che non usi altrove (almeno 8 caratteri).
        </p>
        <input type="email" name="email" autoComplete="username" defaultValue={OWNER_EMAIL} hidden readOnly />
        <label className="block">
          <span className="text-sm opacity-80">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            autoFocus
            value={one}
            onChange={(e) => setOne(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
          />
        </label>
        <label className="block">
          <span className="text-sm opacity-80">Scrivila di nuovo</span>
          <input
            type="password"
            autoComplete="new-password"
            value={two}
            onChange={(e) => setTwo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
          />
        </label>
        {tooShort && <p className="text-sm font-medium text-rose-ink">Troppo corta: servono almeno 8 caratteri.</p>}
        {mismatch && <p className="text-sm font-medium text-rose-ink">Le due password non coincidono.</p>}
        {msg && (
          <p role="alert" className="text-sm font-medium text-rose-ink">
            {msg}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || one.length < 8 || one !== two}
          className="w-full rounded-xl bg-accent py-4 text-lg font-semibold text-on-accent disabled:opacity-50"
        >
          {busy ? "Salvo…" : "Salva e entra"}
        </button>
        <button type="button" onClick={onSkip} className="w-full text-center text-sm underline">
          Più tardi
        </button>
      </form>
    </main>
  );
}
