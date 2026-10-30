"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllEntries, getSettings, saveEntry, saveSettings } from "./db";
import { DEFAULT_SETTINGS, type Entry, type Settings } from "./types";

export function useData() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [rev, setRev] = useState(0);

  const reload = useCallback(async () => {
    const [e, s] = await Promise.all([getAllEntries(), getSettings()]);
    setEntries(e);
    setSettingsState(s);
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = (external: boolean) => {
      (async () => {
        const [e, s] = await Promise.all([getAllEntries(), getSettings()]);
        if (cancelled) return;
        setEntries(e);
        setSettingsState(s);
        setReady(true);
        if (external) setRev((r) => r + 1);
      })();
    };
    load(false);
    const onExternal = () => load(true);
    window.addEventListener("peso-data-changed", onExternal);
    return () => {
      cancelled = true;
      window.removeEventListener("peso-data-changed", onExternal);
    };
  }, []);

  const upsert = useCallback(
    async (entry: Entry) => {
      await saveEntry(entry);
      await reload();
    },
    [reload],
  );

  const updateSettings = useCallback(
    async (s: Settings) => {
      await saveSettings(s);
      await reload();
    },
    [reload],
  );

  return { entries, settings, ready, rev, upsert, updateSettings, reload };
}
