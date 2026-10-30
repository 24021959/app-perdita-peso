import { diffDays } from "./dates";
import type { Entry } from "./types";

export type MetricId = "sleep" | "water" | "steps" | "systolic" | "glucose";

export const METRICS: Record<
  MetricId,
  { label: string; unit: string; color: string; get: (e: Entry) => number | undefined; decimals: number }
> = {
  sleep: { label: "Sonno", unit: "ore", color: "#5b7bd5", get: (e) => e.sleep, decimals: 1 },
  water: { label: "Acqua", unit: "litri", color: "#3aa0d8", get: (e) => e.water, decimals: 1 },
  steps: { label: "Passi", unit: "", color: "#3fa377", get: (e) => e.steps, decimals: 0 },
  systolic: { label: "Pressione max", unit: "mmHg", color: "#d9486b", get: (e) => e.systolic, decimals: 0 },
  glucose: { label: "Glicemia", unit: "mg/dl", color: "#8a63d2", get: (e) => e.glucose, decimals: 0 },
};

export type CompareInsight =
  | { ok: false; reason: string }
  | {
      ok: true;
      threshold: number;
      highN: number;
      lowN: number;
      highChange: number; // kg, variazione media del peso il giorno dopo
      lowChange: number;
      diff: number;
    };

const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;

/**
 * Per ogni giorno con il dato e il peso, e con il peso anche il giorno dopo, calcola di quanto cambia il
 * peso. Divide i giorni a metà (sopra e sotto la mediana del dato) e confronta le due medie.
 */
export function compareInsight(entries: Entry[], metric: MetricId): CompareInsight {
  const get = METRICS[metric].get;
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const pairs: { v: number; change: number }[] = [];
  for (const e of entries) {
    const v = get(e);
    if (v === undefined || e.weight === undefined) continue;
    const next = [...byDate.values()].find((x) => diffDays(x.date, e.date) === 1);
    if (!next || next.weight === undefined) continue;
    pairs.push({ v, change: next.weight - e.weight });
  }
  if (pairs.length < 10) {
    return { ok: false, reason: `Servono almeno 10 coppie di giorni consecutivi con il dato e il peso: per ora ${pairs.length}.` };
  }
  const sorted = [...pairs].map((p) => p.v).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const high = pairs.filter((p) => p.v > median);
  const low = pairs.filter((p) => p.v <= median);
  if (high.length < 4 || low.length < 4) {
    return { ok: false, reason: "I valori sono troppo simili tra loro per confrontarli." };
  }
  const hc = mean(high.map((p) => p.change));
  const lc = mean(low.map((p) => p.change));
  return { ok: true, threshold: median, highN: high.length, lowN: low.length, highChange: hc, lowChange: lc, diff: hc - lc };
}
