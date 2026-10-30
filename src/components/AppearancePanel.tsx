"use client";

import { useSyncExternalStore } from "react";
import { getPrefs, getServerPrefs, setPrefs, subscribePrefs, type FontSize, type Theme } from "@/lib/prefs";

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: "auto", label: "Automatico", icon: "🌓" },
  { id: "light", label: "Chiaro", icon: "☀️" },
  { id: "dark", label: "Scuro", icon: "🌙" },
];
const FONTS: { id: FontSize; label: string; size: string }[] = [
  { id: "normal", label: "Normali", size: "text-base" },
  { id: "large", label: "Grandi", size: "text-xl" },
  { id: "xl", label: "Molto grandi", size: "text-2xl" },
];

export default function AppearancePanel() {
  const prefs = useSyncExternalStore(subscribePrefs, getPrefs, getServerPrefs);
  const btn = (on: boolean) =>
    `rounded-xl border py-3 px-2 ${on ? "bg-accent text-on-accent border-accent" : "bg-card border-line"}`;

  return (
    <section className="rounded-2xl bg-lilac text-lilac-ink p-4 space-y-4">
      <h2 className="text-lg font-semibold">Aspetto</h2>
      <div>
        <p className="text-sm opacity-80">Tema</p>
        <div className="mt-1 grid grid-cols-3 gap-2 text-foreground">
          {THEMES.map((t) => (
            <button key={t.id} type="button" onClick={() => setPrefs({ theme: t.id })} className={btn(prefs.theme === t.id)}>
              <span className="block text-xl" aria-hidden="true">
                {t.icon}
              </span>
              <span className="text-sm">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs opacity-80">Automatico segue le impostazioni del telefono.</p>
      </div>
      <div>
        <p className="text-sm opacity-80">Dimensione dei caratteri</p>
        <div className="mt-1 grid grid-cols-3 gap-2 text-foreground">
          {FONTS.map((f) => (
            <button key={f.id} type="button" onClick={() => setPrefs({ font: f.id })} className={btn(prefs.font === f.id)}>
              <span className={`block ${f.size}`}>Aa</span>
              <span className="text-sm">{f.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs opacity-80">Vale solo per questo dispositivo.</p>
      </div>
    </section>
  );
}
