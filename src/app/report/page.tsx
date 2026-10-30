"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EXAM_FIELDS } from "@/components/ExamFields";
import { addDays, longDate, shortDate, todayKey, weekStart } from "@/lib/dates";
import { avgAt, bmi, lastDays } from "@/lib/metrics";
import { useData } from "@/lib/useData";
import { useMeta } from "@/lib/useMeta";
import type { Exam } from "@/lib/types";

const avg = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined);
const f1 = (n?: number, d = 1) => (n === undefined ? "—" : n.toFixed(d).replace(".", ","));

export default function ReportPage() {
  const { entries, settings, ready } = useData();
  const [exams] = useMeta<Exam[]>("exams", []);
  const [days, setDays] = useState(30);
  const today = todayKey();

  const data = useMemo(() => {
    const period = lastDays(entries, today, days);
    const weights = entries.filter((e) => e.weight !== undefined);
    const last = weights.at(-1);

    // una riga per settimana: media dei pesi
    const weeks = new Map<string, number[]>();
    for (const e of period) {
      if (e.weight === undefined) continue;
      const k = weekStart(e.date);
      weeks.set(k, [...(weeks.get(k) ?? []), e.weight]);
    }
    const bp = period.filter((e) => e.systolic !== undefined && e.diastolic !== undefined);
    const bpHigh = bp.filter((e) => (e.systolic as number) > 140 || (e.diastolic as number) > 90).length;
    const gl = period.filter((e) => e.glucose !== undefined);
    const waists = period.filter((e) => e.waist !== undefined);
    const kept = period.filter((e) => e.fastingKept !== undefined);

    return {
      last,
      weeks: [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ k, avg: avg(v)!, n: v.length })),
      avgW: last ? avgAt(entries, last.date) : undefined,
      bp,
      bpHigh,
      avgSys: avg(bp.map((e) => e.systolic as number)),
      avgDia: avg(bp.map((e) => e.diastolic as number)),
      gl,
      avgGl: avg(gl.map((e) => e.glucose as number)),
      minGl: gl.length ? Math.min(...gl.map((e) => e.glucose as number)) : undefined,
      maxGl: gl.length ? Math.max(...gl.map((e) => e.glucose as number)) : undefined,
      waistFirst: waists[0]?.waist,
      waistLast: waists.at(-1)?.waist,
      sleep: avg(period.filter((e) => e.sleep !== undefined).map((e) => e.sleep as number)),
      water: avg(period.filter((e) => e.water !== undefined).map((e) => e.water as number)),
      steps: avg(period.filter((e) => e.steps !== undefined).map((e) => e.steps as number)),
      keptDays: kept.filter((e) => e.fastingKept).length,
      keptTotal: kept.length,
    };
  }, [entries, days, today]);

  if (!ready) return <p className="text-muted">Carico…</p>;

  const sortedExams = [...exams].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
  const startDate = addDays(today, -(days - 1));
  const current = data.last?.weight ?? settings.startWeight;

  return (
    <div className="space-y-5 report">
      <div className="print:hidden space-y-3">
        <Link href="/salute/" className="text-sm text-accent">
          ← Salute
        </Link>
        <div className="grid grid-cols-3 gap-2">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-xl border py-2 ${
                days === d ? "bg-accent text-white border-accent" : "bg-card border-line"
              }`}
            >
              {d} giorni
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full rounded-xl bg-accent text-white py-4 text-lg font-semibold"
        >
          Stampa o salva in PDF
        </button>
      </div>

      <header>
        <h1 className="text-2xl font-semibold">Report per il medico</h1>
        <p className="text-muted">
          Dal {longDate(startDate)} al {longDate(today)}
        </p>
      </header>

      <Block title="Dati di base">
        <Row k="Altezza" v={`${settings.heightCm} cm`} />
        <Row k="Peso di partenza" v={`${f1(settings.startWeight)} kg`} />
        <Row k="Ultimo peso" v={`${f1(current)} kg${data.last ? ` (${shortDate(data.last.date)})` : ""}`} />
        <Row k="Media ultimi 7 giorni" v={`${f1(data.avgW)} kg`} />
        <Row k="BMI attuale" v={f1(bmi(current, settings.heightCm))} />
        <Row k="Obiettivo iniziale" v={`${settings.goalMin}-${settings.goalMax} kg`} />
        <Row
          k="Vita"
          v={
            data.waistFirst === undefined
              ? "—"
              : `${f1(data.waistFirst)} → ${f1(data.waistLast)} cm`
          }
        />
      </Block>

      <Block title="Peso, media per settimana">
        {data.weeks.length === 0 ? (
          <p className="text-muted">Nessuna pesata nel periodo.</p>
        ) : (
          data.weeks.map((w) => (
            <Row key={w.k} k={`Settimana dal ${shortDate(w.k)}`} v={`${f1(w.avg)} kg (${w.n} pesate)`} />
          ))
        )}
      </Block>

      <Block title="Pressione">
        {data.bp.length === 0 ? (
          <p className="text-muted">Nessuna misura nel periodo.</p>
        ) : (
          <>
            <Row k="Misure" v={String(data.bp.length)} />
            <Row k="Media" v={`${f1(data.avgSys, 0)}/${f1(data.avgDia, 0)} mmHg`} />
            <Row k="Misure sopra 140/90" v={String(data.bpHigh)} />
          </>
        )}
      </Block>

      <Block title="Glicemia a digiuno">
        {data.gl.length === 0 ? (
          <p className="text-muted">Nessuna misura nel periodo.</p>
        ) : (
          <>
            <Row k="Misure" v={String(data.gl.length)} />
            <Row k="Media" v={`${f1(data.avgGl, 0)} mg/dl`} />
            <Row k="Minima / massima" v={`${data.minGl} / ${data.maxGl} mg/dl`} />
          </>
        )}
      </Block>

      <Block title="Abitudini">
        <Row k="Digiuno 16:8 rispettato" v={data.keptTotal ? `${data.keptDays} giorni su ${data.keptTotal} registrati` : "—"} />
        <Row k="Sonno medio" v={data.sleep === undefined ? "—" : `${f1(data.sleep)} ore`} />
        <Row k="Acqua media" v={data.water === undefined ? "—" : `${f1(data.water)} litri`} />
        <Row k="Passi medi" v={data.steps === undefined ? "—" : String(Math.round(data.steps))} />
      </Block>

      <Block title="Ultimi esami del sangue">
        {sortedExams.length === 0 ? (
          <p className="text-muted">Nessun esame registrato.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 font-normal">Valore</th>
                {sortedExams.map((e) => (
                  <th key={e.id} className="py-1 font-normal">
                    {longDate(e.date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXAM_FIELDS.filter((f) => sortedExams.some((e) => e[f.key] !== undefined)).map((f) => (
                <tr key={f.key} className="border-t border-line">
                  <td className="py-1.5">
                    {f.label} ({f.unit})
                  </td>
                  {sortedExams.map((e) => (
                    <td key={e.id}>{e[f.key] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Block>

      <p className="text-xs text-muted">
        Dieta senza zuccheri e a basso contenuto di carboidrati con digiuno intermittente 16:8 (si salta la cena).
        Dati inseriti dal paziente, generati dall&apos;app il {longDate(today)}. Non sono una diagnosi.
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-line p-4 break-inside-avoid">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="text-muted">{k}</span>
      <span className="font-semibold text-right">{v}</span>
    </div>
  );
}
