// Interpreta una frase dettata in italiano e ne ricava i valori del registro.
// Esempio: "peso 92 virgola 4, vita 106, acqua un litro e mezzo, sonno sette ore,
// pressione 130 su 80, glicemia 98, energia 4, fame 2, finestra rispettata sì, nota oggi bene"

export type VoiceResult = {
  values: Partial<{
    weight: number;
    waist: number;
    water: number;
    sleep: number;
    steps: number;
    glucose: number;
    systolic: number;
    diastolic: number;
    energy: number;
    hunger: number;
  }>;
  fastingKept?: boolean;
  notes?: string;
  /** frasi leggibili di ciò che è stato capito, per mostrarle all'utente */
  understood: string[];
};

const UNITS: Record<string, number> = {
  zero: 0, un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7,
  otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14,
  quindici: 15, sedici: 16, diciassette: 17, diciotto: 18, diciannove: 19,
};
const TENS: Record<string, number> = {
  venti: 20, trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60, settanta: 70, ottanta: 80, novanta: 90,
};

/** "novantadue" -> 92, "centotrenta" -> 130, "ventuno" -> 21 */
function wordNumber(tok: string): number | undefined {
  if (tok in UNITS) return UNITS[tok];
  if (tok in TENS) return TENS[tok];
  if (tok === "cento") return 100;
  if (tok.startsWith("cento") && tok.length > 5) {
    const rest = wordNumber(tok.slice(5));
    return rest !== undefined && rest < 100 ? 100 + rest : undefined;
  }
  for (const [t, v] of Object.entries(TENS)) {
    const stem = t.slice(0, -1); // "vent", "trent", ...
    if (!tok.startsWith(stem) || tok.length === t.length - 1) continue;
    let rest = tok.slice(stem.length);
    // "ventidue", "trentadue": la vocale finale della decina resta; in "ventuno" cade
    if (rest.startsWith(t.slice(-1))) rest = rest.slice(1);
    const u = UNITS[rest];
    if (u !== undefined && u >= 1 && u <= 9) return v + u;
  }
  return undefined;
}

