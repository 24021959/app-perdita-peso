"use client";

import { useState } from "react";
import DislikesPanel from "@/components/DislikesPanel";
import PageBanner from "@/components/PageBanner";
import RecipeDetails from "@/components/RecipeDetails";
import ShoppingList from "@/components/ShoppingList";
import { addDays, shortDate, todayKey, weekStart } from "@/lib/dates";
import { TONES, type Tone } from "@/lib/sections";
import { useMeta } from "@/lib/useMeta";
import {
  DAY_NAMES,
  applyDislikes,
  baseWeek,
  breakfastOf,
  countDisliked,
  generateWeek,
  lunchOf,
  swapMeal,
} from "@/lib/menu";
import { CARB_LIMIT, KCAL_TARGET, PROTEIN_TARGET, dayTotals } from "@/lib/recipes";
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
  const [dislikes, saveDislikes, dislikesReady] = useMeta<string[]>("dislikes", []);
  const [openAll, setOpenAll] = useState(false);

  const plan = saved ?? baseWeek(ws, dislikes);
  const offending = saved ? countDisliked(saved, dislikes) : 0;
  const todayIdx = (new Date().getDay() + 6) % 7;

  if (!ready || !dislikesReady) return <p className="text-muted">Carico…</p>;

  const toggleChecked = (item: string) =>
    saveChecked(checked.includes(item) ? checked.filter((x) => x !== item) : [...checked, item]);

  function toggleDislike(item: string) {
    const next = dislikes.includes(item) ? dislikes.filter((x) => x !== item) : [...dislikes, item];
    void saveDislikes(next);
    // la settimana che si sta guardando si aggiorna subito
    if (saved && next.length && !dislikes.includes(item)) void savePlan(applyDislikes(saved, next));
  }

  return (
    <div className="space-y-5">
      <PageBanner section="menu" title="Menu della settimana">
        Colazione dopo le 8:00, pranzo entro le 16:00. Ogni piatto ha la sua ricetta.
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
          onClick={() => savePlan(generateWeek(ws, dislikes))}
          className="rounded-xl bg-accent text-on-accent py-3 font-semibold"
        >
          Rigenera il menu
        </button>
        <button
          type="button"
          onClick={() => {
            void savePlan(baseWeek(ws, dislikes));
            void saveChecked([]);
          }}
          className="rounded-xl border border-line bg-card py-3"
        >
          Torna al menu base
        </button>
      </div>

      <DislikesPanel
        dislikes={dislikes}
        onToggle={toggleDislike}
        onClear={() => void saveDislikes([])}
      />

      {offending > 0 && saved && (
        <div className="rounded-2xl bg-butter text-butter-ink p-4 space-y-2">
          <p>
            {offending === 1 ? "Un piatto di questa settimana contiene" : `${offending} piatti di questa settimana contengono`}{" "}
            alimenti che non ti piacciono.
          </p>
          <button
            type="button"
            onClick={() => void savePlan(applyDislikes(saved, dislikes))}
            className="rounded-xl bg-accent text-on-accent px-4 py-2 font-semibold"
          >
            Sostituisci
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpenAll((v) => !v)}
        className="w-full rounded-xl border border-accent bg-card py-3 font-semibold text-accent"
      >
        {openAll ? "Chiudi tutte le ricette" : "📖 Apri tutte le ricette"}
      </button>

      <ul className="space-y-3">
        {plan.days.map((d, i) => (
          <li
            key={`${i}-${d.breakfast}-${d.lunch}`}
            className={`rounded-2xl bg-card border p-4 ${isCurrent && i === todayIdx ? "border-accent" : "border-line"}`}
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
              recipeId={d.breakfast}
              text={breakfastOf(d.breakfast).name}
              openAll={openAll}
              onSwap={() => savePlan(swapMeal(plan, i, "breakfast", dislikes))}
            />
            <MealRow
              tone={TONES[0]}
              label="Pranzo"
              recipeId={d.lunch}
              text={lunchOf(d.lunch).name}
              openAll={openAll}
              onSwap={() => savePlan(swapMeal(plan, i, "lunch", dislikes))}
            />
            <DayTotals ids={[d.breakfast, d.lunch]} />
          </li>
        ))}
      </ul>

      <ShoppingList plan={plan} checked={checked} onToggle={toggleChecked} />

      <p className="text-xs text-muted">
        Porzioni indicative: 220-250 g di carne o pesce a pranzo, verdura libera, olio 4-6 cucchiaini (circa 2
        cucchiai), avocado e frutta secca. Vedi il documento &quot;menu base&quot; nel Progetto per i dettagli.
      </p>
      <p className="rounded-2xl bg-mint text-mint-ink p-4 text-sm">
        I menu valgono circa {KCAL_TARGET.toLocaleString("it-IT", { useGrouping: "always" })} kcal al giorno (colazione 650-700, pranzo 980-1.050),
        con circa 100 g di proteine e meno di 30 g di carboidrati netti. È una stima per un uomo di 67 anni di 95 kg
        con poca attività: il fabbisogno è di circa 2.200 kcal, quindi la differenza porta a perdere circa mezzo
        chilo a settimana. Se hai fame, o perdi più di 1 kg a settimana, aggiungi un cucchiaio d&apos;olio o una
        manciata di noci. Fai confermare le quantità dal medico: i grassi sono soprattutto olio, pesce, avocado e
        frutta secca, ma conviene controllare colesterolo e trigliceridi con gli esami.
      </p>
    </div>
  );
}

function MealRow({
  label,
  text,
  tone,
  recipeId,
  openAll,
  onSwap,
}: {
  label: string;
  text: string;
  tone: Tone;
  recipeId: string;
  openAll: boolean;
  onSwap: () => void;
}) {
  return (
    <div className={`mt-3 rounded-xl p-3 ${tone.soft}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
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
      <RecipeDetails key={`${recipeId}-${openAll}`} id={recipeId} openAll={openAll} />
    </div>
  );
}

function DayTotals({ ids }: { ids: [string, string] }) {
  const t = dayTotals(ids[0], ids[1]);
  const missing = PROTEIN_TARGET - t.protein;
  return (
    <div className="mt-3 rounded-xl border border-line px-3 py-2 text-sm">
      <p>
        <span className="text-muted">Totale del giorno: </span>
        <strong>{t.kcal} kcal</strong> · proteine <strong>{t.protein} g</strong> · carboidrati netti{" "}
        <strong className={t.carbs > CARB_LIMIT ? "text-rose-ink" : ""}>{t.carbs} g</strong>
      </p>
      {missing > 0 && (
        <p className="mt-1 text-xs text-muted">
          Mancano circa {missing} g di proteine all&apos;obiettivo di {PROTEIN_TARGET} g: ad esempio un uovo in più
          (6 g) o 50 g di pollo (12 g) in più.
        </p>
      )}
    </div>
  );
}
