// Ricette dei piatti del menu (una porzione). Gli ingredienti hanno una chiave comune (`item`) usata per
// le esclusioni ("alimenti che non mi piacciono") e per la lista della spesa, con le quantità reali.
// I valori nutrizionali sono stime con tabelle standard, arrotondate: servono a farsi un'idea.

export type Macros = { kcal: number; protein: number; fat: number; carbs: number }; // carbs = netti (senza fibre)

export type Ingredient = {
  item: string; // chiave: "salmone", "uova", ...
  name: string; // come si legge nella ricetta
  qty: string; // quantità leggibile
  g?: number; // grammi
  pz?: number; // pezzi (uova)
  spoons?: number; // cucchiaini
  pantry?: boolean; // "q.b.": si segna tra le cose da avere in casa, senza quantità
};

export type Recipe = {
  minutes: number;
  ingredients: Ingredient[];
  steps: string[];
  macros: Macros;
};

export const PROTEIN_TARGET = 85; // g al giorno, valore di lavoro del documento (da confermare col medico)
export const CARB_LIMIT = 30; // g netti al giorno, valore di lavoro

const g = (item: string, grams: number, name = item, qty = `${grams} g`): Ingredient => ({ item, name, qty, g: grams });
const pz = (item: string, n: number, name = item): Ingredient => ({ item, name, qty: String(n), pz: n });
const oil = (n: number): Ingredient => ({
  item: "olio extravergine",
  name: "olio extravergine",
  qty: n === 1 ? "1 cucchiaino" : `${n} cucchiaini`,
  spoons: n,
});
const qb = (item: string, name = item): Ingredient => ({ item, name, qty: "q.b.", pantry: true });

