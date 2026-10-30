import type { Exam } from "@/lib/types";

export type ExamKey = Exclude<keyof Exam, "id" | "date">;

export const EXAM_FIELDS: { key: ExamKey; label: string; unit: string }[] = [
  { key: "glucose", label: "Glicemia", unit: "mg/dl" },
  { key: "hba1c", label: "Emoglobina glicata", unit: "%" },
  { key: "chol", label: "Colesterolo totale", unit: "mg/dl" },
  { key: "hdl", label: "Colesterolo HDL", unit: "mg/dl" },
  { key: "ldl", label: "Colesterolo LDL", unit: "mg/dl" },
  { key: "trig", label: "Trigliceridi", unit: "mg/dl" },
  { key: "creat", label: "Creatinina", unit: "mg/dl" },
  { key: "alt", label: "ALT (fegato)", unit: "U/L" },
  { key: "ast", label: "AST (fegato)", unit: "U/L" },
];
