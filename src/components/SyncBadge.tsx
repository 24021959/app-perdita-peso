"use client";

import Link from "next/link";
import { useSyncStatus } from "@/lib/useSync";

export default function SyncBadge() {
  const s = useSyncStatus();
  const map = {
    off: { t: "", c: "" },
    out: { t: "Non collegato online", c: "text-muted" },
    idle: { t: s.pending > 0 ? `Online · ${s.pending} da inviare` : "Salvato online", c: "text-accent" },
    syncing: { t: "Sincronizzo…", c: "text-muted" },
    error: { t: "Errore online", c: "text-red-700" },
  } as const;
  const m = map[s.phase];
  if (!m.t) return null;
  return (
    <Link href="/impostazioni/" className={`text-xs ${m.c}`}>
      ☁ {m.t}
    </Link>
  );
}
