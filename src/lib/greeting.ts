/** Saluto adatto all'ora del giorno. */
export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h >= 5 && h < 13) return "Buongiorno";
  if (h >= 13 && h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

/** Chiave di sessione: il benvenuto a tutto schermo è già stato visto in questa apertura dell'app. */
export const WELCOME_SEEN_KEY = "benvenuto-visto";
