"use client";

import { useState } from "react";
import { useMeta } from "@/lib/useMeta";
import type { Med } from "@/lib/types";

/** Farmaci in corso: compaiono nel report per il medico e nei consigli. */
export default function MedsPanel() {
  const [meds, saveMeds] = useMeta<Med[]>("meds", []);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");

  async function add() {
    const n = name.trim();
    if (!n) return;
    await saveMeds([...meds, { id: crypto.randomUUID(), name: n, dose: dose.trim() || undefined }]);
    setName("");
    setDose("");
  }

  return (
    <section className="rounded-2xl bg-rose text-rose-ink p-4 space-y-3">
      <h2 className="text-lg font-semibold">Farmaci</h2>
      <p className="text-sm opacity-80">Compaiono nel report per il medico e nei consigli. Scrivi, per esempio, Xarelto e la dose.</p>
      {meds.length > 0 && (
        <ul className="space-y-2">
          {meds.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 text-foreground">
              <span>
                <strong>{m.name}</strong>
                {m.dose ? <span className="text-muted"> · {m.dose}</span> : null}
              </span>
              <button
                type="button"
                aria-label={`Rimuovi ${m.name}`}
                onClick={() => void saveMeds(meds.filter((x) => x.id !== m.id))}
                className="h-11 rounded-lg px-3 text-sm text-muted"
              >
                Rimuovi
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-2">
        <input
          aria-label="Nome del farmaco"
          placeholder="Nome (es. Xarelto)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
        />
        <input
          aria-label="Dose"
          placeholder="Dose (es. 20 mg a cena)"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          className="w-full rounded-xl border border-line bg-card px-3 py-3 text-lg text-foreground"
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={!name.trim()}
          className="w-full rounded-xl bg-accent py-3 text-lg font-semibold text-on-accent disabled:opacity-50"
        >
          Aggiungi farmaco
        </button>
      </div>
    </section>
  );
}
