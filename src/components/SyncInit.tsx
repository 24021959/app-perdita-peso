"use client";

import { useEffect } from "react";
import { initSync } from "@/lib/sync";

export default function SyncInit() {
  useEffect(() => {
    initSync();
  }, []);
  return null;
}