export const RECIPES: Record<string, Recipe> = {
  // ---------------- colazioni
  b1: {
    minutes: 10,
    ingredients: [pz("uova", 2), oil(1), g("avocado", 70, "avocado", "mezzo (circa 70 g)"), qb("caffè", "caffè senza zucchero")],
    steps: [
      "Sbatti le uova con un pizzico di sale.",
      "Scalda l'olio in padella e cuoci le uova a fuoco basso, mescolando, per 2-3 minuti.",
      "Servi con l'avocado a fette e il caffè senza zucchero.",
    ],
    macros: { kcal: 300, protein: 14, fat: 25, carbs: 2 },
  },
  b2: {
    minutes: 2,
    ingredients: [g("yogurt greco bianco", 150, "yogurt greco bianco non zuccherato"), g("noci", 20, "noci", "20 g (3-4 gherigli)")],
    steps: [
      "Controlla in etichetta che lo yogurt non abbia zuccheri aggiunti.",
      "Versalo in una ciotola e spezzetta le noci sopra.",
    ],
    macros: { kcal: 250, protein: 18, fat: 16, carbs: 7 },
  },
  b3: {
    minutes: 12,
    ingredients: [pz("uova", 2), g("spinaci", 80, "spinaci freschi"), g("parmigiano", 20, "parmigiano grattugiato"), oil(1)],
    steps: [
      "Appassisci gli spinaci in padella con l'olio per 2 minuti.",
      "Sbatti le uova con il parmigiano e un pizzico di sale.",
      "Versale sugli spinaci e cuoci a fuoco basso con il coperchio per 4-5 minuti.",
      "Gira la frittata e falla dorare un minuto.",
    ],
    macros: { kcal: 285, protein: 22, fat: 20, carbs: 2 },
  },
  b4: {
    minutes: 5,
    ingredients: [
      g("prosciutto crudo", 50),
      g("mozzarella", 100),
      g("pomodorini", 40, "pomodorini", "3-4 (circa 40 g)"),
    ],
    steps: [
      "Controlla in etichetta che il prosciutto non contenga destrosio o zuccheri.",
      "Taglia mozzarella e pomodorini e servili con il prosciutto.",
    ],
    macros: { kcal: 380, protein: 32, fat: 27, carbs: 3 },
  },
  b5: {
    minutes: 12,
    ingredients: [pz("uova", 2), g("salmone affumicato", 50), g("cetrioli", 100)],
    steps: [
      "Cuoci le uova in acqua bollente per 9 minuti, raffreddale e sguscia.",
      "Affetta i cetrioli.",
      "Servi le uova con il salmone e i cetrioli.",
    ],
    macros: { kcal: 250, protein: 24, fat: 15, carbs: 3 },
  },
  b6: {
    minutes: 3,
    ingredients: [g("ricotta", 100), g("mandorle", 15), { item: "cannella", name: "cannella", qty: "1 cucchiaino", spoons: 1 }],
    steps: ["Metti la ricotta in una ciotola.", "Aggiungi le mandorle tritate grossolanamente e la cannella."],
    macros: { kcal: 235, protein: 11, fat: 19, carbs: 5 },
  },
  b7: {
    minutes: 10,
    ingredients: [pz("uova", 2), g("funghi", 100, "funghi champignon"), oil(1), qb("prezzemolo"), qb("sale")],
    steps: [
      "Salta i funghi a fette in padella con metà dell'olio per 4-5 minuti, poi mettili da parte.",
      "Cuoci le uova al tegamino con l'olio rimasto.",
      "Servi insieme, con prezzemolo e sale.",
    ],
    macros: { kcal: 210, protein: 16, fat: 15, carbs: 3 },
  },
  b8: {
    minutes: 5,
    ingredients: [g("bresaola", 60), g("rucola", 40), g("grana", 20, "grana in scaglie"), oil(1), qb("limone")],
    steps: [
      "Disponi la bresaola su un piatto con la rucola.",
      "Aggiungi le scaglie di grana, l'olio e qualche goccia di limone.",
    ],
    macros: { kcal: 230, protein: 27, fat: 12, carbs: 2 },
  },
  b9: {
    minutes: 15,
    ingredients: [pz("uova", 2), g("zucchine", 120), g("formaggio stagionato", 20, "formaggio stagionato grattugiato"), oil(1)],
    steps: [
      "Taglia le zucchine a rondelle e saltale in padella con l'olio per 5 minuti.",
      "Sbatti le uova con il formaggio e un pizzico di sale e versale sulle zucchine.",
      "Cuoci a fuoco basso con il coperchio 5 minuti, poi gira e dora un minuto.",
    ],
    macros: { kcal: 290, protein: 20, fat: 21, carbs: 4 },
  },
  b10: {
    minutes: 3,
    ingredients: [
      g("yogurt greco bianco", 150, "yogurt greco bianco non zuccherato"),
      g("mandorle", 15),
      { item: "cannella", name: "cannella", qty: "1 cucchiaino", spoons: 1 },
    ],
    steps: [
      "Controlla in etichetta che lo yogurt non abbia zuccheri aggiunti.",
      "Versalo in una ciotola, aggiungi le mandorle tritate e la cannella.",
    ],
    macros: { kcal: 210, protein: 18, fat: 11, carbs: 8 },
  },
  b11: {
    minutes: 10,
    ingredients: [pz("uova", 2), g("avocado", 70, "avocado", "mezzo (circa 70 g)"), qb("sale")],
    steps: [
      "Porta a ebollizione l'acqua e immergi le uova per 6 minuti (alla coque).",
      "Raffreddale un attimo sotto l'acqua fredda e aprile in una ciotola.",
      "Servi con l'avocado a fette e un pizzico di sale.",
    ],
    macros: { kcal: 255, protein: 14, fat: 20, carbs: 1 },
  },
  b12: {
    minutes: 5,
    ingredients: [g("prosciutto crudo", 50), g("avocado", 70, "avocado", "mezzo (circa 70 g)"), g("cetrioli", 100)],
    steps: [
      "Controlla in etichetta che il prosciutto non contenga destrosio o zuccheri.",
      "Taglia avocado e cetrioli a fette e servili con il prosciutto.",
    ],
    macros: { kcal: 252, protein: 16, fat: 18, carbs: 4 },
  },

  // ---------------- pranzi
  l1: {
    minutes: 25,
    ingredients: [g("salmone", 170, "filetto di salmone"), g("asparagi", 150), oil(2), qb("limone"), qb("sale")],
    steps: [
      "Scalda il forno a 200 °C. Elimina la parte dura degli asparagi.",
      "Metti salmone e asparagi su una teglia con carta forno, condisci con olio e sale.",
      "Inforna per 12-15 minuti.",
      "Servi con qualche goccia di limone.",
    ],
    macros: { kcal: 470, protein: 37, fat: 32, carbs: 3 },
  },
  l2: {
    minutes: 15,
    ingredients: [g("petto di pollo", 170), g("insalata mista", 100), g("olive", 30, "olive", "30 g (6-7)"), oil(2)],
    steps: [
      "Batti leggermente il petto di pollo per averlo di spessore uniforme.",
      "Cuoci sulla piastra calda 5-6 minuti per lato, poi sala.",
      "Condisci l'insalata con le olive e l'olio e servi col pollo.",
    ],
    macros: { kcal: 325, protein: 40, fat: 15, carbs: 3 },
  },
  l3: {
    minutes: 20,
    ingredients: [g("merluzzo", 200, "filetto di merluzzo"), g("zucchine", 200), oil(2), qb("aglio"), qb("prezzemolo"), qb("limone")],
    steps: [
      "Cuoci il merluzzo al vapore per 8-10 minuti.",
      "Taglia le zucchine a rondelle e trifolale in padella con olio e aglio per 8 minuti.",
      "Servi il pesce sulle zucchine con prezzemolo e limone.",
    ],
    macros: { kcal: 290, protein: 38, fat: 11, carbs: 4 },
  },
  l4: {
    minutes: 20,
    ingredients: [g("bistecca di manzo", 170), g("broccoli", 150), oil(2), qb("aglio")],
    steps: [
      "Lessa i broccoli per 5 minuti e scolali.",
      "Saltali in padella con olio e aglio per 3-4 minuti.",
      "Cuoci la bistecca sulla piastra molto calda 3-4 minuti per lato e sala a fine cottura.",
      "Lasciala riposare 2 minuti prima di servirla.",
    ],
    macros: { kcal: 395, protein: 40, fat: 22, carbs: 6 },
  },
  l5: {
    minutes: 30,
    ingredients: [g("orata", 180, "filetti di orata"), g("finocchi", 150), oil(2), qb("limone"), qb("sale")],
    steps: [
      "Scalda il forno a 190 °C. Taglia i finocchi a spicchi sottili.",
      "Disponi finocchi e orata in una teglia, condisci con olio, sale e limone.",
      "Inforna per 15-18 minuti.",
    ],
    macros: { kcal: 315, protein: 36, fat: 14, carbs: 6 },
  },
  l6: {
    minutes: 30,
    ingredients: [g("fesa di tacchino", 170), g("cavolfiore", 200), g("parmigiano", 20, "parmigiano grattugiato"), oil(1)],
    steps: [
      "Lessa le cimette di cavolfiore per 8 minuti e scolale.",
      "Mettile in teglia con olio e parmigiano (niente besciamella) e gratina a 200 °C per 10 minuti.",
      "Cuoci il tacchino sulla piastra 5 minuti per lato e servi.",
    ],
    macros: { kcal: 360, protein: 51, fat: 12, carbs: 6 },
  },
  l7: {
    minutes: 30,
    ingredients: [g("branzino", 180, "filetto di branzino"), g("bietole", 200), oil(2), qb("limone"), qb("erbe aromatiche"), qb("sale")],
    steps: [
      "Scalda il forno a 180 °C. Metti il branzino su carta forno con limone, erbe, olio e sale e chiudi a cartoccio.",
      "Inforna per 15-18 minuti.",
      "Lessa le bietole per 6 minuti e ripassale in padella con un filo d'olio.",
    ],
    macros: { kcal: 300, protein: 37, fat: 14, carbs: 4 },
  },
  l8: {
    minutes: 20,
    ingredients: [g("sgombro", 150, "sgombro (filetti)"), g("cetrioli", 150), oil(1), qb("limone"), qb("menta"), qb("sale")],
    steps: [
      "Cuoci lo sgombro sulla griglia o in padella 4 minuti per lato.",
      "Affetta i cetrioli e condiscili con olio, limone, menta e sale.",
      "Servi il pesce sull'insalata.",
    ],
    macros: { kcal: 375, protein: 29, fat: 26, carbs: 3 },
  },
  l9: {
    minutes: 20,
    ingredients: [
      g("macinato di manzo", 150, "macinato di manzo magro"),
      g("insalata mista", 100),
      g("avocado", 70, "avocado", "mezzo (circa 70 g)"),
      qb("sale"),
      qb("pepe"),
    ],
    steps: [
      "Forma un hamburger con il macinato, sale e pepe: niente pane né pangrattato.",
      "Cuocilo in padella antiaderente 4 minuti per lato.",
      "Servilo su un letto di insalata con l'avocado a fette.",
    ],
    macros: { kcal: 390, protein: 33, fat: 25, carbs: 4 },
  },
  l10: {
    minutes: 25,
    ingredients: [g("petto di pollo", 170), g("zucchine", 150), oil(2), qb("rosmarino"), qb("sale")],
    steps: [
      "Taglia pollo e zucchine a cubetti e infilali alternati negli spiedini.",
      "Condisci con olio, rosmarino e sale.",
      "Cuoci sulla piastra o in forno a 200 °C per 10-12 minuti, girando a metà.",
    ],
    macros: { kcal: 300, protein: 41, fat: 12, carbs: 3 },
  },
  l11: {
    minutes: 20,
    ingredients: [g("petto di pollo", 170), g("spinaci", 200, "spinaci freschi"), oil(2), qb("limone"), qb("sale")],
    steps: [
      "Cuoci il petto di pollo in padella con metà dell'olio 5-6 minuti per lato.",
      "Spruzzalo con il succo di mezzo limone e lascia insaporire un minuto.",
      "Salta gli spinaci con l'olio rimasto e un pizzico di sale per 3 minuti e servi insieme.",
    ],
    macros: { kcal: 320, protein: 45, fat: 13, carbs: 3 },
  },
  l12: {
    minutes: 15,
    ingredients: [pz("uova", 3), g("funghi", 150, "funghi champignon"), g("parmigiano", 20, "parmigiano grattugiato"), oil(1), qb("sale")],
    steps: [
      "Salta i funghi a fette con l'olio per 5 minuti a fuoco vivace.",
      "Sbatti le uova con il parmigiano e un pizzico di sale e versale sui funghi.",
      "Cuoci a fuoco basso con il coperchio 5 minuti, gira e dora un minuto.",
    ],
    macros: { kcal: 370, protein: 31, fat: 25, carbs: 4 },
  },
  l13: {
    minutes: 15,
    ingredients: [g("tonno", 170, "tonno fresco (trancio)"), g("rucola", 60), g("pomodorini", 50), oil(2), qb("sale")],
    steps: [
      "Scalda bene la piastra e cuoci il tonno 2 minuti per lato: dentro deve restare rosato.",
      "Condisci rucola e pomodorini tagliati a metà con olio e sale.",
      "Servi il tonno a fette sull'insalata.",
    ],
    macros: { kcal: 355, protein: 41, fat: 16, carbs: 4 },
  },
  l14: {
    minutes: 20,
    ingredients: [g("vitello", 170, "fettine di vitello"), g("asparagi", 150), oil(2), qb("limone"), qb("sale")],
    steps: [
      "Elimina la parte dura degli asparagi e lessali 5 minuti, poi saltali con metà dell'olio.",
      "Cuoci le fettine di vitello in padella con l'olio rimasto 2 minuti per lato.",
      "Sfuma con il succo di limone e servi con gli asparagi.",
    ],
    macros: { kcal: 305, protein: 40, fat: 13, carbs: 3 },
  },
};

