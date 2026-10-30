"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LineCard from "@/components/Charts";
import PageBanner from "@/components/PageBanner";
import { EXAM_FIELDS, type ExamKey } from "@/components/ExamFields";
import { diffDays, longDate, shortDate, todayKey } from "@/lib/dates";
import { lastDays } from "@/lib/metrics";
import { useData } from "@/lib/useData";
import { useMeta } from "@/lib/useMeta";
import type { Exam } from "@/lib/types";

export default function SalutePage() {
  const { entries, ready } = useData();
  const [exams, saveExams, examsReady] = useMeta<Exam[]>("exams", []);
  const today = todayKey();

  const recent = useMemo(() => lastDays(entries, today, 30), [entries, today]);
  const rows = (pick: (e: (typeof recent)[number]) => Record<string, number | undefined>) =>
    recent.map((e) => ({ label: shortDate(e.date), ...pick(e) }));

  if (!ready || !examsReady) return <p className="text-muted">Carico…</p>;

  const sorted = [...exams].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const nextDue = last ? addMonths(last.date, 3) : null;

  return (
    <div className="space-y-5">
      <PageBanner section="salute" title="Salute">
        Ultimi 30 giorni. I valori si inseriscono nel registro di Oggi.
      </PageBanner>

      <LineCard
        title="Pressione"
        height={200}
        data={rows((e) => ({ Max: e.systolic, Min: e.diastolic }))}
        series={[
          { key: "Max", label: "Massima", color: "#d9486b", dots: true },
          { key: "Min", label: "Minima", color: "#3f8fd6", dots: true },
        ]}
      />
      <LineCard
        title="Glicemia a digiuno"
        unit=" mg/dl"
        height={180}
        band={[70, 100]}
        data={rows((e) => ({ Glicemia: e.glucose }))}
        series={[{ key: "Glicemia", label: "Glicemia", color: "#8a63d2", dots: true }]}
      />
      <LineCard
        title="Sonno"
        unit=" ore"
        height={170}
        band={[6, 9]}
        data={rows((e) => ({ Sonno: e.sleep }))}
        series={[{ key: "Sonno", label: "Ore", color: "#5b7bd5", dots: true }]}
      />
      <LineCard
        title="Acqua"
        unit=" l"
        height={170}
        data={rows((e) => ({ Acqua: e.water }))}
        series={[{ key: "Acqua", label: "Litri", color: "#3aa0d8", dots: true }]}
      />
      <LineCard
        title="Passi"
        height={170}
        data={rows((e) => ({ Passi: e.steps }))}
        series={[{ key: "Passi", label: "Passi", color: "#3fa377", dots: true }]}
      />

      <section className="rounded-2xl bg-rose text-rose-ink p-4 space-y-3">
        <h2 className="text-lg font-semibold">Esami del sangue</h2>
        {nextDue ? (
          <p className="text-sm opacity-90">
            Ultimo: {longDate(last.date)}. Prossimo consigliato: {longDate(nextDue)}
            {diffDays(today, nextDue) > 0 ? " (scaduto)" : ""}.
          </p>
        ) : (
          <p className="text-sm opacity-90">Nessun esame registrato. Controllo consigliato ogni 3 mesi.</p>
        )}
        <ExamForm onSave={(ex) => saveExams([...exams, ex])} />
      </section>

      {sorted.map((ex, i) => (
        <ExamCard
          key={ex.id}
          exam={ex}
          prev={sorted[i + 1]}
          onDelete={() => {
            if (window.confirm("Eliminare questo esame?")) void saveExams(exams.filter((x) => x.id !== ex.id));
          }}
        />
      ))}

      <Link
        href="/report/"
        className="block w-full rounded-xl bg-sky text-sky-ink py-4 text-center text-lg font-semibold"
      >
        Report per il medico
      </Link>
    </div>
  );
}

function addMonths(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1 + n, d);
  return todayKey(dt);
}

function ExamForm({ onSave }: { onSave: (e: Exam) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [vals, setVals] = useState<Partial<Record<ExamKey, string>>>({});

  async function submit() {
    const exam: Exam = { id: `${Date.now()}`, date };
    let any = false;
    for (const f of EXAM_FIELDS) {
      const n = parseFloat((vals[f.key] ?? "").replace(",", "."));
      if (Number.isFinite(n)) {
        exam[f.key] = n;
        any = true;
      }
    }
    if (!any) return;
    await onSave(exam);
    setVals({});
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-accent text-on-accent py-3 font-semibold"
      >
        Aggiungi esame
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm text-muted">Data del prelievo</span>
        <input
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        {EXAM_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm text-muted">
              {f.label} ({f.unit})
            </span>
            <input
              inputMode="decimal"
              value={vals[f.key] ?? ""}
              onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
            />
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-line py-3">
          Annulla
        </button>
        <button type="button" onClick={submit} className="rounded-xl bg-accent text-on-accent py-3 font-semibold">
          Salva esame
        </button>
      </div>
    </div>
  );
}

function ExamCard({ exam, prev, onDelete }: { exam: Exam; prev?: Exam; onDelete: () => void }) {
  return (
    <section className="rounded-2xl bg-card border border-line p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{longDate(exam.date)}</h3>
        <button type="button" onClick={onDelete} className="text-sm text-muted">
          Elimina
        </button>
      </div>
      <dl className="mt-2 divide-y divide-line">
        {EXAM_FIELDS.filter((f) => exam[f.key] !== undefined).map((f) => {
          const v = exam[f.key] as number;
          const p = prev?.[f.key];
          const arrow = p === undefined ? "" : v > p ? "↑" : v < p ? "↓" : "=";
          return (
            <div key={f.key} className="flex justify-between py-2">
              <dt className="text-muted">{f.label}</dt>
              <dd>
                <span className="font-semibold">
                  {v} {f.unit}
                </span>
                {p !== undefined && (
                  <span className="text-sm text-muted">
                    {" "}
                    {arrow} (prima {p})
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

