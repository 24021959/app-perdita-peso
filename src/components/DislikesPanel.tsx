"use client";

import { useState } from "react";
import { GROUP_LABEL, allFoods, type FoodGroup } from "@/lib/recipes";
import { poolSizes } from "@/lib/menu";

const ORDER: FoodGroup[] = ["carne-pesce", "uova-latticini", "verdura-frutta", "dispensa"];

export default function DislikesPanel({
  dislikes,
  onToggle,
  onClear,
}: {
  dislikes: string[];
  onToggle: (item: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const foods = allFoods();
  const sizes = poolSizes(dislikes);
  const tooFew = dislikes.length > 0 && (sizes.breakfast < 3 || sizes.lunch < 3);

  return (
    <section className="rounded-2xl bg-rose text-rose-ink p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <span className="text-lg font-semibold">
          🚫 Alimenti che non mi piacciono
          {dislikes.length > 0 && (
            <span className="ml-2 rounded-full bg-rose-ink px-2 py-0.5 text-sm text-card">{dislikes.length}</span>
          )}
        </span>
        <span className="font-medium">{open ? "Chiudi" : "Scegli"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-sm opacity-90">
            Tocca gli alimenti da evitare: i piatti che li contengono vengono sostituiti nel menu e non compaiono più
            quando rigeneri o cambi un piatto.
          </p>
          {ORDER.map((grp) => {
            const list = foods[grp];
            if (!list.length) return null;
            return (
              <div key={grp}>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{GROUP_LABEL[grp]}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {list.map((item) => {
                    const on = dislikes.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={on}
                        onClick={() => onToggle(item)}
                        className={`rounded-full border px-3 py-1.5 text-sm ${
                          on ? "bg-rose-ink text-card border-rose-ink line-through" : "bg-card text-foreground border-line"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-sm">
            Con queste scelte restano <strong>{sizes.breakfast}</strong> colazioni e <strong>{sizes.lunch}</strong> pranzi.
          </p>
          {tooFew && (
            <p className="rounded-xl bg-card text-foreground p-3 text-sm">
              Sono pochi: il menu ripeterà gli stessi piatti, e se non resta nulla userà anche quelli esclusi. Ti
              conviene togliere qualche alimento.
            </p>
          )}
          {dislikes.length > 0 && (
            <button type="button" onClick={onClear} className="text-sm font-medium underline">
              Togli tutte le esclusioni
            </button>
          )}
        </div>
      )}
    </section>
  );
}
