"use client";

import { useMemo, useState } from "react";
import { buildMilestones, type Milestone } from "@/lib/milestones";
import { longDate } from "@/lib/dates";
import type { Entry, Settings } from "@/lib/types";

const ICON: Record<Milestone["group"], string> = { peso: "⚖️", vita: "📏", serie: "⏱️", diario: "📓" };

export default function MilestonesCard({
  entries,
  settings,
  today,
}: {
  entries: Entry[];
  settings: Settings;
  today: string;
}) {
  const [all, setAll] = useState(false);
  const list = useMemo(() => buildMilestones(entries, settings, today), [entries, settings, today]);
  const done = list.filter((m) => m.done).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const next = list.filter((m) => !m.done).sort((a, b) => b.progress - a.progress);
  const shownDone = all ? done : done.slice(0, 3);
  const shownNext = all ? next : next.slice(0, 3);

  return (
    <section className="rounded-2xl bg-butter text-butter-ink p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Traguardi</h2>
        <p className="text-sm opacity-80">
          {done.length} su {list.length}
        </p>
      </div>

      {shownNext.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Prossimi</p>
          {shownNext.map((m) => (
            <div key={m.id} className="rounded-xl bg-card text-foreground p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p>
                  <span aria-hidden="true">{ICON[m.group]} </span>
                  {m.title}
                </p>
                <p className="shrink-0 text-xs text-muted">{m.hint}</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(m.progress * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {shownDone.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Raggiunti</p>
          {shownDone.map((m) => (
            <div key={m.id} className="flex items-baseline justify-between gap-2 rounded-xl bg-mint text-mint-ink p-3">
              <p>
                <span aria-hidden="true">{ICON[m.group]} </span>
                {m.title}
              </p>
              {m.date && <p className="shrink-0 text-xs opacity-80">{longDate(m.date)}</p>}
            </div>
          ))}
        </div>
      )}

      {list.length > 6 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="text-sm font-medium underline">
          {all ? "Mostra meno" : "Mostra tutti"}
        </button>
      )}
      <p className="text-xs opacity-80">I traguardi di peso usano la media dei 7 giorni, così un giorno storto non conta.</p>
    </section>
  );
}
