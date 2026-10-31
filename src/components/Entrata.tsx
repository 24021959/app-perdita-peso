"use client";

import { APP_NAME } from "@/lib/config";
import { greeting } from "@/lib/greeting";
import { useData } from "@/lib/useData";
import { useState } from "react";

/** Schermata d'ingresso: logo, saluto per nome e, sotto, ciò che serve (password o attesa). */
export default function Entrata({ children }: { children: React.ReactNode }) {
  const { settings } = useData();
  const [saluto] = useState(() => greeting());
  const name = settings.name?.trim();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center text-accent">
        <svg width="56" height="56" viewBox="0 0 26 26" aria-hidden="true" className="mx-auto">
          <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M13 13 L18 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="13" cy="13" r="1.8" fill="currentColor" />
        </svg>
        <p className="mt-3 text-sm font-medium uppercase tracking-wide">{APP_NAME}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {saluto}
          {name ? `, ${name}` : ""}!
        </h1>
      </div>
      {children}
    </main>
  );
}
