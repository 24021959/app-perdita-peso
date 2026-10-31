/** Logo di Vivo: una V con un puntino sopra (anche una figura con le braccia alzate). Prende il colore dal testo. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M18.75 25 L32 46.5 L45.25 25" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="18" r="5.5" fill="currentColor" />
    </svg>
  );
}

/** Logo su fondo pieno, come l'icona dell'app. */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center bg-accent text-on-accent"
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    >
      <LogoMark size={Math.round(size * 0.78)} />
    </span>
  );
}
