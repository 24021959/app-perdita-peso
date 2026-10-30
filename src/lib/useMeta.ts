"use client";

import { useCallback, useEffect, useState } from "react";
import { getMeta, putMeta } from "./db";

/** Legge e scrive un valore generico salvato nel dispositivo. */
export function useMeta<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      (async () => {
        const v = await getMeta<T>(key);
        if (cancelled) return;
        if (v !== undefined) setValue(v);
        setReady(true);
      })();
    };
    load();
    window.addEventListener("peso-data-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("peso-data-changed", load);
    };
  }, [key]);

  const save = useCallback(
    async (next: T) => {
      setValue(next);
      await putMeta(key, next);
    },
    [key],
  );

  return [value, save, ready] as const;
}
