export type Entry = {
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  waist?: number; // cm
  water?: number; // litri
  sleep?: number; // ore
  steps?: number;
  energy?: number; // 1-5
  hunger?: number; // 1-5
  systolic?: number;
  diastolic?: number;
  glucose?: number; // mg/dl
  fastingKept?: boolean;
  notes?: string;
};

export type Settings = {
  heightCm: number;
  startWeight: number;
  goalMin: number;
  goalMax: number;
  windowStart: string; // HH:MM, inizio finestra alimentare
  windowEnd: string; // HH:MM, fine finestra alimentare
};

export const DEFAULT_SETTINGS: Settings = {
  heightCm: 175,
  startWeight: 95,
  goalMin: 85,
  goalMax: 87,
  windowStart: "08:00",
  windowEnd: "16:00",
};
