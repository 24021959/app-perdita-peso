"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useData } from "@/lib/useData";
import { exportBackup, importBackup } from "@/lib/db";
import type { Settings } from "@/lib/types";

export default function ImpostazioniPage() {
  const { settings, ready, updateSettings, reload } = useData();
  const [form, setForm] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (ready && !form) setForm(settings);
  }, [ready, settings, form]);

  if (!form) return <p className="text-muted">Carico…</p>;

  const numField = (k: keyof Settings, label: string) => (
    <label className="block" key={k}>
      <span className="text-sm text-muted">{label}</span>
      <input
        inputMode="decimal"
        value={String(form[k])}
        onChange={(e) =>
          setForm({ ...form, [k]: parseFloat(e.target.value.replace(",", ".")) || 0 })
        }
        className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
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
      <h1 className="text-2xl font-semibold">Impostazioni</h1>

      <section className="rounded-2xl bg-card border border-line p-4 space-y-3">
        {numField("heightCm", "Altezza (cm)")}
        {numField("startWeight", "Peso di partenza (kg)")}
        {numField("goalMin", "Obiettivo minimo (kg)")}
        {numField("goalMax", "Obiettivo massimo (kg)")}
        <label className="block">
          <span className="text-sm text-muted">Inizio finestra alimentare</span>
          <input
            type="time"
            value={form.windowStart}
            onChange={(e) => setForm({ ...form, windowStart: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Fine finestra alimentare</span>
          <input
            type="time"
            value={form.windowEnd}
            onChange={(e) => setForm({ ...form, windowEnd: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3 text-lg"
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            await updateSettings(form);
            setMsg("Impostazioni salvate.");
          }}
          className="w-full rounded-xl bg-accent text-white py-4 text-lg font-semibold"
        >
          Salva
        </button>
      </section>

      <section className="rounded-2xl bg-card border border-line p-4 space-y-3">
        <h2 className="text-lg font-semibold">Backup dei dati</h2>
        <p className="text-sm text-muted">
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

      {msg && <p className="text-center text-accent">{msg}</p>}
    </div>
  );
}
