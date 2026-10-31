"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/config";
import { useData } from "@/lib/useData";

const KEY = "benvenuto-visto";

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h >= 5 && h < 13) return "Buongiorno";
  if (h >= 13 && h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

/** Schermata di benvenuto con il saluto per nome, una volta a ogni apertura dell'app. */
export default function Benvenuto() {
  const { settings, ready } = useData();
  const [shown, setShown] = useState(false);
  const [text] = useState(() => greeting());

  useEffect(() => {
    if (!ready) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* senza storage il benvenuto compare a ogni caricamento: va bene */
    }
    const open = setTimeout(() => setShown(true), 0);
    const close = setTimeout(() => setShown(false), 4500);
    return () => {
      clearTimeout(open);
      clearTimeout(close);
    };
  }, [ready]);

  if (!shown) return null;
  const name = settings.name?.trim();
  return (
    <div
      role="dialog"
      aria-label="Benvenuto"
      onClick={() => setShown(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-6 text-center print:hidden"
    >
      <div className="max-w-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{APP_NAME}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {text}
          {name ? `, ${name}` : ""}!
        </h1>
        <p className="mt-3 text-lg text-muted">
          {name ? "Bentornato. Un passo alla volta, oggi come ieri." : "Bentornato. Scrivi il tuo nome in Impostazioni per essere salutato."}
        </p>
        <button
          type="button"
          onClick={() => setShown(false)}
          className="mt-8 w-full rounded-xl bg-accent py-4 text-lg font-semibold text-on-accent"
        >
          Iniziamo
        </button>
      </div>
    </div>
  );
}
