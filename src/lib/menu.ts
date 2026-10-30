import { addDays } from "./dates";
import type { MenuPlan } from "./types";

export type Meal = { id: string; name: string; items: string[] };

// Piatti dal documento "menu base" (b1-b7, l1-l7) più alcune alternative nello stesso stile.
export const BREAKFASTS: Meal[] = [
  { id: "b1", name: "2 uova strapazzate con olio evo, mezzo avocado, caffè", items: ["uova", "olio extravergine", "avocado", "caffè"] },
  { id: "b2", name: "Yogurt greco bianco (150 g) con noci", items: ["yogurt greco bianco", "noci"] },
  { id: "b3", name: "Frittata con spinaci e parmigiano", items: ["uova", "spinaci", "parmigiano"] },
  { id: "b4", name: "Prosciutto crudo, mozzarella, 3-4 pomodorini", items: ["prosciutto crudo", "mozzarella", "pomodorini"] },
  { id: "b5", name: "2 uova sode, salmone affumicato, cetrioli", items: ["uova", "salmone affumicato", "cetrioli"] },
  { id: "b6", name: "Ricotta con mandorle e cannella", items: ["ricotta", "mandorle", "cannella"] },
  { id: "b7", name: "Uova al tegamino con funghi", items: ["uova", "funghi", "olio extravergine"] },
  { id: "b8", name: "Bresaola con rucola e scaglie di grana", items: ["bresaola", "rucola", "grana"] },
  { id: "b9", name: "Frittata di zucchine e formaggio stagionato", items: ["uova", "zucchine", "formaggio stagionato"] },
];

export const LUNCHES: Meal[] = [
  { id: "l1", name: "Salmone al forno con asparagi e olio evo", items: ["salmone", "asparagi", "olio extravergine"] },
  { id: "l2", name: "Petto di pollo alla piastra con insalata mista e olive", items: ["petto di pollo", "insalata mista", "olive"] },
  { id: "l3", name: "Merluzzo al vapore con zucchine trifolate", items: ["merluzzo", "zucchine", "olio extravergine"] },
  { id: "l4", name: "Bistecca di manzo con broccoli saltati", items: ["bistecca di manzo", "broccoli", "olio extravergine"] },
  { id: "l5", name: "Orata al forno con finocchi", items: ["orata", "finocchi", "olio extravergine"] },
  { id: "l6", name: "Tacchino alla piastra con cavolfiore gratinato (solo formaggio)", items: ["fesa di tacchino", "cavolfiore", "parmigiano"] },
  { id: "l7", name: "Branzino al cartoccio con bietole e olio evo", items: ["branzino", "bietole", "olio extravergine"] },
  { id: "l8", name: "Sgombro alla griglia con insalata di cetrioli", items: ["sgombro", "cetrioli", "olio extravergine"] },
  { id: "l9", name: "Hamburger di manzo senza pane con insalata e avocado", items: ["macinato di manzo", "insalata mista", "avocado"] },
  { id: "l10", name: "Spiedini di pollo e zucchine", items: ["petto di pollo", "zucchine", "olio extravergine"] },
];

export const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

const byId = (list: Meal[], id: string) => list.find((m) => m.id === id) ?? list[0];
export const breakfastOf = (id: string) => byId(BREAKFASTS, id);
export const lunchOf = (id: string) => byId(LUNCHES, id);

export function baseWeek(weekStartKey: string): MenuPlan {
  return {
    weekStart: weekStartKey,
    days: Array.from({ length: 7 }, (_, i) => ({ breakfast: `b${i + 1}`, lunch: `l${i + 1}` })),
  };
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Nuova settimana: 7 colazioni e 7 pranzi diversi tra loro. */
export function generateWeek(weekStartKey: string): MenuPlan {
  const b = shuffle(BREAKFASTS).slice(0, 7);
  const l = shuffle(LUNCHES).slice(0, 7);
  return {
    weekStart: weekStartKey,
    days: b.map((m, i) => ({ breakfast: m.id, lunch: l[i].id })),
  };
}

/** Sostituisce un solo piatto con un altro dello stesso tipo non già in settimana, se possibile. */
export function swapMeal(plan: MenuPlan, day: number, kind: "breakfast" | "lunch"): MenuPlan {
  const pool = kind === "breakfast" ? BREAKFASTS : LUNCHES;
  const used = new Set(plan.days.map((d) => d[kind]));
  const free = pool.filter((m) => !used.has(m.id));
  const choices = free.length ? free : pool.filter((m) => m.id !== plan.days[day][kind]);
  const pick = choices[Math.floor(Math.random() * choices.length)];
  return {
    ...plan,
    days: plan.days.map((d, i) => (i === day ? { ...d, [kind]: pick.id } : d)),
  };
}

export type ShopItem = { name: string; count: number };

export function shoppingList(plan: MenuPlan): ShopItem[] {
  const map = new Map<string, number>();
  for (const d of plan.days) {
    for (const name of [...breakfastOf(d.breakfast).items, ...lunchOf(d.lunch).items]) {
      map.set(name, (map.get(name) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
}

export const nextWeek = (weekStartKey: string) => addDays(weekStartKey, 7);
