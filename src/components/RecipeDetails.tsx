import { recipeOf } from "@/lib/recipes";

/** Scheda apribile con quantità, preparazione e valori di un piatto. */
export default function RecipeDetails({ id }: { id: string }) {
  const r = recipeOf(id);
  if (!r) return null;
  return (
    <details className="group mt-2">
      <summary className="cursor-pointer select-none text-sm font-medium text-accent list-none">
        <span className="group-open:hidden">Ricetta e valori ›</span>
        <span className="hidden group-open:inline">Chiudi la ricetta ‹</span>
      </summary>
      <div className="mt-3 space-y-3 rounded-xl bg-card p-3 text-foreground">
        <p className="text-sm text-muted">{r.minutes} minuti · 1 porzione</p>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ingredienti</p>
          <ul className="mt-1 space-y-0.5">
            {r.ingredients.map((i) => (
              <li key={i.name} className="flex justify-between gap-3 border-b border-line py-1 last:border-0">
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
    </details>
  );
}