export function recipeOf(id: string): Recipe | undefined {
  return RECIPES[id];
}

/** Chiavi degli ingredienti principali di un piatto (esclusi quelli "q.b."). */
export function itemsOf(id: string): string[] {
  return (RECIPES[id]?.ingredients ?? []).filter((i) => !i.pantry).map((i) => i.item);
}

export function dayTotals(breakfastId: string, lunchId: string): Macros {
  const a = RECIPES[breakfastId]?.macros;
  const b = RECIPES[lunchId]?.macros;
  return {
    kcal: (a?.kcal ?? 0) + (b?.kcal ?? 0),
    protein: (a?.protein ?? 0) + (b?.protein ?? 0),
    fat: (a?.fat ?? 0) + (b?.fat ?? 0),
    carbs: (a?.carbs ?? 0) + (b?.carbs ?? 0),
  };
}

// ---- gruppi di alimenti (per la scelta degli alimenti da evitare e per la lista della spesa)
export type FoodGroup = "carne-pesce" | "uova-latticini" | "verdura-frutta" | "dispensa";

export const GROUP_LABEL: Record<FoodGroup, string> = {
  "carne-pesce": "Carne e pesce",
  "uova-latticini": "Uova e latticini",
  "verdura-frutta": "Verdura e frutta",
  dispensa: "Dispensa",
};

