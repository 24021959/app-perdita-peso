// Copia in public/ocr i file della lettura dei referti (OCR), così l'app li serve dal proprio sito
// invece di scaricarli da internet. Si lancia da solo prima di `npm run dev` e `npm run build`.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const nm = "node_modules";
const out = join("public", "ocr");

const files = [
  [join(nm, "tesseract.js", "dist", "worker.min.js"), join(out, "worker.min.js")],
  // solo le tre varianti "lstm" (la libreria sceglie quella adatta al dispositivo)
  [join(nm, "tesseract.js-core", "tesseract-core-lstm.wasm.js"), join(out, "core", "tesseract-core-lstm.wasm.js")],
  [join(nm, "tesseract.js-core", "tesseract-core-simd-lstm.wasm.js"), join(out, "core", "tesseract-core-simd-lstm.wasm.js")],
  [
    join(nm, "tesseract.js-core", "tesseract-core-relaxedsimd-lstm.wasm.js"),
    join(out, "core", "tesseract-core-relaxedsimd-lstm.wasm.js"),
  ],
  // lingua italiana, modello "best" compresso
  [join(nm, "@tesseract.js-data", "ita", "4.0.0_best_int", "ita.traineddata.gz"), join(out, "lang", "ita.traineddata.gz")],
];

const missing = files.filter(([src]) => !existsSync(src));
if (missing.length) {
  console.error("copy-ocr: file mancanti, eseguire `npm install`:\n" + missing.map(([s]) => "  " + s).join("\n"));
  process.exit(1);
}
rmSync(out, { recursive: true, force: true });
for (const [src, dst] of files) {
  mkdirSync(join(dst, ".."), { recursive: true });
  cpSync(src, dst);
}
console.log(`copy-ocr: copiati ${files.length} file in ${out}`);
