"use client";

import { useMemo, useState } from "react";
import PageBanner from "@/components/PageBanner";
import { addDays, shortDate, todayKey, weekStart } from "@/lib/dates";
import { TONES, type Tone } from "@/lib/sections";
import { useMeta } from "@/lib/useMeta";
import {
  DAY_NAMES,
  baseWeek,
  breakfastOf,
  generateWeek,
  lunchOf,
  shoppingList,
  swapMeal,
} from "@/lib/menu";
import type { MenuPlan } from "@/lib/types";

export default function MenuPage() {
  const thisWeek = weekStart(todayKey());
  const [which, setWhich] = useState<0 | 1>(0);
  const ws = addDays(thisWeek, which * 7);
  return <WeekMenu key={ws} ws={ws} isCurrent={which === 0} setWhich={setWhich} />;
}

function WeekMenu({
  ws,
  isCurrent,
  setWhich,
}: {
  ws: string;
  isCurrent: boolean;
  setWhich: (n: 0 | 1) => void;
}) {
  const [saved, savePlan, ready] = useMeta<MenuPlan | null>(`menu:${ws}`, null);
  const [checked, saveChecked] = useMeta<string[]>(`spesa:${ws}`, []);
  const [showShop, setShowShop] = useState(false);

  const plan = saved ?? baseWeek(ws);
  const shop = useMemo(() => shoppingList(plan), [plan]);
  const todayIdx = (new Date().getDay() + 6) % 7;

  if (!ready) return <p className="text-muted">Carico…</p>;

  const toggle = (name: string) =>
    saveChecked(checked.includes(name) ? checked.filter((x) => x !== name) : [...checked, name]);

  return (
    <div className="space-y-5">
      <PageBanner section="menu" title="Menu della settimana">
        Colazione dopo le 8:00, pranzo entro le 16:00.
      </PageBanner>

      <div className="grid grid-cols-2 gap-2">
        {[
          { n: 0 as const, t: "Questa settimana" },
          { n: 1 as const, t: "Prossima" },
        ].map((o) => (
          <button
            key={o.n}
            type="button"
            onClick={() => setWhich(o.n)}
            className={`rounded-xl border py-2 ${
              (o.n === 0) === isCurrent ? "bg-accent text-on-accent border-accent" : "bg-card border-line"
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">
        Settimana dal {shortDate(ws)} al {shortDate(addDays(ws, 6))}.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => savePlan(generateWeek(ws))}
          className="rounded-xl bg-accent text-on-accent py-3 font-semibold"
        >
          Rigenera il menu
        </button>
        <button
          type="button"
          onClick={() => {
            void savePlan(baseWeek(ws));
            void saveChecked([]);
          }}
          className="rounded-xl border border-line bg-card py-3"
        >
          Torna al menu base
        </button>
      </div>

      <ul className="space-y-3">
        {plan.days.map((d, i) => (
          <li
            key={i}
            className={`rounded-2xl bg-card border p-4 ${
              isCurrent && i === todayIdx ? "border-accent" : "border-line"
            }`}
          >
            <p className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${TONES[i % TONES.length].chip}`}>
                {DAY_NAMES[i]}
              </span>
              {isCurrent && i === todayIdx && <span className="text-accent text-sm font-medium">oggi</span>}
            </p>
            <MealRow
              tone={TONES[2]}
              label="Colazione"
              text={breakfastOf(d.breakfast).name}
              onSwap={() => savePlan(swapMeal(plan, i, "breakfast"))}
            />
            <MealRow
              tone={TONES[0]}
              label="Pranzo"
              text={lunchOf(d.lunch).name}
              onSwap={() => savePlan(swapMeal(plan, i, "lunch"))}
            />
          </li>
        ))}
      </ul>

      <section className="rounded-2xl bg-butter text-butter-ink p-4">
        <button
          type="button"
          onClick={() => setShowShop((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-lg font-semibold">Lista della spesa</span>
          <span className="text-accent">{showShop ? "Chiudi" : "Apri"}</span>
        </button>
        {showShop && (
          <>
            <p className="text-sm text-muted mt-1">
              Il numero indica in quanti pasti serve l&apos;ingrediente. Per gli insaccati controlla in etichetta che
              non ci siano zuccheri o destrosio.
            </p>
            <ul className="mt-3 divide-y divide-line">
              {shop.map((it) => (
                <li key={it.name}>
                  <label className="flex items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked.includes(it.name)}
                      onChange={() => toggle(it.name)}
                      className="h-5 w-5 accent-[var(--accent)]"
                    />
                    <span className={checked.includes(it.name) ? "line-through text-muted" : ""}>
                      {it.name}
                    </span>
                    <span className="ml-auto text-sm text-muted">×{it.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="text-xs text-muted">
        Porzioni indicative: 150-180 g di carne o pesce a pranzo, verdura libera, olio 1-2 cucchiai. Vedi il
        documento &quot;menu base&quot; nel Progetto per i dettagli.
      </p>
    </div>
  );
}

function MealRow({
  label,
  text,
  tone,
  onSwap,
}: {
  label: string;
  text: string;
  tone: Tone;
  onSwap: () => void;
}) {
  return (
    <div className={`mt-3 flex items-start gap-3 rounded-xl p-3 ${tone.soft}`}>
      <div className="flex-1">
        <p className={`text-xs uppercase tracking-wide ${tone.ink}`}>{label}</p>
        <p>{text}</p>
      </div>
      <button
        type="button"
        onClick={onSwap}
        aria-label={`Cambia ${label.toLowerCase()}`}
        className="shrink-0 rounded-lg border border-line bg-card px-3 py-2 text-sm text-accent"
      >
        Cambia
      </button>
    </div>
  );
}
