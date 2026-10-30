# App perdita peso

Web app personale di Antonello (67 anni, 175 cm, partenza 95 kg) per dieta senza zuccheri e senza carboidrati con digiuno 16:8 (si salta la cena). Obiettivo iniziale 85-87 kg, scopo vero: migliorare la salute. Interfaccia e testi in italiano, tono semplice e senza enfasi.

Documenti di riferimento nel Progetto chat "App perdita peso": `scheda-progetto.md` (stato e decisioni), `menu-base-e-regole-consigli.md` (menu base e soglie dei consigli). Leggere la scheda a inizio sessione e aggiornarla a fine sessione.

## Online e pubblicazione

- Sito: https://24021959.github.io/app-perdita-peso/ (GitHub Pages, repository pubblico, branch `main`).
- Ogni push su `main` fa partire `.github/workflows/pages.yml` (build + deploy, circa 1-2 minuti). Il workflow imposta `NEXT_PUBLIC_BASE_PATH=/app-perdita-peso`.
- Non si usano Vercel e Supabase (limiti del piano gratuito già esauriti). Non reintrodurli senza chiederlo.

## Tecnologia

- Next.js 16 con `output: "export"` (sito statico), TypeScript, Tailwind 4, Recharts per i grafici.
- **Prima di scrivere codice Next.js leggere le guide in `node_modules/next/dist/docs/`** (questa versione ha differenze rispetto a quella che si conosce; vedi AGENTS.md).
- Nessun server e nessun login. I dati stanno nel dispositivo (IndexedDB, database `app-perdita-peso`). Perciò: niente route dinamiche, niente API, niente cookie.
- `next.config.ts` mantiene la regola turbopack per `@tailwindcss/turbopack`: non rimuoverla.
- `basePath` e `trailingSlash: true`: i link interni usano `next/link` e finiscono con `/` (es. `/andamento/`).
- Il lint di React segnala `setState` dentro `useEffect`: caricare dati con funzione async dentro l'effetto, oppure passare i valori iniziali a un componente figlio (vedi `TodayForm`, `SettingsForm`).

## Struttura

- `src/lib/types.ts`: `Entry` (una riga per giorno), `Settings`, `Exam`, `MenuPlan`.
- `src/lib/db.ts`: IndexedDB. Store `entries` (chiave data `YYYY-MM-DD`) e `settings`; nello store `settings` stanno anche le chiavi generiche `exams`, `menu:<lunedì>`, `spesa:<lunedì>` (`getMeta`/`putMeta`). Backup JSON: `exportBackup`/`importBackup` includono tutto.
- `src/lib/useData.ts` (misure e impostazioni) e `src/lib/useMeta.ts` (valori generici).
- `src/lib/metrics.ts`: media 7 giorni, ritmo settimanale (regressione 21 giorni), data stimata di arrivo, serie nella finestra.
- `src/lib/advice.ts`: tutte le regole dei consigli, con le soglie del documento. Modificare le soglie solo qui.
- `src/lib/menu.ts`: pool di 9 colazioni e 10 pranzi, generazione settimana, scambio piatto, lista della spesa.
- `src/lib/voice.ts`: interpreta la dettatura vocale in italiano (parole-numero, "virgola", "e mezzo", pressione "130 su 80", note). `src/components/VoiceButton.tsx` usa la Web Speech API del browser (`it-IT`); i valori riconosciuti riempiono il registro, poi si preme Salva. Provarla con un riconoscimento finto (Chromium ha già il suo: simulare sia `SpeechRecognition` sia `webkitSpeechRecognition`).
- `src/lib/fasting.ts`: stato del timer del digiuno. `src/lib/dates.ts`: funzioni sulle date locali (sempre chiavi `YYYY-MM-DD`, mai UTC).
- `src/app/`: `/` Oggi (accetta `?d=YYYY-MM-DD`), `/andamento`, `/menu`, `/consigli`, `/salute`, `/report` (stampabile), `/impostazioni`.
- `src/components/`: `BottomNav`, `Charts` (grafico a linee riusabile), `ExamFields`, `RegisterSW`.
- `public/`: `manifest.webmanifest`, `sw.js` (rete prima, cache se offline), icone.

## Comandi

    npm install
    npm run dev
    npx eslint src
    npx next build        # genera la cartella out/

Per provare la build: servire `out/` (es. `npx serve out -l 4173`). Un backup con dati finti per i test si importa da Impostazioni → Importa backup.

## Regole di lavoro

- Interfaccia pensata per il telefono: caratteri grandi, un colpo di pollice, niente tabelle larghe.
- Nessuna diagnosi né cambio di farmaci nei messaggi: gli avvisi invitano a sentire il medico. Non spingere sotto 85 kg senza nuova valutazione.
- Prima di modifiche grosse (nuovo tipo di dato, cambio di schema IndexedDB) presentare un piano breve. Se si cambia lo schema, mantenere compatibili i backup già esportati.
- Prima di ogni push: `npx eslint src` e `npx next build` senza errori.
- Commit in italiano, descrittivi. Alla fine della sessione aggiornare la scheda progetto nel Progetto chat.

## Stato (30 ottobre 2026)

Tutte e cinque le schede funzionano e sono online. Provata con 45 giorni di dati finti. Da fare: usarla qualche giorno con dati veri e raccogliere le richieste. Idee non iniziate: registro dei pasti con proteine, promemoria per la pesata, sincronizzazione tra dispositivi (oggi solo backup manuale).
