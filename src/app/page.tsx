"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/useData";
import { fastState } from "@/lib/fasting";
import { formatDate, todayKey } from "@/lib/dates";
import type { Entry } from "@/lib/types";

const num = (v: string): number | undefined => {
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
  const { entries, settings, ready, upsert } = useData();
  const today = todayKey();
  const [now, setNow] = useState<Date | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [energy, setEnergy] = useState<number | undefined>();
  const [hunger, setHunger] = useState<number | undefined>();
  const [kept, setKept] = useState<boolean | undefined>();
  const [saved, setSaved] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // carica i valori già salvati per oggi, una volta sola
  useEffect(() => {
    if (!ready || loadedFor === today) return;
    const e = entries.find((x) => x.date === today);
    if (e) {
      const s = (v?: number) => (v === undefined ? "" : String(v));
      setDraft({
        weight: s(e.weight),
        waist: s(e.waist),
        water: s(e.water),
        sleep: s(e.sleep),
        steps: s(e.steps),
        systolic: s(e.systolic),
        diastolic: s(e.diastolic),
        glucose: s(e.glucose),
        notes: e.notes ?? "",
      });
      setEnergy(e.energy);
      setHunger(e.hunger);
      setKept(e.fastingKept);
    }
    setLoadedFor(today);
  }, [ready, entries, today, loadedFor]);

  const stats = useMemo(() => {
    const withW = entries.filter((e) => e.weight !== undefined);
    const last = withW.at(-1)?.weight ?? settings.startWeight;
    const h = settings.heightCm / 100;
    return {
      last,
      lost: settings.startWeight - last,
      toGo: Math.max(0, last - settings.goalMax),
      bmi: last / (h * h),
    };
  }, [entries, settings]);

  const fast = now ? fastState(now, settings.windowStart, settings.windowEnd) : null;
  const set = (k: string) => (v: string) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [k]: v }));
  };

  async function save() {
    const entry: Entry = {
      date: today,
      weight: num(draft.weight ?? ""),
      waist: num(draft.waist ?? ""),
      water: num(draft.water ?? ""),
      sleep: num(draft.sleep ?? ""),
      steps: num(draft.steps ?? ""),
      systolic: num(draft.systolic ?? ""),
      diastolic: num(draft.diastolic ?? ""),
      glucose: num(draft.glucose ?? ""),
      energy,
      hunger,
      fastingKept: kept,
      notes: draft.notes?.trim() || undefined,
    };
    await upsert(entry);
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold capitalize">{formatDate(today)}</h1>
        <Link href="/impostazioni/" className="text-sm text-accent">
          Impostazioni
        </Link>
      </header>

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

      <section className="grid grid-cols-2 gap-3">
        <Stat label="Peso attuale" value={`${stats.last.toFixed(1)} kg`} />
        <Stat label="Persi" value={`${stats.lost.toFixed(1)} kg`} />
        <Stat
          label={`Al traguardo (${settings.goalMax} kg)`}
          value={`${stats.toGo.toFixed(1)} kg`}
        />
        <Stat label="BMI" value={stats.bmi.toFixed(1)} />
      </section>

      <section className="rounded-2xl bg-card border border-line p-4 space-y-4">
        <h2 className="text-lg font-semibold">Registro di oggi</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso" unit="kg" value={draft.weight ?? ""} onChange={set("weight")} />
          <Field label="Vita" unit="cm" value={draft.waist ?? ""} onChange={set("waist")} />
          <Field label="Acqua" unit="litri" value={draft.water ?? ""} onChange={set("water")} />
          <Field label="Sonno" unit="ore" value={draft.sleep ?? ""} onChange={set("sleep")} />
          <Field label="Passi" value={draft.steps ?? ""} onChange={set("steps")} />
          <Field label="Glicemia" unit="mg/dl" value={draft.glucose ?? ""} onChange={set("glucose")} />
          <Field label="Pressione max" value={draft.systolic ?? ""} onChange={set("systolic")} />
          <Field label="Pressione min" value={draft.diastolic ?? ""} onChange={set("diastolic")} />
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
            value={draft.notes ?? ""}
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
    </div>
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
