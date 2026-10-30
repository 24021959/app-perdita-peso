"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllEntries, getSettings, saveEntry, saveSettings } from "./db";
import { DEFAULT_SETTINGS, type Entry, type Settings } from "./types";

export function useData() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const [e, s] = await Promise.all([getAllEntries(), getSettings()]);
    setEntries(e);
    setSettingsState(s);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

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

  return { entries, settings, ready, upsert, updateSettings, reload };
}
