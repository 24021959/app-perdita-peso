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
  offPlan?: boolean; // giorno fuori regola (cena, evento): non spezza la serie e non genera avvisi
  offPlanNote?: string;
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

export type Exam = {
  id: string;
  date: string; // YYYY-MM-DD
  glucose?: number; // mg/dl
  hba1c?: number; // %
  chol?: number; // colesterolo totale mg/dl
  hdl?: number;
  ldl?: number;
  trig?: number; // trigliceridi mg/dl
  creat?: number; // creatinina mg/dl
  alt?: number; // U/L
  ast?: number; // U/L
};

export type MenuPlan = {
  weekStart: string;
  days: { breakfast: string; lunch: string }[]; // 7 giorni, lunedì = 0
};