const GROUPS: Record<FoodGroup, string[]> = {
  "carne-pesce": [
    "salmone", "salmone affumicato", "petto di pollo", "fesa di tacchino", "bistecca di manzo",
    "macinato di manzo", "vitello", "merluzzo", "orata", "branzino", "sgombro", "tonno",
    "prosciutto crudo", "bresaola",
  ],
  "uova-latticini": ["uova", "mozzarella", "ricotta", "yogurt greco bianco", "parmigiano", "grana", "formaggio stagionato"],
  "verdura-frutta": [
    "spinaci", "asparagi", "zucchine", "broccoli", "finocchi", "cavolfiore", "bietole", "cetrioli",
    "insalata mista", "rucola", "funghi", "pomodorini", "avocado", "limone", "aglio",
  ],
  dispensa: ["olio extravergine", "noci", "mandorle", "olive", "cannella", "caffè", "prezzemolo", "rosmarino", "menta", "erbe aromatiche", "sale", "pepe"],
};

export function groupOf(item: string): FoodGroup {
  for (const [grp, list] of Object.entries(GROUPS) as [FoodGroup, string[]][]) {
    if (list.includes(item)) return grp;
  }
  return "dispensa";
}

/** Alimenti principali che si possono scegliere di evitare, per gruppo. L'olio resta sempre. */
export function allFoods(): Record<FoodGroup, string[]> {
  const out: Record<FoodGroup, Set<string>> = {
    "carne-pesce": new Set(), "uova-latticini": new Set(), "verdura-frutta": new Set(), dispensa: new Set(),
  };
  for (const id of Object.keys(RECIPES)) {
    for (const item of itemsOf(id)) {
      if (item === "olio extravergine") continue;
      out[groupOf(item)].add(item);
    }
  }
  const sorted = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b, "it"));
  return {
    "carne-pesce": sorted(out["carne-pesce"]),
    "uova-latticini": sorted(out["uova-latticini"]),
    "verdura-frutta": sorted(out["verdura-frutta"]),
    dispensa: sorted(out.dispensa),
  };
}
