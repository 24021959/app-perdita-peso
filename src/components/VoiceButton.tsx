"use client";

import { useRef, useState, useSyncExternalStore } from "react";

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecCtor = new () => Rec;
type W = { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };

const getCtor = (): RecCtor | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as W).SpeechRecognition ?? (window as unknown as W).webkitSpeechRecognition;

const subscribe = () => () => {};

const ERRORS: Record<string, string> = {
  "not-allowed": "Microfono non autorizzato: consenti l'accesso al microfono nelle impostazioni del browser.",
  "service-not-allowed": "Il browser non permette la dettatura vocale su questa pagina.",
  "no-speech": "Non ho sentito nulla. Riprova avvicinandoti al microfono.",
  "audio-capture": "Non trovo il microfono.",
  network: "Serve la connessione a internet: la dettatura usa il servizio vocale del browser.",
};

export default function VoiceButton({ onText }: { onText: (text: string) => void }) {
  const supported = useSyncExternalStore(subscribe, () => getCtor() !== undefined, () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<Rec | null>(null);

  if (!supported) {
    return (
      <p className="text-sm text-muted">
        Questo browser non ha la dettatura nel pulsante: usa il microfono della tastiera del telefono nei
        campi, oppure apri l&apos;app con Chrome o Safari.
      </p>
    );
  }

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "it-IT";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onText(text);
    };
    rec.onerror = (e) => setError(ERRORS[e.error] ?? "La dettatura non è riuscita. Riprova.");
    rec.onend = () => setListening(false);
    setError("");
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("La dettatura non è riuscita. Riprova.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        className={`w-full rounded-xl py-4 text-lg font-semibold border ${
          listening
            ? "bg-red-600 text-white border-red-600 animate-pulse"
            : "bg-card text-accent border-accent"
        }`}
      >
        {listening ? "Sto ascoltando… tocca per fermare" : "🎤 Detta i dati"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
