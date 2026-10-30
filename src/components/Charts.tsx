"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type Series = { key: string; label: string; color: string; dashed?: boolean; dots?: boolean };
export type Row = { label: string } & Record<string, number | string | undefined>;

export default function LineCard({
  title,
  data,
  series,
  unit = "",
  band,
  height = 220,
}: {
  title: string;
  data: Row[];
  series: Series[];
  unit?: string;
  band?: [number, number];
  height?: number;
}) {
  return (
    <section className="rounded-2xl bg-card border border-line p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-3 text-xs text-muted">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
          {band && (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-mint" />
              obiettivo
            </span>
          )}
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-muted text-sm mt-3">Ancora nessun dato.</p>
      ) : (
        <div className="mt-3" style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} stroke="var(--line)" interval="preserveStartEnd" minTickGap={24} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                stroke="var(--line)"
                domain={[
                  (min: number) => Math.floor(Math.min(min, band?.[0] ?? min) - 1),
                  (max: number) => Math.ceil(max + 1),
                ]}
              />
              <Tooltip
                formatter={(v) => `${v}${unit}`}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "var(--muted)" }}
              />
              {band && <ReferenceArea y1={band[0]} y2={band[1]} fill="var(--mint-ink)" fillOpacity={0.18} />}
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? "5 4" : undefined}
                  dot={s.dots ?? false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
