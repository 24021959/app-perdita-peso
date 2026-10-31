"use client";

import { useEffect, useState } from "react";
import { useSyncStatus } from "@/lib/useSync";
import LoginScreen from "./LoginScreen";
import SetPasswordScreen from "./SetPasswordScreen";

const hasStoredSession = () => {
  try {
    return Object.keys(localStorage).some((k) => /^sb-.+-auth-token$/.test(k));
  } catch {
    return false;
  }
};

/**
 * Mostra l'app solo a chi è collegato; altrimenti la pagina di accesso.
 * Senza internet, se su questo dispositivo c'è già una sessione salvata, l'app si apre comunque.
 */
export default function Gate({ children }: { children: React.ReactNode }) {
  const s = useSyncStatus();
  const [offlineOk, setOfflineOk] = useState(false);
  const [waited, setWaited] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const check = setTimeout(() => {
      setOfflineOk(!navigator.onLine && hasStoredSession());
      try {
        setSkipped(sessionStorage.getItem("password-dopo") === "1");
      } catch {
        /* nessun problema: la proposta si ripresenta */
      }
    }, 0);
    // se la sessione non si legge entro pochi secondi, meglio mostrare l'accesso che una pagina vuota
    const wait = setTimeout(() => setWaited(true), 4000);
    return () => {
      clearTimeout(check);
      clearTimeout(wait);
    };
  }, []);

  const loggedIn = s.phase === "idle" || s.phase === "syncing" || s.phase === "error";
  if (loggedIn && s.hasPassword === false && !skipped) {
    return (
      <SetPasswordScreen
        onSkip={() => {
          try {
            sessionStorage.setItem("password-dopo", "1");
          } catch {
            /* ignora */
          }
          setSkipped(true);
        }}
      />
    );
  }
  if (loggedIn || offlineOk) return <>{children}</>;
  if (!s.ready && !waited) return <p className="p-6 text-center text-muted">Carico…</p>;
  return <LoginScreen />;
}
