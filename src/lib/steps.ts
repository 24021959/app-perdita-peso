import { lastDays } from "./metrics";
import type { Entry } from "./types";

// Passi consigliati per un adulto sopra i 60 anni.
// Fonti: Ding D. e altri, Lancet Public Health 2025;10:e668 (revisione con meta-analisi: rispetto a 2.000 passi al giorno,
// 7.000 passi sono associati a un rischio di morte per ogni causa più basso del 47%, a -25% di malattie cardiovascolari,
// -38% di demenza, -22% di sintomi depressivi, -28% di cadute, -14% di diabete di tipo 2; punto di flesso a 5.000-7.000 passi);
// Paluch A.E. e altri, Lancet Public Health 2022;7:e219 (sopra i 60 anni il rischio cala fino a 6.000-8.000 passi, poi si appiattisce).
export const STEPS_TARGET = 7000;
export const STEPS_RANGE: readonly [number, number] = [6000, 8000];

/**
 * Quota (%) del vantaggio osservato a 7.000 passi che si raggiunge con un dato numero di passi.
 * La curva è una interpolazione prudente tra i dati degli studi (0% a 2.000 passi, 100% a 7.000, poi piatta):
 * serve a dare un'idea, non è una misura sul singolo corpo.
 */
const CURVE: readonly (readonly [number, number])[] = [
  [2000, 0],
  [3000, 25],
  [4000, 50],
  [5000, 70],
  [6000, 86],
  [7000, 100],
];

export function stepBenefit(steps: number | undefined): number {
  if (steps === undefined || !(steps > CURVE[0][0])) return 0;
  if (steps >= STEPS_TARGET) return 100;
  for (let i = 1; i < CURVE.length; i++) {
    const [x1, y1] = CURVE[i];
    if (steps <= x1) {
      const [x0, y0] = CURVE[i - 1];
      return Math.round(y0 + ((steps - x0) / (x1 - x0)) * (y1 - y0));
    }
  }
  return 100;
}

/** Prossimo traguardo realistico: la media attuale più 1.000 passi, arrotondata a 500, mai oltre l'obiettivo. */
export function nextStepGoal(avg: number | undefined): number {
  if (avg === undefined || avg >= STEPS_TARGET) return STEPS_TARGET;
  return Math.min(STEPS_TARGET, Math.ceil((avg + 1000) / 500) * 500);
}

/** Media dei passi registrati negli ultimi `days` giorni (solo i giorni con il dato). */
export function avgSteps(entries: Entry[], today: string, days: number): number | undefined {
  const v = lastDays(entries, today, days)
    .map((e) => e.steps)
    .filter((s): s is number => s !== undefined);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined;
}

/** Numero con il punto delle migliaia anche a 4 cifre (7.000). */
export const fmtSteps = (n: number) => Math.round(n).toLocaleString("it-IT", { useGrouping: "always" });
