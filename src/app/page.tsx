"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/useData";
import { useMeta } from "@/lib/useMeta";
import { fastState } from "@/lib/fasting";
import { addDays, diffDays, formatDate, todayKey, weekStart } from "@/lib/dates";
import { buildAdvice } from "@/lib/advice";
import { baseWeek, breakfastOf, lunchOf } from "@/lib/menu";
import { avgAt } from "@/lib/metrics";
import VoiceButton from "@/components/VoiceButton";
import SyncBadge from "@/components/SyncBadge";
import { parseVoice } from "@/lib/voice";
import type { Entry, Exam, MenuPlan } from "@/lib/types";

const num = (v = ""): number | undefined => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
};

function Field(props: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-muted">
        {props.label}
        {props.unit ? ` (${props.unit})` : ""}
      </span>
      <input
        inputMode="decimal"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
      />
    </label>
  );
}

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <span className="text-sm text-muted">{label}</span>
      <div className="mt-1 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-xl border py-3 text-lg ${
              value === n
                ? "bg-accent text-white border-accent"
                : "bg-card border-line"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OggiPage() {
  return (
    <Suspense fallback={<p className="text-muted">Carico…</p>}>
      <Oggi />
    </Suspense>
  );
}

function Oggi() {
  const { entries, settings, ready, rev, upsert } = useData();
  const realToday = todayKey();
  const param = useSearchParams().get("d");
  const [picked, setPicked] = useState<string | null>(null);
  const requested = picked ?? param;
  const today =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && diffDays(requested, realToday) <= 0
      ? requested
      : realToday;
  const isToday = today === realToday;
  const [now, setNow] = useState<Date | null>(null);
  const [exams] = useMeta<Exam[]>("exams", []);
  const ws = weekStart(realToday);
  const [plan] = useMeta<MenuPlan | null>(`menu:${ws}`, null);
  const dayMenu = (plan ?? baseWeek(ws)).days[(new Date().getDay() + 6) % 7];
  const alerts = useMemo(
    () => buildAdvice(entries, settings, exams, realToday).filter((a) => a.level !== "info").slice(0, 2),
    [entries, settings, exams, realToday],
  );

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const stats = useMemo(() => {
    const withW = entries.filter((e) => e.weight !== undefined);
    const last = withW.at(-1)?.weight ?? settings.startWeight;
    const h = settings.heightCm / 100;
    return {
      last,
      lost: settings.startWeight - last,
      toGo: Math.max(0, last - settings.goalMax),
      bmi: last / (h * h),
      avg: withW.length ? avgAt(entries, withW.at(-1)!.date) : undefined,
    };
  }, [entries, settings]);

  const fast = now ? fastState(now, settings.windowStart, settings.windowEnd) : null;

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold capitalize">{formatDate(today)}</h1>
          <Link href="/impostazioni/" className="text-sm text-accent">
            Impostazioni
          </Link>
        </div>
        <SyncBadge />
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setPicked(addDays(today, -1))}
            className="rounded-lg border border-line bg-card px-3 py-2"
          >
            ← Giorno prima
          </button>
          {!isToday && (
            <>
              <button
                type="button"
                onClick={() => setPicked(addDays(today, 1))}
                className="rounded-lg border border-line bg-card px-3 py-2"
              >
                Giorno dopo →
              </button>
              <button
                type="button"
                onClick={() => setPicked(realToday)}
                className="rounded-lg border border-accent text-accent px-3 py-2"
              >
                Oggi
              </button>
            </>
          )}
        </div>
        {!isToday && (
          <p className="text-sm text-amber-700">Stai modificando un giorno passato.</p>
        )}
      </header>

      {alerts.length > 0 && (
        <Link href="/consigli/" className="block space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-3 ${
                a.level === "warning" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
              }`}
            >
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm">{a.text}</p>
            </div>
          ))}
        </Link>
      )}

      {isToday && (
      <section className="rounded-2xl bg-card border border-line p-4">
        {fast ? (
          <>
            <p className="font-semibold">{fast.label}</p>
            <p className="text-muted text-sm">{fast.detail}</p>
            <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
              <div
                className={`h-full ${fast.eating ? "bg-amber-500" : "bg-accent"}`}
                style={{ width: `${Math.min(100, fast.progress * 100)}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-muted">Carico…</p>
        )}
      </section>
      )}

      {isToday && (
        <section className="rounded-2xl bg-card border border-line p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Menu di oggi</h2>
            <Link href="/menu/" className="text-sm text-accent">
              Settimana
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Colazione</p>
            <p>{breakfastOf(dayMenu.breakfast).name}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Pranzo</p>
            <p>{lunchOf(dayMenu.lunch).name}</p>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <Stat label="Peso attuale" value={`${stats.last.toFixed(1)} kg`} />
        <Stat label="Media 7 giorni" value={stats.avg ? `${stats.avg.toFixed(1)} kg` : "—"} />
        <Stat
          label={`Al traguardo (${settings.goalMax} kg)`}
          value={`${stats.toGo.toFixed(1)} kg`}
        />
        <Stat label="BMI" value={stats.bmi.toFixed(1)} />
      </section>

      {ready ? (
        <TodayForm
          key={`${today}:${rev}`}
          today={today}
          initial={entries.find((e) => e.date === today)}
          onSave={upsert}
        />
      ) : (
        <p className="text-muted">Carico…</p>
      )}
    </div>
  );
}

