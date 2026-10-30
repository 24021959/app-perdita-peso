"use client";

import { useState } from "react";
import { recipeOf } from "@/lib/recipes";

/** Ricetta di un piatto: ingredienti con quantità, preparazione e valori. `openAll` la tiene aperta. */
export default function RecipeDetails({ id, openAll = false }: { id: string; openAll?: boolean }) {
  const [open, setOpen] = useState(openAll);
  const r = recipeOf(id);
  if (!r) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-accent bg-card px-4 py-2 text-sm font-semibold text-accent"
      >
        {open ? "Chiudi la ricetta" : "📖 Vedi la ricetta"}
      </button>
      {open && (
        <div className="mt-3 space-y-3 rounded-xl bg-card p-3 text-foreground">
          <p className="text-sm text-muted">{r.minutes} minuti · 1 porzione</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ingredienti</p>
            <ul className="mt-1">
              {r.ingredients.map((i) => (
                <li key={i.item + i.name} className="flex justify-between gap-3 border-b border-line py-1 last:border-0">
                  <span>{i.name}</span>
                  <span className="text-muted text-right">{i.qty}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preparazione</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {r.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div className="rounded-lg bg-peach text-peach-ink py-2">
              <p className="font-semibold">{r.macros.kcal}</p>
              <p className="text-xs">kcal</p>
            </div>
            <div className="rounded-lg bg-rose text-rose-ink py-2">
              <p className="font-semibold">{r.macros.protein} g</p>
              <p className="text-xs">proteine</p>
            </div>
            <div className="rounded-lg bg-butter text-butter-ink py-2">
              <p className="font-semibold">{r.macros.fat} g</p>
              <p className="text-xs">grassi</p>
            </div>
            <div className="rounded-lg bg-sky text-sky-ink py-2">
              <p className="font-semibold">{r.macros.carbs} g</p>
              <p className="text-xs">carbo netti</p>
            </div>
          </div>
          <p className="text-xs text-muted">Valori stimati e arrotondati: servono come orientamento.</p>
        </div>
      )}
    </div>
  );
}
