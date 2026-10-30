// Interpreta il testo letto da una foto di un referto di analisi del sangue e ne ricava i valori.
// Il testo viene dall'OCR: può contenere errori, quindi ogni valore passa un controllo di plausibilità e
// l'utente li rivede sempre prima di salvare.

import type { Exam } from "./types";

export type ExamKeyOcr = Exclude<keyof Exam, "id" | "date">;

export type ParsedExam = {
  date?: string; // YYYY-MM-DD
  values: Partial<Record<ExamKeyOcr, number>>;
  /** valori letti ma scartati perché fuori da un intervallo plausibile */
  rejected: { key: ExamKeyOcr; value: number }[];
};

// Intervalli plausibili nelle unità dell'app. Fuori da qui il valore si scarta.
export const RANGE: Record<ExamKeyOcr, [number, number]> = {
  glucose: [30, 700],
  hba1c: [3, 15],
  chol: [60, 600],
  hdl: [8, 150],
  ldl: [10, 500],
  trig: [20, 2000],
  creat: [0.2, 12],
  alt: [3, 1000],
  ast: [3, 1000],
  ggt: [3, 1500],
  urea: [5, 300],
  uric: [1, 15],
  na: [110, 170],
  k: [2, 8],
  vitd: [3, 200],
  tsh: [0.01, 100],
};

type Def = {
  key: ExamKeyOcr;
  name: RegExp; // nome dell'esame nella riga
  not?: RegExp; // se la riga contiene questo, non è l'esame giusto
  /** converte il valore letto in base all'unità che lo segue (minuscolo, senza spazi); restituisce null per scartare */
  convert?: (v: number, unit: string) => number | null;
};

const IFCC = (v: number) => Math.round((0.0915 * v + 2.15) * 10) / 10;

const DEFS: Def[] = [
  {
    key: "hba1c",
    name: /emoglobina\s*glic[a-z]*|hb\s?a\s?1\s?c|\ba1c\b|hba1c/,
    convert: (v, u) => {
      if (u.startsWith("%")) return v;
      if (u.includes("mmol")) return IFCC(v);
      if (v >= 15 && v <= 140) return IFCC(v); // senza unità: se è così alto è in mmol/mol
      return v;
    },
  },
  {
    key: "glucose",
    name: /gli[cç]emia|glucosio|glucosemia/,
    not: /emoglobina|hb\s?a1c|curva|post\s?prandiale|dopo/,
    convert: (v, u) => (u.includes("mmol") ? Math.round(v * 18.016) : v),
  },
  { key: "hdl", name: /\bhdl\b|colesterolo\s*h\.?d\.?l/, not: /non[\s-]*hdl|rapporto|ratio|\bvldl|tot\.?\s*\/\s*hdl/ },
  { key: "ldl", name: /(?:^|[^v])ldl\b|colesterolo\s*l\.?d\.?l/, not: /rapporto|ratio|ldl\s*\/\s*hdl/ },
  {
    key: "chol",
    name: /colesterolo(?:\s*totale)?|colesterolemia/,
    not: /hdl|ldl|vldl|non[\s-]*hdl|rapporto|ratio|h\.d\.l|l\.d\.l/,
  },
  { key: "trig", name: /trigliceridi|trigliceridemia/ },
  {
    key: "creat",
    name: /creatinin[ae]|creatininemia/,
    not: /clearance|egfr|\bgfr\b|urin|filtrat|rapporto/,
    convert: (v, u) => (u.includes("mol") ? Math.round((v / 88.4) * 100) / 100 : v),
  },
  { key: "alt", name: /\balt\b|\bgpt\b|alanina/, not: /\bast\b|\bgot\b/ },
  { key: "ast", name: /\bast\b|\bgot\b|aspartato/, not: /\balt\b|\bgpt\b/ },
  { key: "ggt", name: /\bggt\b|gamma\s*-?\s*g(?:t|lutamil)|γ\s*-?\s*gt/ },
  { key: "urea", name: /azotemia|\burea\b|\bbun\b/, not: /urina|urinari/ },
  {
    key: "uric",
    name: /acido\s*urico|uricemia/,
    convert: (v, u) => (u.includes("mol") ? Math.round((v / 59.48) * 10) / 10 : v),
  },
  { key: "na", name: /\bsodio\b|natremia/, not: /urin/ },
  { key: "k", name: /\bpotassio\b|potassiemia|kaliemia/, not: /urin/ },
  {
    key: "vitd",
    name: /vitamina\s*d|25\s*-?\s*(?:oh|idrossi)/,
    convert: (v, u) => (u.includes("nmol") ? Math.round((v / 2.496) * 10) / 10 : v),
  },
  { key: "tsh", name: /\btsh\b|tireotropina/, not: /reflex|\bft[34]\b/ },
];

