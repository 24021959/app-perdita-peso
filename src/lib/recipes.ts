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

export const KCAL_TARGET = 1700; // kcal al giorno (uomo di 67 anni, 95 kg, fabbisogno circa 2.200: deficit di circa 500, da confermare col medico)
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
    ingredients: [
      pz("uova", 3),
      oil(4),
      g("parmigiano", 20, "parmigiano grattugiato"),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      qb("caffè", "caffè senza zucchero"),
    ],
    steps: [
      "Sbatti le uova con il parmigiano e un pizzico di sale.",
      "Scalda l'olio in padella e cuoci le uova a fuoco basso, mescolando, per 2-3 minuti.",
      "Servi con l'avocado a fette e il caffè senza zucchero.",
    ],
    macros: { kcal: 690, protein: 30, fat: 60, carbs: 4 },
  },
  b2: {
    minutes: 2,
    ingredients: [
      g("yogurt greco bianco", 250, "yogurt greco bianco non zuccherato"),
      g("noci", 50, "noci", "50 g (8 gherigli)"),
      g("mandorle", 20, "mandorle", "20 g (circa 15)"),
    ],
    steps: [
      "Controlla in etichetta che lo yogurt non abbia zuccheri aggiunti.",
      "Versalo in una ciotola e spezzetta noci e mandorle sopra.",
    ],
    macros: { kcal: 685, protein: 34, fat: 56, carbs: 12 },
  },
  b3: {
    minutes: 12,
    ingredients: [
      pz("uova", 3),
      g("spinaci", 150, "spinaci freschi"),
      g("parmigiano", 40, "parmigiano grattugiato"),
      g("avocado", 100, "avocado", "circa 100 g"),
      oil(3),
    ],
    steps: [
      "Appassisci gli spinaci in padella con l'olio per 2 minuti.",
      "Sbatti le uova con il parmigiano e un pizzico di sale.",
      "Versale sugli spinaci e cuoci a fuoco basso con il coperchio per 4-5 minuti.",
      "Gira la frittata, falla dorare un minuto e servila con l'avocado a fette.",
    ],
    macros: { kcal: 700, protein: 40, fat: 56, carbs: 4 },
  },
  b4: {
    minutes: 5,
    ingredients: [
      g("prosciutto crudo", 50),
      g("mozzarella", 150),
      g("pomodorini", 60, "pomodorini", "5-6 (circa 60 g)"),
      g("olive", 30, "olive", "30 g (6-7)"),
      oil(3),
    ],
    steps: [
      "Controlla in etichetta che il prosciutto non contenga destrosio o zuccheri.",
      "Taglia mozzarella e pomodorini, aggiungi le olive e condisci con l'olio.",
      "Servi con il prosciutto.",
    ],
    macros: { kcal: 675, protein: 41, fat: 54, carbs: 3 },
  },
  b5: {
    minutes: 12,
    ingredients: [
      pz("uova", 3),
      g("salmone affumicato", 80),
      g("cetrioli", 100),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      oil(2),
    ],
    steps: [
      "Cuoci le uova in acqua bollente per 9 minuti, raffreddale e sguscia.",
      "Affetta i cetrioli e l'avocado.",
      "Servi le uova con il salmone, i cetrioli e l'avocado, con un filo d'olio.",
    ],
    macros: { kcal: 680, protein: 43, fat: 52, carbs: 6 },
  },
  b6: {
    minutes: 3,
    ingredients: [
      g("ricotta", 200),
      g("mandorle", 30),
      g("noci", 35, "noci", "35 g (5-6 gherigli)"),
      { item: "cannella", name: "cannella", qty: "1 cucchiaino", spoons: 1 },
    ],
    steps: [
      "Metti la ricotta in una ciotola.",
      "Aggiungi mandorle e noci tritate grossolanamente e la cannella.",
    ],
    macros: { kcal: 700, protein: 30, fat: 61, carbs: 10 },
  },
  b7: {
    minutes: 10,
    ingredients: [
      pz("uova", 3),
      g("funghi", 150, "funghi champignon"),
      oil(3),
      g("avocado", 100, "avocado", "circa 100 g"),
      g("parmigiano", 30, "parmigiano a scaglie"),
      qb("prezzemolo"),
      qb("sale"),
    ],
    steps: [
      "Salta i funghi a fette in padella con metà dell'olio per 4-5 minuti, poi mettili da parte.",
      "Cuoci le uova al tegamino con l'olio rimasto.",
      "Servi insieme, con l'avocado a fette, il parmigiano a scaglie, prezzemolo e sale.",
    ],
    macros: { kcal: 660, protein: 37, fat: 53, carbs: 5 },
  },
  b8: {
    minutes: 15,
    ingredients: [
      g("bresaola", 70),
      pz("uova", 2),
      g("grana", 40, "grana in scaglie"),
      g("rucola", 60),
      g("avocado", 70, "avocado", "mezzo (circa 70 g)"),
      oil(3),
      qb("limone"),
    ],
    steps: [
      "Cuoci le uova in acqua bollente per 9 minuti, raffreddale e sguscia.",
      "Disponi la bresaola su un piatto con la rucola e l'avocado a fette.",
      "Aggiungi le scaglie di grana, le uova a metà, l'olio e qualche goccia di limone.",
    ],
    macros: { kcal: 660, protein: 52, fat: 48, carbs: 4 },
  },
  b9: {
    minutes: 15,
    ingredients: [
      pz("uova", 3),
      g("zucchine", 200),
      g("formaggio stagionato", 40, "formaggio stagionato grattugiato"),
      g("avocado", 70, "avocado", "mezzo (circa 70 g)"),
      oil(3),
    ],
    steps: [
      "Taglia le zucchine a rondelle e saltale in padella con l'olio per 5 minuti.",
      "Sbatti le uova con il formaggio e un pizzico di sale e versale sulle zucchine.",
      "Cuoci a fuoco basso con il coperchio 5 minuti, poi gira e dora un minuto. Servi con l'avocado a fette.",
    ],
    macros: { kcal: 655, protein: 36, fat: 52, carbs: 6 },
  },
  b10: {
    minutes: 3,
    ingredients: [
      g("yogurt greco bianco", 250, "yogurt greco bianco non zuccherato"),
      g("mandorle", 50),
      g("noci", 20, "noci", "20 g (3 gherigli)"),
      { item: "cannella", name: "cannella", qty: "1 cucchiaino", spoons: 1 },
    ],
    steps: [
      "Controlla in etichetta che lo yogurt non abbia zuccheri aggiunti.",
      "Versalo in una ciotola, aggiungi mandorle e noci tritate e la cannella.",
    ],
    macros: { kcal: 670, protein: 36, fat: 52, carbs: 13 },
  },
  b11: {
    minutes: 10,
    ingredients: [
      pz("uova", 3),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("prosciutto crudo", 40),
      oil(3),
      qb("sale"),
    ],
    steps: [
      "Porta a ebollizione l'acqua e immergi le uova per 6 minuti (alla coque).",
      "Raffreddale un attimo sotto l'acqua fredda e aprile in una ciotola.",
      "Controlla in etichetta che il prosciutto non contenga destrosio o zuccheri.",
      "Servi con l'avocado a fette, il prosciutto, un filo d'olio e un pizzico di sale.",
    ],
    macros: { kcal: 670, protein: 33, fat: 56, carbs: 4 },
  },
  b12: {
    minutes: 15,
    ingredients: [
      g("prosciutto crudo", 50),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("cetrioli", 100),
      pz("uova", 2),
      oil(4),
    ],
    steps: [
      "Cuoci le uova in acqua bollente per 9 minuti, raffreddale e sguscia.",
      "Controlla in etichetta che il prosciutto non contenga destrosio o zuccheri.",
      "Taglia avocado e cetrioli a fette e servili con il prosciutto e le uova, con un filo d'olio.",
    ],
    macros: { kcal: 675, protein: 29, fat: 57, carbs: 5 },
  },

  // ---------------- pranzi
  l1: {
    minutes: 25,
    ingredients: [
      g("salmone", 250, "filetto di salmone"),
      g("asparagi", 200),
      oil(6),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      qb("limone"),
      qb("sale"),
    ],
    steps: [
      "Scalda il forno a 200 °C. Elimina la parte dura degli asparagi.",
      "Metti salmone e asparagi su una teglia con carta forno, condisci con metà dell'olio e sale.",
      "Inforna per 12-15 minuti.",
      "Servi con l'avocado a fette, l'olio rimasto e qualche goccia di limone.",
    ],
    macros: { kcal: 1030, protein: 57, fat: 81, carbs: 6 },
  },
  l2: {
    minutes: 15,
    ingredients: [
      g("petto di pollo", 220),
      g("insalata mista", 150),
      g("olive", 50, "olive", "50 g (10-12)"),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("noci", 40, "noci", "40 g (6-7 gherigli)"),
      oil(5),
    ],
    steps: [
      "Batti leggermente il petto di pollo per averlo di spessore uniforme.",
      "Cuoci sulla piastra calda 5-6 minuti per lato, poi sala.",
      "Condisci l'insalata con le olive e l'olio, aggiungi l'avocado a pezzi e le noci spezzettate e servi col pollo.",
    ],
    macros: { kcal: 1015, protein: 62, fat: 79, carbs: 6 },
  },
  l3: {
    minutes: 20,
    ingredients: [
      g("merluzzo", 250, "filetto di merluzzo"),
      g("zucchine", 250),
      oil(6),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("mandorle", 50, "mandorle a lamelle"),
      qb("aglio"),
      qb("prezzemolo"),
      qb("limone"),
    ],
    steps: [
      "Cuoci il merluzzo al vapore per 8-10 minuti.",
      "Taglia le zucchine a rondelle e trifolale in padella con olio e aglio per 8 minuti.",
      "Servi il pesce sulle zucchine con l'avocado a fette, le mandorle, prezzemolo e limone.",
    ],
    macros: { kcal: 1010, protein: 61, fat: 77, carbs: 10 },
  },
  l4: {
    minutes: 20,
    ingredients: [
      g("bistecca di manzo", 250),
      g("broccoli", 250),
      oil(6),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("olive", 40, "olive", "40 g (8-9)"),
      qb("aglio"),
    ],
    steps: [
      "Lessa i broccoli per 5 minuti e scolali.",
      "Saltali in padella con olio e aglio per 3-4 minuti.",
      "Cuoci la bistecca sulla piastra molto calda 3-4 minuti per lato e sala a fine cottura.",
      "Lasciala riposare 2 minuti e servila con i broccoli e l'avocado a fette.",
    ],
    macros: { kcal: 1000, protein: 63, fat: 75, carbs: 13 },
  },
  l5: {
    minutes: 30,
    ingredients: [
      g("orata", 250, "filetti di orata"),
      g("finocchi", 250),
      oil(5),
      g("olive", 50, "olive", "50 g (10-12)"),
      g("mandorle", 40),
      g("avocado", 100, "avocado", "circa 100 g"),
      qb("limone"),
      qb("sale"),
    ],
    steps: [
      "Scalda il forno a 190 °C. Taglia i finocchi a spicchi sottili.",
      "Disponi finocchi e orata in una teglia, condisci con olio, olive, sale e limone.",
      "Inforna per 15-18 minuti.",
      "Servi con l'avocado a fette e le mandorle tritate.",
    ],
    macros: { kcal: 995, protein: 63, fat: 72, carbs: 11 },
  },
  l6: {
    minutes: 30,
    ingredients: [
      g("fesa di tacchino", 230),
      g("cavolfiore", 300),
      g("parmigiano", 40, "parmigiano grattugiato"),
      oil(6),
      g("noci", 40, "noci", "40 g (6-7 gherigli)"),
    ],
    steps: [
      "Lessa le cimette di cavolfiore per 8 minuti e scolale.",
      "Mettile in teglia con olio e parmigiano (niente besciamella) e gratina a 200 °C per 10 minuti.",
      "Cuoci il tacchino sulla piastra 5 minuti per lato e servi con le noci spezzettate.",
    ],
    macros: { kcal: 985, protein: 81, fat: 68, carbs: 9 },
  },
  l7: {
    minutes: 30,
    ingredients: [
      g("branzino", 250, "filetto di branzino"),
      g("bietole", 300),
      oil(6),
      g("noci", 40, "noci", "40 g (6-7 gherigli)"),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      qb("limone"),
      qb("erbe aromatiche"),
      qb("sale"),
    ],
    steps: [
      "Scalda il forno a 180 °C. Metti il branzino su carta forno con limone, erbe, metà dell'olio e sale e chiudi a cartoccio.",
      "Inforna per 15-18 minuti.",
      "Lessa le bietole per 6 minuti e ripassale in padella con l'olio rimasto.",
      "Servi con le noci spezzettate e l'avocado a fette.",
    ],
    macros: { kcal: 1040, protein: 61, fat: 81, carbs: 11 },
  },
  l8: {
    minutes: 20,
    ingredients: [
      g("sgombro", 250, "sgombro (filetti)"),
      g("cetrioli", 200),
      oil(5),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("olive", 50, "olive", "50 g (10-12)"),
      qb("limone"),
      qb("menta"),
      qb("sale"),
    ],
    steps: [
      "Cuoci lo sgombro sulla griglia o in padella 4 minuti per lato.",
      "Affetta i cetrioli e condiscili con olio, limone, menta e sale; aggiungi le olive e l'avocado a pezzi.",
      "Servi il pesce sull'insalata.",
    ],
    macros: { kcal: 1025, protein: 52, fat: 84, carbs: 7 },
  },
  l9: {
    minutes: 20,
    ingredients: [
      g("macinato di manzo", 250, "macinato di manzo magro"),
      pz("uova", 1),
      g("insalata mista", 150),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      oil(4),
      g("olive", 50, "olive", "50 g (10-12)"),
      qb("sale"),
      qb("pepe"),
    ],
    steps: [
      "Forma un hamburger con il macinato, sale e pepe, niente pane né pangrattato.",
      "Cuocilo in padella antiaderente 4 minuti per lato.",
      "Cuoci l'uovo al tegamino con una parte dell'olio.",
      "Servi su un letto di insalata con l'avocado a fette, le olive, l'uovo e l'olio rimasto.",
    ],
    macros: { kcal: 980, protein: 62, fat: 75, carbs: 5 },
  },
  l10: {
    minutes: 25,
    ingredients: [
      g("petto di pollo", 230),
      g("zucchine", 250),
      oil(6),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("noci", 40, "noci", "40 g (6-7 gherigli)"),
      qb("rosmarino"),
      qb("sale"),
    ],
    steps: [
      "Taglia pollo e zucchine a cubetti e infilali alternati negli spiedini.",
      "Condisci con olio, rosmarino e sale.",
      "Cuoci sulla piastra o in forno a 200 °C per 10-12 minuti, girando a metà.",
      "Servi con l'avocado a fette e le noci spezzettate.",
    ],
    macros: { kcal: 1025, protein: 65, fat: 78, carbs: 9 },
  },
  l11: {
    minutes: 20,
    ingredients: [
      g("petto di pollo", 220),
      g("spinaci", 250, "spinaci freschi"),
      oil(6),
      g("parmigiano", 30, "parmigiano a scaglie"),
      g("mandorle", 60),
      qb("limone"),
      qb("sale"),
    ],
    steps: [
      "Cuoci il petto di pollo in padella con metà dell'olio 5-6 minuti per lato.",
      "Spruzzalo con il succo di mezzo limone e lascia insaporire un minuto.",
      "Salta gli spinaci con l'olio rimasto e un pizzico di sale per 3 minuti e servi insieme, con il parmigiano a scaglie e le mandorle.",
    ],
    macros: { kcal: 1010, protein: 81, fat: 72, carbs: 5 },
  },
  l12: {
    minutes: 15,
    ingredients: [
      pz("uova", 3),
      g("funghi", 200, "funghi champignon"),
      g("parmigiano", 50, "parmigiano grattugiato"),
      oil(4),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("noci", 20, "noci", "20 g (3 gherigli)"),
      qb("sale"),
    ],
    steps: [
      "Salta i funghi a fette con l'olio per 5 minuti a fuoco vivace.",
      "Sbatti le uova con il parmigiano e un pizzico di sale e versale sui funghi.",
      "Cuoci a fuoco basso con il coperchio 5 minuti, gira e dora un minuto.",
      "Servi con l'avocado a fette e le noci spezzettate.",
    ],
    macros: { kcal: 985, protein: 50, fat: 82, carbs: 6 },
  },
  l13: {
    minutes: 15,
    ingredients: [
      g("tonno", 250, "tonno fresco (trancio)"),
      g("rucola", 100),
      g("pomodorini", 100),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("noci", 30, "noci", "30 g (4-5 gherigli)"),
      oil(6),
      qb("sale"),
    ],
    steps: [
      "Scalda bene la piastra e cuoci il tonno 2 minuti per lato: dentro deve restare rosato.",
      "Condisci rucola e pomodorini tagliati a metà con olio e sale, aggiungi l'avocado a pezzi e le noci.",
      "Servi il tonno a fette sull'insalata.",
    ],
    macros: { kcal: 1035, protein: 71, fat: 79, carbs: 8 },
  },
  l14: {
    minutes: 20,
    ingredients: [
      g("vitello", 250, "fettine di vitello"),
      g("asparagi", 250),
      oil(6),
      g("avocado", 140, "avocado", "1 intero (circa 140 g)"),
      g("parmigiano", 30, "parmigiano a scaglie"),
      g("noci", 20, "noci", "20 g (3 gherigli)"),
      qb("limone"),
      qb("sale"),
    ],
    steps: [
      "Elimina la parte dura degli asparagi e lessali 5 minuti, poi saltali con metà dell'olio.",
      "Cuoci le fettine di vitello in padella con l'olio rimasto 2 minuti per lato.",
      "Sfuma con il succo di limone e servi con gli asparagi, l'avocado a fette, il parmigiano a scaglie e le noci spezzettate.",
    ],
    macros: { kcal: 1045, protein: 75, fat: 77, carbs: 8 },
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
