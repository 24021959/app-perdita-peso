"use client";

import { useState, useSyncExternalStore } from "react";
import { GROUP_LABEL, type FoodGroup } from "@/lib/recipes";
import { shoppingList, shoppingText } from "@/lib/menu";
import { addDays, shortDate } from "@/lib/dates";
import { useMeta } from "@/lib/useMeta";
import { sendShoppingEmail } from "@/lib/sync";
import { useSyncStatus } from "@/lib/useSync";
import type { MenuPlan } from "@/lib/types";

const ORDER: FoodGroup[] = ["carne-pesce", "uova-latticini", "verdura-frutta", "dispensa"];
const subscribe = () => () => {};
const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

export default function ShoppingList({
  plan,
  checked,
  onToggle,
}: {
  plan: MenuPlan;
  checked: string[];
  onToggle: (item: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [savedTo, saveTo] = useMeta<string>("shopEmail", "");
  const { email: accountEmail } = useSyncStatus();
  const to = savedTo || accountEmail || "";
  const share = useSyncExternalStore(subscribe, canShare, () => false);
  const validTo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to);

  const lines = shoppingList(plan);
  const subject = `Lista della spesa, settimana dal ${shortDate(plan.weekStart)} al ${shortDate(addDays(plan.weekStart, 6))}`;
  const text = () => shoppingText(plan, checked);

  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    text().replace(/\n/g, "\r\n"),
  )}`;

  async function send() {
    if (!validTo) {
      setState("error");
      setMsg("Scrivi un indirizzo email valido.");
      return;
    }
    setState("sending");
    setMsg("");
    const r = await sendShoppingEmail(to, subject, text());
    if (r.ok) {
      setState("sent");
      setMsg(`Lista inviata a ${to}. Controlla la posta (e lo spam, la prima volta).`);
    } else {
      setState("error");
      setMsg(r.error);
    }
  }

  async function doShare() {
    try {
      await navigator.share({ title: subject, text: text() });
    } catch {
      /* annullato dall'utente */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text());
      setMsg("Lista copiata: puoi incollarla dove vuoi.");
    } catch {
      setMsg("Non riesco a copiare da questo browser.");
    }
  }

  return (
    <section className="rounded-2xl bg-butter text-butter-ink p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <span className="text-lg font-semibold">🛒 Lista della spesa</span>
        <span className="font-medium">{open ? "Chiudi" : "Apri"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <p className="text-sm opacity-80">
            Quantità totali per una persona, colazione e pranzo, per 7 giorni. Per gli insaccati controlla in etichetta
            che non ci siano zuccheri o destrosio.
          </p>

          {ORDER.map((grp) => {
            const rows = lines.filter((l) => l.group === grp);
            if (!rows.length) return null;
            return (
              <div key={grp} className="rounded-xl bg-card text-foreground p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{GROUP_LABEL[grp]}</p>
                <ul className="mt-1 divide-y divide-line">
                  {rows.map((r) => (
                    <li key={r.item}>
                      <label className="flex items-center gap-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={checked.includes(r.item)}
                          onChange={() => onToggle(r.item)}
                          className="h-5 w-5 accent-[var(--accent)]"
                        />
                        <span className={checked.includes(r.item) ? "line-through text-muted" : ""}>{r.item}</span>
                        <span className="ml-auto text-sm text-muted">
                          {r.pantry ? "da avere in casa" : r.amount}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="rounded-xl bg-card text-foreground p-3 space-y-3">
            <p className="font-semibold">Invia la lista</p>
            <label className="block">
              <span className="text-sm text-muted">Indirizzo email a cui inviarla</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={savedTo}
                placeholder={accountEmail ?? "nome@esempio.it"}
                onChange={(e) => void saveTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
              />
              <span className="mt-1 block text-xs text-muted">
                {savedTo && validTo
                  ? "✓ Indirizzo salvato: lo ritrovi la prossima volta, anche sugli altri dispositivi."
                  : accountEmail && !savedTo
                    ? "Se non scrivi nulla uso l'email con cui hai fatto l'accesso."
                    : "Si salva da solo mentre scrivi."}
              </span>
            </label>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={send}
                disabled={state === "sending"}
                className="w-full rounded-xl bg-accent text-on-accent py-4 text-lg font-semibold disabled:opacity-60"
              >
                {state === "sending" ? "Invio in corso…" : "✉️ Invia per email"}
              </button>
              <div className={`grid gap-2 ${share ? "grid-cols-3" : "grid-cols-2"}`}>
                <a
                  href={mailto}
                  onClick={() => setMsg("Si apre la tua app di posta con la lista già scritta: premi Invia.")}
                  className="rounded-xl border border-line py-3 text-center text-sm"
                >
                  Apri nella posta
                </a>
                {share && (
                  <button type="button" onClick={doShare} className="rounded-xl border border-line py-3 text-sm">
                    Condividi
                  </button>
                )}
                <button type="button" onClick={copy} className="rounded-xl border border-line py-3 text-sm">
                  Copia
                </button>
              </div>
            </div>
            <p className="text-xs text-muted">
              Le voci già spuntate non vengono inviate. &quot;Invia per email&quot; spedisce la lista direttamente, serve
              l&apos;accesso online; &quot;Apri nella posta&quot; la prepara invece nella tua app di posta.
            </p>
            {msg && <p className={`text-sm font-medium ${state === "error" ? "text-rose-ink" : "text-accent"}`}>{msg}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
