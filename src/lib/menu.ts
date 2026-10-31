import { addDays, shortDate } from "./dates";
import { GROUP_LABEL, RECIPES, groupOf, itemsOf, type FoodGroup } from "./recipes";
import type { MenuPlan } from "./types";

export type Meal = { id: string; name: string };

// Piatti dal documento "menu base" (b1-b7, l1-l7) più alternative nello stesso stile.
// Ingredienti, quantità e preparazione di ogni piatto sono in recipes.ts, con lo stesso id.
export const BREAKFASTS: Meal[] = [
  { id: "b1", name: "3 uova strapazzate con olio evo, parmigiano, un avocado, caffè" },
  { id: "b2", name: "Yogurt greco bianco (250 g) con noci e mandorle" },
  { id: "b3", name: "Frittata di 3 uova con spinaci e parmigiano, con avocado" },
  { id: "b4", name: "Prosciutto crudo, mozzarella, pomodorini e olive" },
  { id: "b5", name: "3 uova sode, salmone affumicato, cetrioli e avocado" },
  { id: "b6", name: "Ricotta con mandorle, noci e cannella" },
  { id: "b7", name: "3 uova al tegamino con funghi, avocado e parmigiano" },
  { id: "b8", name: "Bresaola con rucola, grana, avocado e 2 uova sode" },
  { id: "b9", name: "Frittata di 3 uova, zucchine e formaggio stagionato, con avocado" },
  { id: "b10", name: "Yogurt greco bianco con mandorle, noci e cannella" },
  { id: "b11", name: "3 uova alla coque con avocado e prosciutto crudo" },
  { id: "b12", name: "Prosciutto crudo, avocado, cetrioli e 2 uova sode" },
];

export const LUNCHES: Meal[] = [
  { id: "l1", name: "Salmone al forno (250 g) con asparagi e avocado" },
  { id: "l2", name: "Petto di pollo alla piastra con insalata mista, olive, avocado e noci" },
  { id: "l3", name: "Merluzzo al vapore con zucchine trifolate, avocado e mandorle" },
  { id: "l4", name: "Bistecca di manzo (250 g) con broccoli saltati e avocado" },
  { id: "l5", name: "Orata al forno con finocchi, olive, mandorle e avocado" },
  { id: "l6", name: "Tacchino alla piastra con cavolfiore gratinato (solo formaggio) e noci" },
  { id: "l7", name: "Branzino al cartoccio con bietole, noci e avocado" },
  { id: "l8", name: "Sgombro alla griglia (250 g) con insalata di cetrioli, olive e avocado" },
  { id: "l9", name: "Hamburger di manzo (250 g) senza pane con uovo, insalata e avocado" },
  { id: "l10", name: "Spiedini di pollo e zucchine con avocado e noci" },
  { id: "l11", name: "Petto di pollo al limone con spinaci saltati, parmigiano e mandorle" },
  { id: "l12", name: "Frittata di 3 uova con funghi, parmigiano e avocado" },
  { id: "l13", name: "Tonno alla piastra (250 g) con rucola, pomodorini, avocado e noci" },
  { id: "l14", name: "Scaloppine di vitello al limone con asparagi, avocado, parmigiano e noci" },
];

export const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

const byId = (list: Meal[], id: string) => list.find((m) => m.id === id) ?? list[0];
export const breakfastOf = (id: string) => byId(BREAKFASTS, id);
export const lunchOf = (id: string) => byId(LUNCHES, id);

// ---------------------------------------------------------------- alimenti da evitare
const hasDisliked = (id: string, set: Set<string>) => itemsOf(id).some((i) => set.has(i));

/** Piatti che non contengono nessuno degli alimenti da evitare. */
export function eligible(meals: Meal[], dislikes: string[]): Meal[] {
  const s = new Set(dislikes);
  return meals.filter((m) => !hasDisliked(m.id, s));
}

/** Quanti piatti restano disponibili per colazione e pranzo con queste esclusioni. */
export function poolSizes(dislikes: string[]) {
  return { breakfast: eligible(BREAKFASTS, dislikes).length, lunch: eligible(LUNCHES, dislikes).length };
}

