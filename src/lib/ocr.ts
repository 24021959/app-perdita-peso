// Lettura di una foto con l'OCR nel dispositivo (tesseract.js). Nessuna immagine esce dal telefono.
// I file del motore stanno in public/ocr (copiati da scripts/copy-ocr.mjs) e si caricano solo quando serve.

export type OcrProgress = { stage: string; pct: number };

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function assetUrl(path: string): string {
  return `${window.location.origin}${base}/ocr/${path}`;
}

/** Ridimensiona, passa in grigi e allarga il contrasto: aiuta molto con le foto fatte al telefono. */
export async function prepareImage(file: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const maxW = 2200;
  const scale = Math.min(1, maxW / bmp.width);
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const hist = new Array<number>(256).fill(0);
  for (let i = 0; i < d.length; i += 4) {
    const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = g;
    hist[g]++;
  }
  // taglia l'1% più scuro e più chiaro e riscala
  const total = w * h;
  let lo = 0;
  let acc = 0;
  while (lo < 255 && acc + hist[lo] < total * 0.01) acc += hist[lo++];
  let hi = 255;
  acc = 0;
  while (hi > 0 && acc + hist[hi] < total * 0.01) acc += hist[hi--];
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.max(0, Math.min(255, Math.round(((d[i] - lo) * 255) / span)));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}

export async function readImageText(file: Blob, onProgress?: (p: OcrProgress) => void): Promise<string> {
  onProgress?.({ stage: "Preparo la foto", pct: 0 });
  const prepared = await prepareImage(file);
  onProgress?.({ stage: "Carico il lettore", pct: 0 });
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("ita", 1, {
    workerPath: assetUrl("worker.min.js"),
    corePath: assetUrl("core"),
    langPath: assetUrl("lang"),
    gzip: true,
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress?.({ stage: "Leggo il foglio", pct: Math.round(m.progress * 100) });
      else if (m.status.includes("loading")) onProgress?.({ stage: "Carico il lettore", pct: Math.round(m.progress * 100) });
    },
  });
  try {
    let best = "";
    for (const psm of ["6", "4", "11"]) {
      await worker.setParameters({ tessedit_pageseg_mode: psm as never, preserve_interword_spaces: "1" });
      const { data } = await worker.recognize(prepared);
      if (data.text.length > best.length) best = data.text;
      // se già si riconoscono alcuni esami basta il primo passaggio
      if ((best.match(/\d/g) ?? []).length > 40 && /colesterolo|glicemia|creatinin|trigliceridi/i.test(best)) break;
    }
    return best;
  } finally {
    await worker.terminate();
  }
}
