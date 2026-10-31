import { STEPS_RANGE, STEPS_TARGET, fmtSteps, nextStepGoal, stepBenefit } from "@/lib/steps";

function Bar({ steps }: { steps: number }) {
  const pct = Math.min(100, Math.round((steps / STEPS_TARGET) * 100));
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-card"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={STEPS_TARGET}
      aria-valuenow={Math.min(steps, STEPS_TARGET)}
      aria-label="Passi rispetto all'obiettivo"
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Line({ label, steps }: { label: string; steps: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm opacity-80">{label}</span>
        <span className="text-right">
          <strong className="text-xl">{fmtSteps(steps)}</strong> passi · beneficio{" "}
          <strong className="text-xl">{stepBenefit(steps)}%</strong>
        </span>
      </div>
      <Bar steps={steps} />
    </div>
  );
}

/** Passi consigliati e quota del beneficio raggiunta (oggi e/o media). */
export default function StepsCard({ today, avg7, avg30 }: { today?: number; avg7?: number; avg30?: number }) {
  const ref = avg7 ?? today;
  const missing = today !== undefined ? STEPS_TARGET - today : undefined;
  return (
    <section className="rounded-2xl bg-mint text-mint-ink p-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Passi consigliati: {fmtSteps(STEPS_TARGET)} al giorno</h2>
        <p className="text-sm opacity-80">
          Sopra i 60 anni gli studi indicano {fmtSteps(STEPS_RANGE[0])}-{fmtSteps(STEPS_RANGE[1])} passi: oltre, il
          vantaggio in più è piccolo.
        </p>
      </div>

      {today !== undefined && <Line label="Oggi" steps={today} />}
      {avg7 !== undefined && <Line label="Media 7 giorni" steps={avg7} />}
      {avg30 !== undefined && <Line label="Media 30 giorni" steps={avg30} />}
      {today === undefined && avg7 === undefined && avg30 === undefined && (
        <p>Scrivi i passi di oggi in &quot;Giornata&quot;: qui vedi quanta parte del beneficio hai raggiunto.</p>
      )}

      {missing !== undefined && (
        <p>
          {missing > 0
            ? `Mancano ${fmtSteps(missing)} passi all'obiettivo di oggi.`
            : "Obiettivo di oggi raggiunto. Bene."}
        </p>
      )}
      {ref !== undefined && ref < STEPS_TARGET && (
        <p>
          Prossimo traguardo: <strong>{fmtSteps(nextStepGoal(ref))} passi al giorno</strong>. Aumenta di 500-1.000
          passi a settimana, senza fretta.
        </p>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Come si legge la percentuale</summary>
        <div className="mt-2 space-y-2 opacity-90">
          <p>
            100% vuol dire aver raggiunto il vantaggio che gli studi osservano a {fmtSteps(STEPS_TARGET)} passi
            rispetto a 2.000: rischio di morte per ogni causa più basso del 47%, malattie cardiovascolari -25%,
            demenza -38%, sintomi depressivi -22%, cadute -28%, diabete di tipo 2 -14%.
          </p>
          <p>
            Da 2.000 a {fmtSteps(STEPS_TARGET)} passi il beneficio sale in modo graduale (circa 50% a 4.000, 70% a
            5.000, 86% a 6.000) e poi si appiattisce. La curva è una stima costruita sui dati degli studi: descrive
            gruppi di persone, non garantisce nulla sul singolo, e non dimostra che i passi siano la causa.
          </p>
          <p>
            Fonti: Ding D. e altri, Lancet Public Health 2025 (revisione e meta-analisi); Paluch A.E. e altri, Lancet
            Public Health 2022 (sopra i 60 anni il vantaggio cresce fino a 6.000-8.000 passi).
          </p>
          <p>
            Se camminando senti dolore al petto, mancanza di fiato o giramenti di testa, fermati e senti il medico.
          </p>
        </div>
      </details>
    </section>
  );
}
