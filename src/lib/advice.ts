import { addDays, diffDays } from "./dates";
import { STEPS_TARGET, fmtSteps, nextStepGoal, stepBenefit } from "./steps";
import { avgAt, fastingStreak, lastDays } from "./metrics";
import type { Entry, Exam, Med, Settings } from "./types";

export type Level = "warning" | "attention" | "info";
export type Advice = { level: Level; title: string; text: string };

const order: Record<Level, number> = { warning: 0, attention: 1, info: 2 };
const fmt = (n: number, d = 1) => n.toFixed(d).replace(".", ",");

/**
 * Regole del documento "menu base e regole dei consigli".
 * Nessuna diagnosi: gli avvisi invitano a sentire il medico.
 */
export function buildAdvice(
  entries: Entry[],
  settings: Settings,
  exams: Exam[],
  today: string,
  meds: Med[] = [],
): Advice[] {
  const out: Advice[] = [];
  const add = (level: Level, title: string, text: string) => out.push({ level, title, text });

  const weights = entries.filter((e) => e.weight !== undefined);
  if (weights.length === 0) {
    add("info", "Comincia dal peso", "Pesati ogni mattina, a digiuno e sempre alla stessa ora, e registralo in Oggi.");
  }

  // ---- Peso
  const last = weights.at(-1);
  if (last) {
    const w = last.weight as number;
    if (w < settings.goalMin) {
      add(
        "warning",
        `Sei sotto i ${settings.goalMin} kg`,
        "Prima di scendere ancora conviene una nuova valutazione col medico: l'obiettivo di partenza era 85-87 kg.",
      );
    }

    const now = avgAt(entries, last.date);
    const w1 = avgAt(entries, addDays(last.date, -7));
    const w2 = avgAt(entries, addDays(last.date, -14));
    if (now !== undefined && w1 !== undefined) {
      const loss1 = w1 - now;
      if (loss1 > 1 && w2 !== undefined && w2 - w1 > 1) {
        add(
          "warning",
          "Calo troppo rapido",
          `La media è scesa di oltre 1 kg a settimana per due settimane di fila (${fmt(w2 - w1)} e ${fmt(loss1)} kg). Rallenta: aumenta le porzioni di proteine e di grassi buoni e parlane col medico.`,
        );
      } else if (loss1 >= 0.5 && loss1 <= 1) {
        add("info", "Ritmo buono", `Ultima settimana: ${fmt(loss1)} kg in meno sulla media. Continua così.`);
      }
    }

    const recent10 = weights.filter((e) => diffDays(last.date, e.date) < 10);
    if (recent10.length >= 4) {
      const vals = recent10.map((e) => e.weight as number);
      if (Math.max(...vals) - Math.min(...vals) < 0.3 && diffDays(last.date, recent10[0].date) >= 8) {
        add(
          "info",
          "Peso fermo da 10 giorni",
          "Controlla porzioni e acqua, verifica che non siano entrati carboidrati nascosti (salse, insaccati) e valuta un po' più di movimento. Guarda anche la vita: può scendere anche col peso fermo.",
        );
      }
    }

    const back3 = weights.filter((e) => {
      const d = diffDays(last.date, e.date);
      return d >= 1 && d <= 3;
    });
    if (back3.length) {
      const ref = Math.min(...back3.map((e) => e.weight as number));
      if (w - ref > 1.5) {
        const offRecent = entries.some((e) => e.offPlan && diffDays(last.date, e.date) >= 0 && diffDays(last.date, e.date) <= 3);
        add(
          "info",
          "Salita improvvisa",
          `+${fmt(w - ref)} kg in pochi giorni: di solito è ritenzione di liquidi${offRecent ? ", ed è normale dopo un giorno fuori regola" : ""}. Ricontrolla fra 3 giorni prima di preoccuparti.`,
        );
      }
    }
  }

  // ---- Vita
  const waists = entries.filter((e) => e.waist !== undefined);
  if (waists.length >= 2) {
    const a = waists[0];
    const b = waists.at(-1)!;
    const delta = (a.waist as number) - (b.waist as number);
    if (delta >= 1) {
      add(
        "info",
        "La vita scende",
        `Dal primo rilievo hai perso ${fmt(delta)} cm di vita: per la salute conta più del peso.`,
      );
    }
  }

  // ---- Digiuno
  const week = lastDays(entries, today, 7);
  const missed = week.filter((e) => e.fastingKept === false && !e.offPlan).length;
  if (missed > 2) {
    add(
      "info",
      "Finestra spesso superata",
      `Negli ultimi 7 giorni hai superato la finestra ${missed} volte. Se ti è più comodo, prova a spostarla dalle Impostazioni.`,
    );
  }
  const streak = fastingStreak(entries, today);
  if (streak >= 7) {
    add("info", `${streak} giorni nella finestra`, "Hai rispettato la finestra alimentare senza interruzioni. Bene.");
  }

  // ---- Acqua
  const withWater = entries.filter((e) => e.water !== undefined);
  if (withWater.length >= 2) {
    const [a, b] = [withWater.at(-1)!, withWater.at(-2)!];
    if (diffDays(a.date, b.date) === 1 && (a.water as number) < 1.5 && (b.water as number) < 1.5) {
      add("attention", "Poca acqua", "Sotto 1,5 litri per due giorni di fila. Bevi di più, anche tè e infusi senza zucchero.");
    }
  }

  // ---- Sonno ed energia
  const sleepWeek = week.filter((e) => e.sleep !== undefined);
  if (sleepWeek.filter((e) => (e.sleep as number) < 6).length >= 4) {
    add("attention", "Poco sonno", "Meno di 6 ore per almeno 4 notti negli ultimi 7 giorni: il sonno scarso aumenta la fame e rallenta il calo.");
  }
  const energy = entries.filter((e) => e.energy !== undefined).slice(-5);
  if (
    energy.length === 5 &&
    energy.every((e) => (e.energy as number) <= 2) &&
    diffDays(energy[4].date, energy[0].date) <= 6
  ) {
    add(
      "attention",
      "Energia bassa da 5 giorni",
      "Controlla acqua, sali e proteine (un brodo e un po' di sale possono aiutare). Se continua, senti il medico.",
    );
  }

  // ---- Pressione
  const bp = entries.filter((e) => e.systolic !== undefined && e.diastolic !== undefined);
  const high = (e: Entry) => (e.systolic as number) > 140 || (e.diastolic as number) > 90;
  const last5 = bp.slice(-5);
  if (last5.length >= 3 && last5.filter(high).length >= 3) {
    add("warning", "Pressione alta", "Sopra 140/90 in almeno 3 misure delle ultime 5. Parlane col medico.");
  }
  const lastBp = bp.at(-1);
  if (lastBp && (lastBp.systolic as number) < 100) {
    add(
      "attention",
      "Pressione bassa",
      `Ultima massima: ${lastBp.systolic}. Se hai vertigini alzati piano, bevi e senti il medico. Se prendi farmaci per la pressione, con il calo di peso e di sodio le dosi possono andare riviste.`,
    );
  }
  const bp14 = lastDays(bp, today, 14);
  if (bp14.length >= 5 && !bp14.some(high) && !bp14.some((e) => (e.systolic as number) < 100)) {
    add("info", "Pressione nella norma", "Misure regolari negli ultimi 14 giorni.");
  }

  // ---- Glicemia
  const gl = entries.filter((e) => e.glucose !== undefined);
  const lastGl = gl.at(-1);
  if (lastGl) {
    const g = lastGl.glucose as number;
    if (g < 70) {
      add(
        "warning",
        "Glicemia bassa",
        `${g} mg/dl: sotto 70. Senti subito il medico (l'app non ti chiede di mangiare zucchero, ma non ignorare il valore).`,
      );
    } else if (gl.length >= 2 && g > 126 && (gl.at(-2)!.glucose as number) > 126) {
      add("warning", "Glicemia alta", "Sopra 126 mg/dl in due misure diverse. Parlane col medico.");
    } else if (g <= 100) {
      add("info", "Glicemia nella norma", `Ultimo valore a digiuno: ${g} mg/dl.`);
    }
  }

  // ---- Esami del sangue
  const lastExam = [...exams].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  if (!lastExam) {
    add(
      "info",
      "Esami del sangue",
      "Registra gli esami in Salute: glicemia, emoglobina glicata, colesterolo, trigliceridi, creatinina e fegato, ogni 3 mesi.",
    );
  } else if (diffDays(today, lastExam.date) > 90) {
    add(
      "attention",
      "Esami da ripetere",
      "Sono passati più di 3 mesi dall'ultimo controllo del sangue. Prenotalo e registra i valori in Salute.",
    );
  }

  // ---- Reni e terapia anticoagulante (es. Xarelto): la dose dipende dalla funzione dei reni
  const anticoag = meds.some((m) => /xarelto|rivaroxaban|eliquis|apixaban|lixiana|edoxaban|pradaxa|dabigatran|warfarin|coumadin/i.test(m.name));
  const creat = lastExam?.creat;
  if (creat !== undefined && creat > 1.2) {
    add(
      anticoag ? "warning" : "attention",
      "Creatinina sopra il limite",
      `Ultimo valore: ${fmt(creat, 2)} mg/dl (limite indicativo 1,2). ${
        anticoag
          ? "Con l'anticoagulante la dose dipende dalla funzione dei reni: mostra l'esame al medico e bevi regolarmente."
          : "Bevi regolarmente e mostra l'esame al medico."
      }`,
    );
  }
  if (anticoag) {
    add(
      "info",
      "Terapia anticoagulante",
      "Se noti sanguinamenti insoliti (gengive, naso, urine rosate, feci scure) o lividi senza motivo, avvisa subito il medico. Non saltare e non cambiare le dosi da solo. Col digiuno bevi con regolarità: i liquidi proteggono i reni.",
    );
  }

  // ---- Movimento (promemoria fisso, se ci sono dati)
  if (weights.length >= 3) {
    const steps = lastDays(entries, today, 7).filter((e) => e.steps !== undefined);
    if (steps.length >= 3) {
      const avg = steps.reduce((s, e) => s + (e.steps as number), 0) / steps.length;
      if (avg < STEPS_TARGET) {
        add(
          "info",
          "Più movimento",
          `Media di ${fmtSteps(avg)} passi al giorno: circa il ${stepBenefit(avg)}% del beneficio degli studi. L'obiettivo consigliato è ${fmtSteps(STEPS_TARGET)}; il prossimo traguardo è ${fmtSteps(nextStepGoal(avg))}. Una camminata di 30 minuti ogni giorno aiuta peso e pressione.`,
        );
      }
    }
  }

  return out.sort((a, b) => order[a.level] - order[b.level]);
}

/** Frase di riepilogo breve e concreta, senza enfasi. */
export function summaryLine(entries: Entry[], settings: Settings): string | null {
  const weights = entries.filter((e) => e.weight !== undefined);
  if (weights.length < 2) return null;
  const lost = settings.startWeight - (weights.at(-1)!.weight as number);
  const days = diffDays(weights.at(-1)!.date, weights[0].date);
  const waists = entries.filter((e) => e.waist !== undefined);
  let s = `${lost >= 0 ? "Hai perso" : "Sei salito di"} ${fmt(Math.abs(lost))} kg in ${days} giorni`;
  if (waists.length >= 2) {
    const dw = (waists[0].waist as number) - (waists.at(-1)!.waist as number);
    if (dw > 0) s += ` e la vita è scesa di ${fmt(dw)} cm`;
  }
  return s + ".";
}
