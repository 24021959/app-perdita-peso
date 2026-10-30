import { addDays, diffDays } from "./dates";
import type { Entry, Settings } from "./types";

export type WPoint = { date: string; weight: number; avg: number };

const withWeight = (entries: Entry[]) =>
  entries
    .filter((e) => e.weight !== undefined)
    .map((e) => ({ date: e.date, weight: e.weight as number }));

/** Media dei pesi nei 7 giorni che finiscono alla data indicata. */
export function avgAt(entries: Entry[], date: string): number | undefined {
  const vals = withWeight(entries)
    .filter((p) => {
      const d = diffDays(date, p.date);
      return d >= 0 && d < 7;
    })
    .map((p) => p.weight);
  if (!vals.length) return undefined;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function weightPoints(entries: Entry[]): WPoint[] {
  return withWeight(entries).map((p) => ({
    ...p,
    avg: Math.round((avgAt(entries, p.date) ?? p.weight) * 100) / 100,
  }));
}

/** Variazione in kg a settimana (negativa = calo), regressione sugli ultimi 21 giorni. */
export function weeklyTrend(entries: Entry[], today: string): number | undefined {
  const pts = withWeight(entries)
    .map((p) => ({ x: -diffDays(today, p.date), y: p.weight }))
    .filter((p) => p.x >= -21 && p.x <= 0);
  if (pts.length < 3) return undefined;
  const xs = pts.map((p) => p.x);
  if (Math.max(...xs) - Math.min(...xs) < 5) return undefined;
  const n = pts.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = pts.reduce((a, p) => a + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  return den === 0 ? undefined : (num / den) * 7;
}

export type Eta = { state: "reached" } | { state: "date"; date: string } | { state: "unknown" };

export function estimateArrival(entries: Entry[], settings: Settings, today: string): Eta {
  const w = withWeight(entries);
  if (!w.length) return { state: "unknown" };
  const lastDate = w[w.length - 1].date;
  const current = avgAt(entries, lastDate) ?? w[w.length - 1].weight;
  if (current <= settings.goalMax) return { state: "reached" };
  const perWeek = weeklyTrend(entries, today);
  if (perWeek === undefined || perWeek >= -0.05) return { state: "unknown" };
  const days = Math.ceil(((current - settings.goalMax) / -perWeek) * 7);
  if (days > 730) return { state: "unknown" };
  return { state: "date", date: addDays(today, days) };
}

/** Giorni consecutivi con finestra alimentare rispettata. */
export function fastingStreak(entries: Entry[], today: string): number {
  const map = new Map(entries.map((e) => [e.date, e]));
  const t = map.get(today);
  if (t?.fastingKept === false && !t.offPlan) return 0;
  let d = t?.fastingKept || t?.offPlan ? today : addDays(today, -1);
  let n = 0;
  for (let guard = 0; guard < 3660; guard++) {
    const e = map.get(d);
    if (e?.offPlan) {
      // giorno fuori regola: neutro, non conta e non spezza la serie
      d = addDays(d, -1);
      continue;
    }
    if (e?.fastingKept !== true) break;
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export const bmi = (kg: number, heightCm: number) => kg / (heightCm / 100) ** 2;

export function lastDays(entries: Entry[], today: string, n: number): Entry[] {
  return entries.filter((e) => {
    const d = diffDays(today, e.date);
    return d >= 0 && d < n;
  });
}
