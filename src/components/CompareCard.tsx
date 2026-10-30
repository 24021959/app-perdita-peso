"use client";

import { useMemo, useState } from "react";
import { DualLineCard } from "./Charts";
import { METRICS, compareInsight, type MetricId } from "@/lib/compare";
import { shortDate } from "@/lib/dates";
import type { Entry } from "@/lib/types";

const f = (n: number, d = 1) => {
  const v = Math.abs(n) < 0.05 ? 0 : n; // evita "-0,0"
  return (v > 0 ? "+" : "") + v.toFixed(d).replace(".", ",");
};

export default function CompareCard({ entries }: { entries: Entry[] }) {
  const [metric, setMetric] = useState<MetricId>("sleep");
  const m = METRICS[metric];

  const rows = useMemo(
    () =>
      entries
        .filter((e) => e.weight !== undefined || m.get(e) !== undefined)
        .slice(-60)
        .map((e) => ({ label: shortDate(e.date), Peso: e.weight, Altro: m.get(e) })),
    [entries, m],
  );
  const insight = useMemo(() => compareInsight(entries, metric), [entries, metric]);
  const fmtT = (n: number) => (m.decimals ? n.toFixed(m.decimals).replace(".", ",") : String(Math.round(n)));

  return (
    <section className="rounded-2xl bg-lilac text-lilac-ink p-4 space-y-3">
      <h2 className="text-lg font-semibold">Confronti</h2>
      <p className="text-sm opacity-80">Il peso messo accanto a un altro dato, negli ultimi 60 giorni.</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(METRICS) as MetricId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setMetric(id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              metric === id ? "bg-accent text-on-accent border-accent" : "bg-card text-foreground border-line"
            }`}
          >
            {METRICS[id].label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-card text-foreground p-3">
        <DualLineCard
          title={`Peso e ${m.label.toLowerCase()}`}
          data={rows}
          left={{ key: "Peso", label: "Peso (kg)", color: "#2f9e84" }}
          right={{ key: "Altro", label: m.unit ? `${m.label} (${m.unit})` : m.label, color: m.color }}
        />
      </div>

      <div className="rounded-xl bg-card text-foreground p-3 text-sm space-y-1">
        {insight.ok ? (
          <>
            <p>
              Dopo i giorni con {m.label.toLowerCase()} sopra {fmtT(insight.threshold)} {m.unit} ({insight.highN} giorni)
              il peso del giorno dopo è cambiato in media di <strong>{f(insight.highChange)} kg</strong>; dopo gli altri (
              {insight.lowN} giorni) di <strong>{f(insight.lowChange)} kg</strong>.
            </p>
            <p className="text-muted">
              {Math.abs(insight.diff) < 0.15
                ? "La differenza è troppo piccola per dire qualcosa."
                : "Indicativo: con pochi giorni la differenza può essere solo un caso, e il peso oscilla di per sé."}
            </p>
          </>
        ) : (
          <p className="text-muted">{insight.reason}</p>
        )}
      </div>
    </section>
  );
}
