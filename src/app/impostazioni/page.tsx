"use client";

import Link from "next/link";
import { useState } from "react";
import AppearancePanel from "@/components/AppearancePanel";
import PageBanner from "@/components/PageBanner";
import MedsPanel from "@/components/MedsPanel";
import SyncPanel from "@/components/SyncPanel";
import { useData } from "@/lib/useData";
import { exportBackup, importBackup } from "@/lib/db";
import type { Settings } from "@/lib/types";

export default function ImpostazioniPage() {
  const { settings, ready, rev, updateSettings, reload } = useData();
  if (!ready) return <p className="opacity-80">Carico…</p>;
  return (
    <SettingsForm
      key={rev}
      initial={settings}
      updateSettings={updateSettings}
      reload={reload}
    />
  );
}

function SettingsForm({
  initial,
  updateSettings,
  reload,
}: {
  initial: Settings;
  updateSettings: (s: Settings) => Promise<void>;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState<Settings>(initial);
  const [msg, setMsg] = useState("");

  const numField = (k: keyof Settings, label: string) => (
    <label className="block" key={k}>
      <span className="text-sm opacity-80">{label}</span>
      <input
        inputMode="decimal"
        value={String(form[k])}
        onChange={(e) =>
          setForm({ ...form, [k]: parseFloat(e.target.value.replace(",", ".")) || 0 })
        }
        className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
      />
    </label>
  );

  async function doExport() {
    const blob = new Blob([await exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `perdita-peso-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup scaricato.");
  }

  async function doImport(file: File) {
    try {
      const n = await importBackup(await file.text());
      await reload();
      setMsg(`Importati ${n} giorni.`);
    } catch {
      setMsg("File non valido.");
    }
  }

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-accent">
        ← Oggi
      </Link>
      <PageBanner section="impostazioni" title="Impostazioni" />

      <section className="rounded-2xl bg-sky text-sky-ink p-4 space-y-3">
        <label className="block">
          <span className="text-sm opacity-80">Il tuo nome (per il saluto)</span>
          <input
            type="text"
            autoComplete="given-name"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
          />
        </label>
        {numField("heightCm", "Altezza (cm)")}
        {numField("startWeight", "Peso di partenza (kg)")}
        {numField("goalMin", "Obiettivo minimo (kg)")}
        {numField("goalMax", "Obiettivo massimo (kg)")}
        <label className="block">
          <span className="text-sm opacity-80">Inizio finestra alimentare</span>
          <input
            type="time"
            value={form.windowStart}
            onChange={(e) => setForm({ ...form, windowStart: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
          />
        </label>
        <label className="block">
          <span className="text-sm opacity-80">Fine finestra alimentare</span>
          <input
            type="time"
            value={form.windowEnd}
            onChange={(e) => setForm({ ...form, windowEnd: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            await updateSettings(form);
            setMsg("Impostazioni salvate.");
          }}
          className="w-full rounded-xl bg-accent text-on-accent py-4 text-lg font-semibold"
        >
          Salva
        </button>
      </section>

      <MedsPanel />

      <AppearancePanel />

      <SyncPanel />

      <section className="rounded-2xl bg-mint text-mint-ink p-4 space-y-3">
        <h2 className="text-lg font-semibold">Backup dei dati</h2>
        <p className="text-sm opacity-80">
          I dati restano su questo dispositivo. Scarica un backup ogni tanto e
          importalo per spostarli su un altro telefono o computer.
        </p>
        <button
          type="button"
          onClick={doExport}
          className="w-full rounded-xl border border-accent text-accent py-3 text-lg"
        >
          Scarica backup
        </button>
        <label className="block w-full rounded-xl border border-line py-3 text-center text-lg cursor-pointer">
          Importa backup
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
          />
        </label>
      </section>

      {msg && <p className="text-center text-accent font-medium">{msg}</p>}
    </div>
  );
}