function normalize(raw: string): string {
  let t = raw.toLowerCase().replace(/[;:!?"“”]/g, " ").replace(/tré/g, "tre");
  t = t.replace(/\s*\bvirgola\b\s*/g, ",").replace(/\s+\bpunto\b\s+/g, ".");
  // parole-numero -> cifre
  t = t
    .split(/(\s+|,)/)
    .map((tok) => {
      const n = wordNumber(tok);
      return n === undefined ? tok : String(n);
    })
    .join("");
  // "novantadue ,4" ecc.
  t = t.replace(/(\d)\s*,\s*(\d)/g, "$1,$2");
  // "1 litro e mezzo", "7 ore e mezza" -> 1,5 litro / 7,5 ore
  t = t.replace(/(\d+)\s+(litri|litro|ore|ora)\s+e\s+mezz[oa]\b/g, "$1,5 $2");
  t = t.replace(/(\d+)\s+e\s+mezz[oa]\b/g, "$1,5");
  t = t.replace(/\bmezz[oa]\s+(litro|ora)\b/g, "0,5 $1");
  return t;
}

const NUM = String.raw`(\d+(?:[.,]\d+)?)`;
const toNum = (s: string) => parseFloat(s.replace(",", "."));
/** "6.000" o "6000" -> 6000 */
const toInt = (s: string) => parseInt(s.replace(/[.,](?=\d{3}\b)/g, ""), 10);
const inRange = (n: number | undefined, min: number, max: number) =>
  n !== undefined && Number.isFinite(n) && n >= min && n <= max ? n : undefined;

const fmt = (n: number) => String(n).replace(".", ",");

export function parseVoice(raw: string): VoiceResult {
  const out: VoiceResult = { values: {}, understood: [] };

  // le note si prendono dal testo originale e si tolgono dal resto
  let body = raw;
  const noteMatch = raw.match(/\bnot[ae]\b[:,]?\s*(.+)$/i);
  if (noteMatch && noteMatch.index !== undefined) {
    out.notes = noteMatch[1].trim();
    body = raw.slice(0, noteMatch.index);
    out.understood.push(`note: ${out.notes}`);
  }
  const t = normalize(body);

  const grab = (re: RegExp) => {
    const m = t.match(re);
    return m ? m[1] : undefined;
  };
  const set = <K extends keyof VoiceResult["values"]>(key: K, v: number | undefined, label: string) => {
    if (v === undefined) return;
    out.values[key] = v as VoiceResult["values"][K];
    out.understood.push(`${label} ${fmt(v)}`);
  };

  set("weight", inRange(toNum(grab(new RegExp(String.raw`\b(?:peso|pesato|pesata|bilancia)\b\D{0,25}?${NUM}`)) ?? ""), 30, 250), "peso");
  set("waist", inRange(toNum(grab(new RegExp(String.raw`\b(?:vita|girovita|circonferenza)\b\D{0,25}?${NUM}`)) ?? ""), 40, 250), "vita");

  // acqua: litri, oppure ml
  const waterRaw = grab(new RegExp(String.raw`\b(?:acqua|bevuto|bevute)\b\D{0,25}?${NUM}`));
  if (waterRaw) {
    let w = toNum(waterRaw);
    if (/\b(?:acqua|bevuto|bevute)\b\D{0,25}?\d+(?:[.,]\d+)?\s*(?:ml|millilitri|cl|centilitri)/.test(t) || w >= 50) {
      w = /cl|centilitri/.test(t.slice(t.indexOf(waterRaw))) && w < 500 ? w / 100 : w / 1000;
    }
    set("water", inRange(Math.round(w * 100) / 100, 0.1, 10), "acqua (l)");
  }

  set("sleep", inRange(toNum(grab(new RegExp(String.raw`\b(?:sonno|dormito|dormire)\b\D{0,25}?${NUM}`)) ?? ""), 0.5, 24), "sonno (ore)");

  const stepsRaw =
    grab(/(\d+(?:[.,]\d{3})*)\s*passi/) ?? grab(/\bpassi\b\D{0,15}?(\d+(?:[.,]\d{3})*)/);
  set("steps", inRange(stepsRaw ? toInt(stepsRaw) : undefined, 1, 100000), "passi");

  set("glucose", inRange(toNum(grab(new RegExp(String.raw`\b(?:glicemia|glucosio|zuccheri|zucchero)\b\D{0,25}?${NUM}`)) ?? ""), 20, 600), "glicemia");

  // pressione: "pressione 130 su 80", "massima 130 minima 80", "130/80"
  const bp =
    t.match(/\bpressione\b\D{0,30}?(\d{2,3})\D{1,25}?(\d{2,3})/) ??
    t.match(/(\d{2,3})\s*(?:su|sopra|\/)\s*(\d{2,3})/);
  if (bp) {
    const sys = inRange(parseInt(bp[1], 10), 60, 260);
    const dia = inRange(parseInt(bp[2], 10), 30, 160);
    if (sys !== undefined && dia !== undefined) {
      out.values.systolic = sys;
      out.values.diastolic = dia;
      out.understood.push(`pressione ${sys}/${dia}`);
    }
  }

  set("energy", inRange(toNum(grab(/\benergia\b\D{0,15}?([1-5])\b/) ?? ""), 1, 5), "energia");
  set("hunger", inRange(toNum(grab(/\bfame\b\D{0,15}?([1-5])\b/) ?? ""), 1, 5), "fame");

  // finestra alimentare
  const win = t.match(/\b(?:finestra|digiuno)\b[^,.;]{0,40}/);
  if (win) {
    const seg = win[0];
    if (/\bnon\b|superat|sforat|\bno\b/.test(seg)) {
      out.fastingKept = false;
    } else if (/rispettat|\bs[iì]\b|\bok\b|bene/.test(seg)) {
      out.fastingKept = true;
    }
    if (out.fastingKept !== undefined) {
      out.understood.push(`finestra ${out.fastingKept ? "rispettata" : "non rispettata"}`);
    }
  }

  return out;
}
