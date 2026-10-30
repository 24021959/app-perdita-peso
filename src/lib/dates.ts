export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

/** giorni tra a e b (a - b) */
export function diffDays(a: string, b: string): number {
  return Math.round((parseKey(a).getTime() - parseKey(b).getTime()) / 86_400_000);
}

/** lunedì della settimana che contiene la data */
export function weekStart(key: string): string {
  const d = parseKey(key);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return todayKey(d);
}

export function formatDate(key: string): string {
  return parseKey(key).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function shortDate(key: string): string {
  return parseKey(key).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export function longDate(key: string): string {
  return parseKey(key).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
