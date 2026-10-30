// Preferenze di aspetto, valide solo per questo dispositivo (non vengono sincronizzate online).
export type Theme = "auto" | "light" | "dark";
export type FontSize = "normal" | "large" | "xl";

const THEME_KEY = "ui:theme";
const FONT_KEY = "ui:font";
const EVENT = "ui-prefs";

export type Prefs = { theme: Theme; font: FontSize };
const DEFAULT: Prefs = { theme: "auto", font: "normal" };
let cached: Prefs = DEFAULT;

function read(): Prefs {
  try {
    const t = localStorage.getItem(THEME_KEY);
    const f = localStorage.getItem(FONT_KEY);
    const next: Prefs = {
      theme: t === "light" || t === "dark" ? t : "auto",
      font: f === "large" || f === "xl" ? f : "normal",
    };
    if (next.theme !== cached.theme || next.font !== cached.font) cached = next;
  } catch {
    /* localStorage non disponibile: restano i valori predefiniti */
  }
  return cached;
}

export const getPrefs = read;
export const getServerPrefs = (): Prefs => DEFAULT;

export function subscribePrefs(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function applyPrefs(p: Prefs) {
  const d = document.documentElement;
  if (p.theme === "auto") delete d.dataset.theme;
  else d.dataset.theme = p.theme;
  if (p.font === "normal") delete d.dataset.font;
  else d.dataset.font = p.font;
}

export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...read(), ...patch };
  try {
    localStorage.setItem(THEME_KEY, next.theme);
    localStorage.setItem(FONT_KEY, next.font);
  } catch {
    /* ignora */
  }
  cached = next;
  applyPrefs(next);
  window.dispatchEvent(new Event(EVENT));
}

/** Script da eseguire subito nella pagina, prima del disegno, per evitare il lampo di colore. */
export const PREFS_BOOT_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}"),f=localStorage.getItem("${FONT_KEY}");if(t==="light"||t==="dark")d.dataset.theme=t;if(f==="large"||f==="xl")d.dataset.font=f}catch(e){}`;
