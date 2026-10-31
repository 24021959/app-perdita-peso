"use client";

import { useEffect, useState } from "react";
import { useSyncStatus } from "@/lib/useSync";
import Entrata from "./Entrata";
import LoginScreen from "./LoginScreen";
import SetPasswordScreen from "./SetPasswordScreen";

/**
 * Mostra l'app solo dopo che l'accesso è stato confermato; fino ad allora si vede
 * solo la schermata d'ingresso (saluto + password). Senza internet vale la sessione
 * salvata sul dispositivo, se non è scaduta (vedi `verifySession` in sync.ts).
 */
export default function Gate({ children }: { children: React.ReactNode }) {
  const s = useSyncStatus();
  const [waited, setWaited] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const init = setTimeout(() => {
      try {
        setSkipped(sessionStorage.getItem("password-dopo") === "1");
      } catch {
        /* nessun problema: la proposta si ripresenta */
      }
    }, 0);
    // se la verifica non si chiude in pochi secondi, meglio la pagina d'accesso che una pagina vuota
    const wait = setTimeout(() => setWaited(true), 7000);
    return () => {
      clearTimeout(init);
      clearTimeout(wait);
    };
  }, []);

  const loggedIn = s.phase === "idle" || s.phase === "syncing" || s.phase === "error";

  if (loggedIn && s.verified) {
    if (s.hasPassword === false && !skipped) {
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
    return <>{children}</>;
  }

  const checking = !s.ready || loggedIn;
  if (checking && !waited) {
    return (
      <Entrata>
        <p className="text-center text-muted">Un momento…</p>
      </Entrata>
    );
  }
  return <LoginScreen />;
}
