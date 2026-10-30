// Ricette dei piatti del menu (una porzione). I valori nutrizionali sono stime con tabelle standard degli
// alimenti, arrotondate: servono a farsi un'idea, non sono un calcolo preciso.

export type Macros = { kcal: number; protein: number; fat: number; carbs: number }; // carbs = netti (senza fibre)
export type Recipe = {
  minutes: number;
  ingredients: { name: string; qty: string }[];
  steps: string[];
  macros: Macros;
};

export const PROTEIN_TARGET = 85; // g al giorno, valore di lavoro del documento (da confermare col medico)
export const CARB_LIMIT = 30; // g netti al giorno, valore di lavoro

export const RECIPES: Record<string, Recipe> = {
  b1: {
    minutes: 10,
    ingredients: [
      { name: "uova", qty: "2" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
      { name: "avocado", qty: "mezzo (circa 70 g)" },
      { name: "caffè", qty: "senza zucchero" },
    ],
    steps: [
      "Sbatti le uova con un pizzico di sale.",
      "Scalda l'olio in padella e cuoci le uova a fuoco basso, mescolando, per 2-3 minuti.",
      "Servi con l'avocado a fette e il caffè senza zucchero.",
    ],
    macros: { kcal: 300, protein: 14, fat: 25, carbs: 2 },
  },
  b2: {
    minutes: 2,
    ingredients: [
      { name: "yogurt greco bianco non zuccherato", qty: "150 g" },
      { name: "noci", qty: "20 g (3-4 gherigli)" },
    ],
    steps: [
      "Controlla in etichetta che lo yogurt non abbia zuccheri aggiunti.",
      "Versalo in una ciotola e spezzetta le noci sopra.",
    ],
    macros: { kcal: 250, protein: 18, fat: 16, carbs: 7 },
  },
  b3: {
    minutes: 12,
    ingredients: [
      { name: "uova", qty: "2" },
      { name: "spinaci freschi", qty: "80 g" },
      { name: "parmigiano grattugiato", qty: "20 g" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
    ],
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
      { name: "prosciutto crudo", qty: "50 g" },
      { name: "mozzarella", qty: "100 g" },
      { name: "pomodorini", qty: "3-4 (circa 40 g)" },
    ],
    steps: [
      "Controlla in etichetta che il prosciutto non contenga destrosio o zuccheri.",
      "Taglia mozzarella e pomodorini e servili con il prosciutto.",
    ],
    macros: { kcal: 380, protein: 32, fat: 27, carbs: 3 },
  },
  b5: {
    minutes: 12,
    ingredients: [
      { name: "uova", qty: "2" },
      { name: "salmone affumicato", qty: "50 g" },
      { name: "cetrioli", qty: "100 g" },
    ],
    steps: [
      "Cuoci le uova in acqua bollente per 9 minuti, raffreddale e sguscia.",
      "Affetta i cetrioli.",
      "Servi le uova con il salmone e i cetrioli.",
    ],
    macros: { kcal: 250, protein: 24, fat: 15, carbs: 3 },
  },
  b6: {
    minutes: 3,
    ingredients: [
      { name: "ricotta", qty: "100 g" },
      { name: "mandorle", qty: "15 g" },
      { name: "cannella", qty: "1 cucchiaino" },
    ],
    steps: ["Metti la ricotta in una ciotola.", "Aggiungi le mandorle tritate grossolanamente e la cannella."],
    macros: { kcal: 235, protein: 11, fat: 19, carbs: 5 },
  },
  b7: {
    minutes: 10,
    ingredients: [
      { name: "uova", qty: "2" },
      { name: "funghi champignon", qty: "100 g" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
      { name: "prezzemolo e sale", qty: "q.b." },
    ],
    steps: [
      "Salta i funghi a fette in padella con metà dell'olio per 4-5 minuti, poi mettili da parte.",
      "Cuoci le uova al tegamino con l'olio rimasto.",
      "Servi insieme, con prezzemolo e sale.",
    ],
    macros: { kcal: 210, protein: 16, fat: 15, carbs: 3 },
  },
  b8: {
    minutes: 5,
    ingredients: [
      { name: "bresaola", qty: "60 g" },
      { name: "rucola", qty: "40 g" },
      { name: "grana in scaglie", qty: "20 g" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
    ],
    steps: [
      "Disponi la bresaola su un piatto con la rucola.",
      "Aggiungi le scaglie di grana, l'olio e qualche goccia di limone.",
    ],
    macros: { kcal: 230, protein: 27, fat: 12, carbs: 2 },
  },
  b9: {
    minutes: 15,
    ingredients: [
      { name: "uova", qty: "2" },
      { name: "zucchine", qty: "120 g" },
      { name: "formaggio stagionato grattugiato", qty: "20 g" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
    ],
    steps: [
      "Taglia le zucchine a rondelle e saltale in padella con l'olio per 5 minuti.",
      "Sbatti le uova con il formaggio e un pizzico di sale e versale sulle zucchine.",
      "Cuoci a fuoco basso con il coperchio 5 minuti, poi gira e dora un minuto.",
    ],
    macros: { kcal: 290, protein: 20, fat: 21, carbs: 4 },
  },

  l1: {
    minutes: 25,
    ingredients: [
      { name: "filetto di salmone", qty: "170 g" },
      { name: "asparagi", qty: "150 g" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
      { name: "limone e sale", qty: "q.b." },
    ],
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
    ingredients: [
      { name: "petto di pollo", qty: "170 g" },
      { name: "insalata mista", qty: "100 g" },
      { name: "olive", qty: "30 g (6-7)" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
    ],
    steps: [
      "Batti leggermente il petto di pollo per averlo di spessore uniforme.",
      "Cuoci sulla piastra calda 5-6 minuti per lato, poi sala.",
      "Condisci l'insalata con le olive e l'olio e servi col pollo.",
    ],
    macros: { kcal: 325, protein: 40, fat: 15, carbs: 3 },
  },
  l3: {
    minutes: 20,
    ingredients: [
      { name: "filetto di merluzzo", qty: "200 g" },
      { name: "zucchine", qty: "200 g" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
      { name: "aglio, prezzemolo, limone", qty: "q.b." },
    ],
    steps: [
      "Cuoci il merluzzo al vapore per 8-10 minuti.",
      "Taglia le zucchine a rondelle e trifolale in padella con olio e aglio per 8 minuti.",
      "Servi il pesce sulle zucchine con prezzemolo e limone.",
    ],
    macros: { kcal: 290, protein: 38, fat: 11, carbs: 4 },
  },
  l4: {
    minutes: 20,
    ingredients: [
      { name: "bistecca di manzo", qty: "170 g" },
      { name: "broccoli", qty: "150 g" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
      { name: "aglio", qty: "1 spicchio" },
    ],
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
    ingredients: [
      { name: "filetti di orata", qty: "180 g" },
      { name: "finocchi", qty: "150 g" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
      { name: "limone e sale", qty: "q.b." },
    ],
    steps: [
      "Scalda il forno a 190 °C. Taglia i finocchi a spicchi sottili.",
      "Disponi finocchi e orata in una teglia, condisci con olio, sale e limone.",
      "Inforna per 15-18 minuti.",
    ],
    macros: { kcal: 315, protein: 36, fat: 14, carbs: 6 },
  },
  l6: {
    minutes: 30,
    ingredients: [
      { name: "fesa di tacchino", qty: "170 g" },
      { name: "cavolfiore", qty: "200 g" },
      { name: "parmigiano grattugiato", qty: "20 g" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
    ],
    steps: [
      "Lessa le cimette di cavolfiore per 8 minuti e scolale.",
      "Mettile in teglia con olio e parmigiano (niente besciamella) e gratina a 200 °C per 10 minuti.",
      "Cuoci il tacchino sulla piastra 5 minuti per lato e servi.",
    ],
    macros: { kcal: 360, protein: 51, fat: 12, carbs: 6 },
  },
  l7: {
    minutes: 30,
    ingredients: [
      { name: "filetto di branzino", qty: "180 g" },
      { name: "bietole", qty: "200 g" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
      { name: "limone, erbe aromatiche, sale", qty: "q.b." },
    ],
    steps: [
      "Scalda il forno a 180 °C. Metti il branzino su carta forno con limone, erbe, olio e sale e chiudi a cartoccio.",
      "Inforna per 15-18 minuti.",
      "Lessa le bietole per 6 minuti e ripassale in padella con un filo d'olio.",
    ],
    macros: { kcal: 300, protein: 37, fat: 14, carbs: 4 },
  },
  l8: {
    minutes: 20,
    ingredients: [
      { name: "sgombro (filetti)", qty: "150 g" },
      { name: "cetrioli", qty: "150 g" },
      { name: "olio extravergine", qty: "1 cucchiaino" },
      { name: "limone, menta, sale", qty: "q.b." },
    ],
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
      { name: "macinato di manzo magro", qty: "150 g" },
      { name: "insalata mista", qty: "100 g" },
      { name: "avocado", qty: "mezzo (circa 70 g)" },
      { name: "sale e pepe", qty: "q.b." },
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
    ingredients: [
      { name: "petto di pollo", qty: "170 g" },
      { name: "zucchine", qty: "150 g" },
      { name: "olio extravergine", qty: "2 cucchiaini" },
      { name: "rosmarino e sale", qty: "q.b." },
    ],
    steps: [
      "Taglia pollo e zucchine a cubetti e infilali alternati negli spiedini.",
      "Condisci con olio, rosmarino e sale.",
      "Cuoci sulla piastra o in forno a 200 °C per 10-12 minuti, girando a metà.",
    ],
    macros: { kcal: 300, protein: 41, fat: 12, carbs: 3 },
  },
};

export function recipeOf(id: string): Recipe | undefined {
  return RECIPES[id];
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
