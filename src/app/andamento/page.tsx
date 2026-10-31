"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LineCard from "@/components/Charts";
import CompareCard from "@/components/CompareCard";
import MilestonesCard from "@/components/MilestonesCard";
import PageBanner from "@/components/PageBanner";
import StepsCard from "@/components/StepsCard";
import { avgSteps } from "@/lib/steps";
import { TONES, type Tone } from "@/lib/sections";
import { useData } from "@/lib/useData";
import { addDays, diffDays, longDate, shortDate, todayKey, weekStart } from "@/lib/dates";
import { avgAt, bmi, estimateArrival, fastingStreak, weeklyTrend, weightPoints } from "@/lib/metrics";

const RANGES = [
  { id: 30, label: "30 giorni" },
  { id: 90, label: "90 giorni" },
  { id: 0, label: "Tutto" },
];

export default function AndamentoPage() {
  const { entries, settings, ready } = useData();
  const [range, setRange] = useState(30);
  const today = todayKey();

  const stats = useMemo(() => {
    const w = entries.filter((e) => e.weight !== undefined);
    const last = w.at(-1);
    const current = last?.weight ?? settings.startWeight;
    const avg = last ? avgAt(entries, last.date) : undefined;
    const trend = weeklyTrend(entries, today);
    return {
      current,
      lost: settings.startWeight - current,
      avg,
      trend,
      bmi: bmi(current, settings.heightCm),
      streak: fastingStreak(entries, today),
      eta: estimateArrival(entries, settings, today),
      count: w.length,
    };
  }, [entries, settings, today]);

  const inRange = (date: string) => range === 0 || diffDays(today, date) < range;

  const weightRows = useMemo(
    () =>
      weightPoints(entries)
        .filter((p) => inRange(p.date))
        .map((p) => ({ label: shortDate(p.date), Peso: p.weight, Media: p.avg })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, range],
  );
  const waistRows = useMemo(
    () =>
      entries
        .filter((e) => e.waist !== undefined && inRange(e.date))
        .map((e) => ({ label: shortDate(e.date), Vita: e.waist })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, range],
  );

  // calendario: ultime 5 settimane, a partire dal lunedì
  const cal = useMemo(() => {
    const start = addDays(weekStart(today), -28);
    const map = new Map(entries.map((e) => [e.date, e]));
    return Array.from({ length: 35 }, (_, i) => {
      const date = addDays(start, i);
      return { date, e: map.get(date), future: diffDays(date, today) > 0 };
    });
  }, [entries, today]);

  if (!ready) return <p className="text-muted">Carico…</p>;

  const etaText =
    stats.eta.state === "reached"
      ? "Traguardo raggiunto"
      : stats.eta.state === "date"
        ? longDate(stats.eta.date)
        : "Servono più pesate";

  return (
    <div className="space-y-5">
      <PageBanner section="andamento" title="Andamento">
        Come cambiano peso e vita nel tempo.
      </PageBanner>

      <section className="grid grid-cols-2 gap-3">
        <Stat tone={TONES[4]} label="Peso attuale" value={`${stats.current.toFixed(1)} kg`} />
        <Stat tone={TONES[0]} label="Persi dall'inizio" value={`${stats.lost.toFixed(1)} kg`} />
        <Stat tone={TONES[1]} label="Media 7 giorni" value={stats.avg ? `${stats.avg.toFixed(1)} kg` : "—"} />
        <Stat
          tone={TONES[2]}
          label="Ritmo"
          value={stats.trend === undefined ? "—" : `${stats.trend > 0 ? "+" : ""}${stats.trend.toFixed(2)} kg/sett.`}
        />
        <Stat tone={TONES[5]} label="BMI" value={stats.bmi.toFixed(1)} />
        <Stat tone={TONES[3]} label="Giorni di fila nella finestra" value={String(stats.streak)} />
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-mint to-sky p-4">
        <p className="text-sm text-muted">Arrivo stimato a {settings.goalMax} kg</p>
        <p className="text-xl font-semibold mt-1">{etaText}</p>
        <p className="text-xs text-muted mt-1">
          Calcolato sul ritmo delle ultime 3 settimane: cambia se cambia il ritmo.
        </p>
      </section>

      <div className="grid grid-cols-3 gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={`rounded-xl border py-2 ${
              range === r.id ? "bg-accent text-on-accent border-accent" : "bg-card border-line"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <LineCard
        title="Peso"
        unit=" kg"
        data={weightRows}
        band={[settings.goalMin, settings.goalMax]}
        series={[
          { key: "Peso", label: "Peso", color: "#9aa7b5", dots: true },
          { key: "Media", label: "Media 7 gg", color: "#2f9e84" },
        ]}
      />
      <LineCard
        title="Vita"
        unit=" cm"
        data={waistRows}
        series={[{ key: "Vita", label: "Vita", color: "#e0803f", dots: true }]}
      />

      <StepsCard avg7={avgSteps(entries, today, 7)} avg30={avgSteps(entries, today, 30)} />

      <MilestonesCard entries={entries} settings={settings} today={today} />

      <CompareCard entries={entries} />

      <section className="rounded-2xl bg-card border border-line p-4">
        <h2 className="text-lg font-semibold">Finestra alimentare rispettata</h2>
        <div className="grid grid-cols-7 gap-1.5 mt-3 text-center text-xs text-muted">
          {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
          {cal.map((c) => {
            const color = c.future
              ? "bg-transparent border border-dashed border-line"
              : c.e?.offPlan
                ? "bg-lilac text-lilac-ink font-semibold"
                : c.e?.fastingKept === true
                ? "bg-mint text-mint-ink font-semibold"
                : c.e?.fastingKept === false
                  ? "bg-peach text-peach-ink font-semibold"
                  : "bg-line text-muted";
            return (
              <Link
                key={c.date}
                href={`/?d=${c.date}`}
                aria-label={longDate(c.date)}
                className={`rounded-lg py-2 text-sm ${color}`}
              >
                {Number(c.date.slice(8))}
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-3">
          Verde: rispettata. Arancio: non rispettata. Viola: fuori regola (non conta). Grigio: nessun dato. Tocca un giorno per modificarlo.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-2xl p-4 ${tone.chip}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}
