"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildAdvice, summaryLine, type Level } from "@/lib/advice";
import { todayKey } from "@/lib/dates";
import { useData } from "@/lib/useData";
import { useMeta } from "@/lib/useMeta";
import type { Exam } from "@/lib/types";

const style: Record<Level, { box: string; tag: string }> = {
  warning: { box: "border-red-300 bg-red-50", tag: "Avviso" },
  attention: { box: "border-amber-300 bg-amber-50", tag: "Attenzione" },
  info: { box: "border-line bg-card", tag: "Info" },
};

export default function ConsigliPage() {
  const { entries, settings, ready } = useData();
  const [exams] = useMeta<Exam[]>("exams", []);
  const today = todayKey();

  const advice = useMemo(() => buildAdvice(entries, settings, exams, today), [entries, settings, exams, today]);
  const summary = summaryLine(entries, settings);

  if (!ready) return <p className="text-muted">Carico…</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Consigli</h1>
      {summary && (
        <p className="rounded-2xl bg-card border border-line p-4">{summary}</p>
      )}

      {advice.length === 0 ? (
        <p className="text-muted">Per ora nessun consiglio: registra qualche giorno di dati.</p>
      ) : (
        <ul className="space-y-3">
          {advice.map((a, i) => (
            <li key={i} className={`rounded-2xl border p-4 ${style[a.level].box}`}>
              <p className="text-xs uppercase tracking-wide text-muted">{style[a.level].tag}</p>
              <p className="font-semibold mt-0.5">{a.title}</p>
              <p className="mt-1">{a.text}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-muted">
        I consigli sono calcolati sui tuoi dati con soglie di lavoro, da confermare con il medico. Non sono una
        diagnosi e non sostituiscono una visita. Esami e valori sono in{" "}
        <Link href="/salute/" className="text-accent">
          Salute
        </Link>
        .
      </p>
    </div>
  );
}
