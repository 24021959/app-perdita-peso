import { addDays, diffDays } from "./dates";
import { fastingStreak, weightPoints } from "./metrics";
import type { Entry, Settings } from "./types";

export type MilestoneGroup = "peso" | "vita" | "serie" | "diario";
export type Milestone = {
  id: string;
  group: MilestoneGroup;
  title: string;
  done: boolean;
  date?: string; // quando è stato raggiunto
  progress: number; // 0-1
  hint?: string; // cosa manca
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const fmt = (n: number) => String(round1(n)).replace(".", ",");
const clip = (n: number) => Math.max(0, Math.min(1, n));

/** Prima data in cui la serie nella finestra arriva a ciascuna soglia (giorni fuori regola neutri). */
function streakDates(entries: Entry[], thresholds: number[]): Record<number, string | undefined> {
  const hit: Record<number, string | undefined> = {};
  if (!entries.length) return hit;
  const map = new Map(entries.map((e) => [e.date, e]));
  const dates = entries.map((e) => e.date).sort();
  const last = dates[dates.length - 1];
  let d = dates[0];
  let run = 0;
  for (let guard = 0; d <= last && guard < 5000; guard++) {
    const e = map.get(d);
    if (e?.offPlan) {
      // neutro
    } else if (e?.fastingKept === true) {
      run++;
      for (const t of thresholds) if (run === t && !hit[t]) hit[t] = d;
    } else {
      run = 0;
    }
    d = addDays(d, 1);
  }
  return hit;
}

export function buildMilestones(entries: Entry[], settings: Settings, today: string): Milestone[] {
  const out: Milestone[] = [];
  const pts = weightPoints(entries);
  const start = settings.startWeight;
  const curAvg = pts.length ? pts[pts.length - 1].avg : start;

  // ---- peso (media a 7 giorni)
  const addWeight = (id: string, title: string, target: number) => {
    const hit = pts.find((p) => p.avg <= target);
    const span = start - target;
    out.push({
      id,
      group: "peso",
      title,
      done: !!hit,
      date: hit?.date,
      progress: hit ? 1 : span > 0 ? clip((start - curAvg) / span) : 0,
      hint: hit ? undefined : `mancano ${fmt(Math.max(0, curAvg - target))} kg`,
    });
  };
  for (const kg of [1, 2, 3, 5, 7]) {
    if (start - kg > settings.goalMax) addWeight(`peso-${kg}`, `${kg} kg in meno`, start - kg);
  }
  const half = round1((start + settings.goalMax) / 2);
  if (half < start && half > settings.goalMax) addWeight("peso-meta", `Metà strada (${fmt(half)} kg)`, half);
  addWeight("peso-obiettivo", `Fascia obiettivo (${settings.goalMax} kg)`, settings.goalMax);

  // ---- vita
  const waists = entries.filter((e) => e.waist !== undefined);
  if (waists.length) {
    const base = waists[0].waist as number;
    const latest = waists[waists.length - 1].waist as number;
    for (const cm of [2, 5, 10]) {
      const hit = waists.find((w) => (w.waist as number) <= base - cm);
      out.push({
        id: `vita-${cm}`,
        group: "vita",
        title: `Vita: ${cm} cm in meno`,
        done: !!hit,
        date: hit?.date,
        progress: hit ? 1 : clip((base - latest) / cm),
        hint: hit ? undefined : `mancano ${fmt(Math.max(0, latest - (base - cm)))} cm`,
      });
    }
  }

  // ---- serie nella finestra alimentare
  const st = [3, 7, 14, 30];
  const hits = streakDates(entries, st);
  const cur = fastingStreak(entries, today);
  for (const n of st) {
    out.push({
      id: `serie-${n}`,
      group: "serie",
      title: `${n} giorni di fila nella finestra`,
      done: !!hits[n],
      date: hits[n],
      progress: hits[n] ? 1 : clip(cur / n),
      hint: hits[n] ? undefined : `ora ${cur} su ${n}`,
    });
  }

  // ---- diario
  const weighed = entries.filter((e) => e.weight !== undefined).map((e) => e.date);
  for (const n of [7, 30, 60, 100]) {
    const date = weighed.length >= n ? weighed[n - 1] : undefined;
    out.push({
      id: `diario-${n}`,
      group: "diario",
      title: `${n} giorni di peso registrato`,
      done: !!date,
      date,
      progress: date ? 1 : clip(weighed.length / n),
      hint: date ? undefined : `${weighed.length} su ${n}`,
    });
  }
  return out;
}

/** Traguardi raggiunti negli ultimi `days` giorni. */
export function recentMilestones(list: Milestone[], today: string, days = 2): Milestone[] {
  return list.filter((m) => m.done && m.date && diffDays(today, m.date) >= 0 && diffDays(today, m.date) <= days);
}