const str = (v?: number) => (v === undefined ? "" : String(v));

function TodayForm({
  today,
  initial,
  onSave,
}: {
  today: string;
  initial?: Entry;
  onSave: (e: Entry) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({
    weight: str(initial?.weight),
    waist: str(initial?.waist),
    water: str(initial?.water),
    sleep: str(initial?.sleep),
    steps: str(initial?.steps),
    systolic: str(initial?.systolic),
    diastolic: str(initial?.diastolic),
    glucose: str(initial?.glucose),
    notes: initial?.notes ?? "",
  });
  const [energy, setEnergy] = useState(initial?.energy);
  const [hunger, setHunger] = useState(initial?.hunger);
  const [kept, setKept] = useState(initial?.fastingKept);
  const [saved, setSaved] = useState(false);
  const [heard, setHeard] = useState<{ text: string; understood: string[] } | null>(null);

  function applyVoice(text: string) {
    const r = parseVoice(text);
    setHeard({ text, understood: r.understood });
    if (!r.understood.length) return;
    setSaved(false);
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(r.values)) {
      if (k !== "energy" && k !== "hunger") next[k] = String(v);
    }
    if (r.notes) next.notes = draft.notes ? `${draft.notes} ${r.notes}` : r.notes;
    setDraft((d) => ({ ...d, ...next }));
    if (r.values.energy !== undefined) setEnergy(r.values.energy);
    if (r.values.hunger !== undefined) setHunger(r.values.hunger);
    if (r.fastingKept !== undefined) setKept(r.fastingKept);
  }

  const set = (k: string) => (v: string) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [k]: v }));
  };

  async function save() {
    await onSave({
      date: today,
      weight: num(draft.weight),
      waist: num(draft.waist),
      water: num(draft.water),
      sleep: num(draft.sleep),
      steps: num(draft.steps),
      systolic: num(draft.systolic),
      diastolic: num(draft.diastolic),
      glucose: num(draft.glucose),
      energy,
      hunger,
      fastingKept: kept,
      notes: draft.notes.trim() || undefined,
    });
    setSaved(true);
  }

  return (
    <section className="rounded-2xl bg-card border border-line p-4 space-y-4">
      <h2 className="text-lg font-semibold">Registro di oggi</h2>

      <div className="space-y-2">
        <VoiceButton onText={applyVoice} />
        <p className="text-xs text-muted">
          Esempio: &quot;peso 92 virgola 4, vita 106, acqua un litro e mezzo, sonno 7 ore, pressione 130 su 80,
          glicemia 98, energia 4, fame 2, finestra rispettata sì&quot;. La dettatura usa il servizio vocale del
          browser. Controlla i campi e poi premi Salva.
        </p>
        {heard && (
          <div className="rounded-xl bg-line/50 p-3 text-sm">
            <p className="text-muted">Ho sentito: &quot;{heard.text}&quot;</p>
            <p className="mt-1">
              {heard.understood.length
                ? `Capito: ${heard.understood.join(" · ")}`
                : "Non ho capito nessun valore. Di' prima il nome e poi il numero, ad esempio \"peso 92 virgola 4\"."}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Peso" unit="kg" value={draft.weight} onChange={set("weight")} />
        <Field label="Vita" unit="cm" value={draft.waist} onChange={set("waist")} />
        <Field label="Acqua" unit="litri" value={draft.water} onChange={set("water")} />
        <Field label="Sonno" unit="ore" value={draft.sleep} onChange={set("sleep")} />
        <Field label="Passi" value={draft.steps} onChange={set("steps")} />
        <Field label="Glicemia" unit="mg/dl" value={draft.glucose} onChange={set("glucose")} />
        <Field label="Pressione max" value={draft.systolic} onChange={set("systolic")} />
        <Field label="Pressione min" value={draft.diastolic} onChange={set("diastolic")} />
      </div>

      <div>
        <span className="text-sm text-muted">Aggiungi acqua</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {[0.25, 0.5, 1].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() =>
                set("water")(String(Math.round(((num(draft.water) ?? 0) + q) * 100) / 100))
              }
              className="rounded-xl border border-line bg-card py-3"
            >
              +{String(q).replace(".", ",")} l
            </button>
          ))}
        </div>
      </div>

      <Scale
        label="Energia (1 bassa, 5 alta)"
        value={energy}
        onChange={(v) => {
          setSaved(false);
          setEnergy(v);
        }}
      />
      <Scale
        label="Fame (1 poca, 5 tanta)"
        value={hunger}
        onChange={(v) => {
          setSaved(false);
          setHunger(v);
        }}
      />

      <div>
        <span className="text-sm text-muted">Finestra alimentare rispettata?</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {[
            { v: true, t: "Sì" },
            { v: false, t: "No" },
          ].map((o) => (
            <button
              key={o.t}
              type="button"
              onClick={() => {
                setSaved(false);
                setKept(o.v);
              }}
              className={`rounded-xl border py-3 text-lg ${
                kept === o.v ? "bg-accent text-white border-accent" : "bg-card border-line"
              }`}
            >
              {o.t}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm text-muted">Note</span>
        <textarea
          value={draft.notes}
          onChange={(e) => set("notes")(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3"
        />
      </label>

      <button
        type="button"
        onClick={save}
        className="w-full rounded-xl bg-accent text-white py-4 text-lg font-semibold"
      >
        Salva
      </button>
      {saved && <p className="text-center text-accent">Salvato.</p>}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-line p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