/** Un numero con la sua unità: "92 mg/dL" → { v: 92, unit: "mg/dl" } */
type Num = { v: number; unit: string; index: number };

function numbersIn(s: string): Num[] {
  const out: Num[] = [];
  const re = /(\d{1,4}(?:[.,]\d{1,3})?)\s*(%|[a-zµμ]{1,5}\s*\/\s*[a-zµμ0-9]{1,5}|[a-zµμ]{1,2}\/[a-z]{1,3})?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const raw = m[1].replace(",", ".");
    const v = parseFloat(raw);
    if (!Number.isFinite(v)) continue;
    out.push({ v, unit: (m[2] ?? "").toLowerCase().replace(/\s+/g, ""), index: m.index });
  }
  return out;
}

/** Toglie intervalli di riferimento e soglie ("70 - 99", "< 200", "(fino a 5)") per non scambiarli per il risultato. */
function stripReferences(s: string): string {
  return s
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\d+(?:[.,]\d+)?\s*[-–—]\s*\d+(?:[.,]\d+)?/g, " ")
    .replace(/(?:[<>≤≥]=?|fino\s*a|inferiore\s*a|superiore\s*a|ottimale|desiderabile)\s*\d+(?:[.,]\d+)?/gi, " ");
}

const ANY_NAME = new RegExp(DEFS.map((d) => d.name.source).join("|"));

function fix(s: string): string {
  // errori tipici dell'OCR nei numeri: "l" o "I" al posto di 1, "O" al posto di 0 tra cifre
  return s
    .replace(/(\d)[Oo](?=\d|\b)/g, "$10")
    .replace(/\b[Oo](\d)/g, "0$1")
    .replace(/(\d)[lI](?=\d|\s|$)/g, "$11")
    .replace(/ /g, " ");
}

function pickValue(def: Def, line: string, nextLine?: string): number | null {
  const lower = line.toLowerCase();
  const m = def.name.exec(lower);
  if (!m) return null;
  let rest = line.slice(m.index + m[0].length).replace(/\b25\s*-?\s*(?:oh|idrossi\w*)(?:\s*d\d?)?/gi, " ");
  let nums = numbersIn(stripReferences(rest));
  if (!nums.length && nextLine && !ANY_NAME.test(nextLine.toLowerCase())) {
    // il valore può stare sulla riga dopo
    nums = numbersIn(stripReferences(nextLine));
    rest = nextLine;
  }
  if (!nums.length) return null;
  // se l'esame ha due unità (es. HbA1c in % e in mmol/mol) si preferisce quella in %
  const pct = def.key === "hba1c" ? nums.find((n) => n.unit.startsWith("%")) : undefined;
  const chosen = pct ?? nums[0];
  const value = def.convert ? def.convert(chosen.v, chosen.unit) : chosen.v;
  return value === null ? null : Math.round(value * 100) / 100;
}

const MONTH = /(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{4}|\d{2})\b/g;

function findDate(text: string, today: string): string | undefined {
  let best: { iso: string; score: number } | undefined;
  for (const line of text.split(/\r?\n/)) {
    const l = line.toLowerCase();
    let score = 0;
    if (/prelievo/.test(l)) score += 3;
    if (/eseguit|campione|esame/.test(l)) score += 2;
    if (/referto|accettazione|data/.test(l)) score += 1;
    if (/nascita|nato|n\.\s|stampa|scadenza/.test(l)) score -= 5;
    MONTH.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MONTH.exec(line))) {
      const d = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10);
      let y = parseInt(m[3], 10);
      if (m[3].length === 2) y += 2000;
      if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 2000) continue;
      const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (iso > today) continue;
      if (!best || score > best.score) best = { iso, score };
    }
  }
  return best?.iso;
}

export function parseExamText(text: string, today = new Date().toISOString().slice(0, 10)): ParsedExam {
  const lines = fix(text)
    .split(/\r?\n/)
    .map((l) => l.replace(/[|_│]+/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const values: ParsedExam["values"] = {};
  const rejected: ParsedExam["rejected"] = [];

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (const def of DEFS) {
      if (values[def.key] !== undefined) continue;
      if (!def.name.test(lower)) continue;
      if (def.not?.test(lower)) continue;
      const v = pickValue(def, lines[i], lines[i + 1]);
      if (v === null) continue;
      const [lo, hi] = RANGE[def.key];
      if (v < lo || v > hi) {
        rejected.push({ key: def.key, value: v });
        continue;
      }
      values[def.key] = v;
    }
  }
  return { date: findDate(text, today), values, rejected };
}
