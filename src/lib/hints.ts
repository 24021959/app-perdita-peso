"use client";

import { useSyncExternalStore } from "react";

// Avvisi che si possono chiudere una volta per sempre, su questo dispositivo.
const EVENT = "ui-hints";

export function useHintDismissed(key: string): [boolean, () => void] {
  const dismissed = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    () => {
      try {
        return localStorage.getItem(`ui:hint:${key}`) === "1";
      } catch {
        return false;
      }
    },
    () => true, // sul server e al primo disegno l'avviso resta nascosto
  );
  const dismiss = () => {
    try {
      localStorage.setItem(`ui:hint:${key}`, "1");
    } catch {
      /* ignora */
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [dismissed, dismiss];
}
