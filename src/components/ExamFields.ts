import type { Exam } from "@/lib/types";

export type ExamKey = Exclude<keyof Exam, "id" | "date">;

export type ExamField = { key: ExamKey; label: string; unit: string; extra?: boolean };

// I primi nove sono quelli del documento dei consigli; gli altri si compilano se ci sono nel referto.
export const EXAM_FIELDS: ExamField[] = [
  { key: "glucose", label: "Glicemia", unit: "mg/dl" },
  { key: "hba1c", label: "Emoglobina glicata", unit: "%" },
  { key: "chol", label: "Colesterolo totale", unit: "mg/dl" },
  { key: "hdl", label: "Colesterolo HDL", unit: "mg/dl" },
  { key: "ldl", label: "Colesterolo LDL", unit: "mg/dl" },
  { key: "trig", label: "Trigliceridi", unit: "mg/dl" },
  { key: "creat", label: "Creatinina", unit: "mg/dl" },
  { key: "alt", label: "ALT (fegato)", unit: "U/L" },
  { key: "ast", label: "AST (fegato)", unit: "U/L" },
  { key: "ggt", label: "Gamma GT (fegato)", unit: "U/L", extra: true },
  { key: "urea", label: "Azotemia", unit: "mg/dl", extra: true },
  { key: "uric", label: "Acido urico", unit: "mg/dl", extra: true },
  { key: "na", label: "Sodio", unit: "mmol/l", extra: true },
  { key: "k", label: "Potassio", unit: "mmol/l", extra: true },
  { key: "vitd", label: "Vitamina D", unit: "ng/ml", extra: true },
  { key: "tsh", label: "TSH", unit: "µUI/ml", extra: true },
];
