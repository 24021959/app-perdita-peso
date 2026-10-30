"use client";

import { useSyncExternalStore } from "react";
import { getSyncStatus, subscribeSync, type SyncStatus } from "./sync";

const SERVER: SyncStatus = { phase: "off", pending: 0 };

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSync, getSyncStatus, () => SERVER);
}
