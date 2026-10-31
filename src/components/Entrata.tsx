"use client";

import { APP_NAME } from "@/lib/config";
import { greeting } from "@/lib/greeting";
import { useData } from "@/lib/useData";
import { useState } from "react";
import Logo from "./Logo";

/** Schermata d'ingresso: logo, saluto per nome e, sotto, ciò che serve (password o attesa). */
export default function Entrata({ children }: { children: React.ReactNode }) {
  const { settings } = useData();
  const [saluto] = useState(() => greeting());
  const name = settings.name?.trim();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center text-accent">
        <span className="mx-auto block w-fit">
          <Logo size={72} />
        </span>
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
