// Un colore pastello per ogni sezione. Le classi sono scritte per intero perché Tailwind le trovi.
export type Section = "oggi" | "andamento" | "menu" | "salute" | "consigli" | "impostazioni";

export const SECTIONS: Record<Section, { label: string; icon: string; chip: string; soft: string; ink: string }> = {
  oggi: { label: "Oggi", icon: "☀️", chip: "bg-mint text-mint-ink", soft: "bg-mint", ink: "text-mint-ink" },
  andamento: { label: "Andamento", icon: "📈", chip: "bg-sky text-sky-ink", soft: "bg-sky", ink: "text-sky-ink" },
  menu: { label: "Menu", icon: "🍽️", chip: "bg-peach text-peach-ink", soft: "bg-peach", ink: "text-peach-ink" },
  salute: { label: "Salute", icon: "🩺", chip: "bg-rose text-rose-ink", soft: "bg-rose", ink: "text-rose-ink" },
  consigli: { label: "Consigli", icon: "💡", chip: "bg-lilac text-lilac-ink", soft: "bg-lilac", ink: "text-lilac-ink" },
  impostazioni: { label: "Impostazioni", icon: "⚙️", chip: "bg-butter text-butter-ink", soft: "bg-butter", ink: "text-butter-ink" },
};

// colori a rotazione per i giorni della settimana, le serie e i riquadri
export const TONES = [
  { chip: "bg-mint text-mint-ink", soft: "bg-mint", ink: "text-mint-ink" },
  { chip: "bg-sky text-sky-ink", soft: "bg-sky", ink: "text-sky-ink" },
  { chip: "bg-peach text-peach-ink", soft: "bg-peach", ink: "text-peach-ink" },
  { chip: "bg-rose text-rose-ink", soft: "bg-rose", ink: "text-rose-ink" },
  { chip: "bg-lilac text-lilac-ink", soft: "bg-lilac", ink: "text-lilac-ink" },
  { chip: "bg-butter text-butter-ink", soft: "bg-butter", ink: "text-butter-ink" },
] as const;

export type Tone = (typeof TONES)[number];
