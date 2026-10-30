function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export type FastState = {
  eating: boolean;
  label: string;
  detail: string;
  progress: number; // 0-1 del periodo corrente
};

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h} h ${m.toString().padStart(2, "0")} min` : `${m} min`;
}

export function fastState(now: Date, start: string, end: string): FastState {
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = toMinutes(start);
  const e = toMinutes(end);
  const eatingLen = e - s;
  const fastLen = 24 * 60 - eatingLen;

  if (cur >= s && cur < e) {
    const left = e - cur;
    return {
      eating: true,
      label: "Finestra alimentare aperta",
      detail: `Chiude alle ${end}, tra ${fmt(left)}`,
      progress: (cur - s) / eatingLen,
    };
  }
  const sinceEnd = cur >= e ? cur - e : cur + 24 * 60 - e;
  const left = fastLen - sinceEnd;
  return {
    eating: false,
    label: "Digiuno in corso",
    detail: `Da ${fmt(sinceEnd)}. Si mangia alle ${start}, tra ${fmt(left)}`,
    progress: sinceEnd / fastLen,
  };
}