/** Quanti piatti della settimana contengono alimenti da evitare. */
export function countDisliked(plan: MenuPlan, dislikes: string[]): number {
  if (!dislikes.length) return 0;
  const s = new Set(dislikes);
  return plan.days.reduce((n, d) => n + (hasDisliked(d.breakfast, s) ? 1 : 0) + (hasDisliked(d.lunch, s) ? 1 : 0), 0);
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------- settimana
export function baseWeek(weekStartKey: string, dislikes: string[] = []): MenuPlan {
  const s = new Set(dislikes);
  const takenB = new Set(Array.from({ length: 7 }, (_, i) => `b${i + 1}`).filter((id) => !hasDisliked(id, s)));
  const takenL = new Set(Array.from({ length: 7 }, (_, i) => `l${i + 1}`).filter((id) => !hasDisliked(id, s)));
  const pickAlt = (pool: Meal[], taken: Set<string>, original: string) => {
    const free = eligible(pool, dislikes).filter((m) => !taken.has(m.id));
    const any = eligible(pool, dislikes);
    const alt = free[0] ?? any[0];
    if (!alt) return original; // tutto escluso: si lascia il piatto del documento
    taken.add(alt.id);
    return alt.id;
  };
  return {
    weekStart: weekStartKey,
    days: Array.from({ length: 7 }, (_, i) => {
      const b = `b${i + 1}`;
      const l = `l${i + 1}`;
      return {
        breakfast: hasDisliked(b, s) ? pickAlt(BREAKFASTS, takenB, b) : b,
        lunch: hasDisliked(l, s) ? pickAlt(LUNCHES, takenL, l) : l,
      };
    }),
  };
}

/** Nuova settimana: piatti diversi tra loro, senza gli alimenti da evitare (si ripetono se non bastano). */
export function generateWeek(weekStartKey: string, dislikes: string[] = []): MenuPlan {
  const fill = (meals: Meal[]) => {
    const e = eligible(meals, dislikes);
    const sh = shuffle(e.length ? e : meals);
    return Array.from({ length: 7 }, (_, i) => sh[i % sh.length]);
  };
  const b = fill(BREAKFASTS);
  const l = fill(LUNCHES);
  return { weekStart: weekStartKey, days: b.map((m, i) => ({ breakfast: m.id, lunch: l[i].id })) };
}

/** Sostituisce un solo piatto con un altro dello stesso tipo, preferibilmente non già in settimana. */
export function swapMeal(
  plan: MenuPlan,
  day: number,
  kind: "breakfast" | "lunch",
  dislikes: string[] = [],
): MenuPlan {
  const pool = eligible(kind === "breakfast" ? BREAKFASTS : LUNCHES, dislikes);
  const used = new Set(plan.days.map((d) => d[kind]));
  const free = pool.filter((m) => !used.has(m.id));
  const choices = free.length ? free : pool.filter((m) => m.id !== plan.days[day][kind]);
  if (!choices.length) return plan;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  return { ...plan, days: plan.days.map((d, i) => (i === day ? { ...d, [kind]: pick.id } : d)) };
}

/** Sostituisce i soli piatti che contengono alimenti da evitare. */
export function applyDislikes(plan: MenuPlan, dislikes: string[]): MenuPlan {
  const s = new Set(dislikes);
  let next = plan;
  for (let i = 0; i < 7; i++) {
    for (const kind of ["breakfast", "lunch"] as const) {
      if (hasDisliked(next.days[i][kind], s)) next = swapMeal(next, i, kind, dislikes);
    }
  }
  return next;
}

// ---------------------------------------------------------------- lista della spesa
export type ShopLine = { item: string; group: FoodGroup; amount: string; meals: number; pantry: boolean };

const GROUP_ORDER: FoodGroup[] = ["carne-pesce", "uova-latticini", "verdura-frutta", "dispensa"];

function amountText(a: { g: number; pz: number; spoons: number }): string {
  const parts: string[] = [];
  if (a.g) parts.push(a.g >= 1000 ? `${(a.g / 1000).toFixed(1).replace(".", ",")} kg` : `${a.g} g`);
  if (a.pz) parts.push(`${a.pz} pz`);
  if (a.spoons) parts.push(a.spoons === 1 ? "1 cucchiaino" : `${a.spoons} cucchiaini`);
  return parts.join(" + ") || "q.b.";
}

/** Quantità totali della settimana, ingrediente per ingrediente. */
export function shoppingList(plan: MenuPlan): ShopLine[] {
  const acc = new Map<string, { g: number; pz: number; spoons: number; meals: number }>();
  for (const d of plan.days) {
    for (const id of [d.breakfast, d.lunch]) {
      for (const ing of RECIPES[id]?.ingredients ?? []) {
        const a = acc.get(ing.item) ?? { g: 0, pz: 0, spoons: 0, meals: 0 };
        a.g += ing.g ?? 0;
        a.pz += ing.pz ?? 0;
        a.spoons += ing.spoons ?? 0;
        a.meals += 1;
        acc.set(ing.item, a);
      }
    }
  }
  return [...acc.entries()]
    .map(([item, a]) => ({
      item,
      group: groupOf(item),
      amount: amountText(a),
      meals: a.meals,
      pantry: !a.g && !a.pz && !a.spoons,
    }))
    .sort(
      (x, y) =>
        GROUP_ORDER.indexOf(x.group) - GROUP_ORDER.indexOf(y.group) ||
        Number(x.pantry) - Number(y.pantry) ||
        x.item.localeCompare(y.item, "it"),
    );
}

/** Testo semplice della lista (per email, condivisione e copia). Le voci già spuntate si saltano. */
export function shoppingText(plan: MenuPlan, checked: string[] = []): string {
  const all = shoppingList(plan);
  const todo = all.filter((l) => !checked.includes(l.item));
  const lines = todo.length ? todo : all;
  const out = [`Lista della spesa, settimana dal ${shortDate(plan.weekStart)} al ${shortDate(addDays(plan.weekStart, 6))}`, ""];
  for (const grp of GROUP_ORDER) {
    const rows = lines.filter((l) => l.group === grp);
    if (!rows.length) continue;
    out.push(GROUP_LABEL[grp].toUpperCase());
    for (const r of rows) out.push(`- ${r.item}${r.amount === "q.b." ? " (q.b., da avere in casa)" : `: ${r.amount}`}`);
    out.push("");
  }
  out.push("Quantità per una persona, colazione e pranzo, per 7 giorni.");
  return out.join("\n");
}

export const nextWeek = (weekStartKey: string) => addDays(weekStartKey, 7);
