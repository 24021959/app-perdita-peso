"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/config";
import { SECTIONS, type Section } from "@/lib/sections";
import { signOut } from "@/lib/sync";
import { useSyncStatus } from "@/lib/useSync";
import SyncBadge from "./SyncBadge";

const items: { href: string; section: Section }[] = [
  { href: "/", section: "oggi" },
  { href: "/andamento/", section: "andamento" },
  { href: "/menu/", section: "menu" },
  { href: "/salute/", section: "salute" },
  { href: "/consigli/", section: "consigli" },
  { href: "/impostazioni/", section: "impostazioni" },
];

const isActive = (path: string, href: string) =>
  href === "/" ? path === "/" : path.startsWith(href.slice(0, -1));

export default function Header() {
  const path = usePathname();
  // il menu si chiude da solo quando si cambia pagina: ricorda per quale pagina è stato aperto
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === path;
  const sync = useSyncStatus();
  const loggedIn = sync.phase === "idle" || sync.phase === "syncing" || sync.phase === "error";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card print:hidden">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-accent">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="M13 13 L18 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="13" cy="13" r="1.8" fill="currentColor" />
          </svg>
          {APP_NAME}
        </Link>

        {/* schermi larghi: voci in fila */}
        <nav className="hidden md:block" aria-label="Menu principale">
          <ul className="flex gap-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive(path, it.href) ? SECTIONS[it.section].chip : "text-muted hover:text-foreground"
                  }`}
                >
                  {SECTIONS[it.section].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
        {loggedIn && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted hover:text-foreground"
            aria-label="Esci dall'account"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Esci
          </button>
        )}
        {/* telefono: panino */}
        <button
          type="button"
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg"
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpenFor(open ? null : path)}
        >
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 h-0.5 w-6 rounded bg-foreground transition-all ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 rounded bg-foreground transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 rounded bg-foreground transition-all ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Chiudi il menu"
            tabIndex={-1}
            onClick={() => setOpenFor(null)}
            className="fixed inset-x-0 bottom-0 top-14 z-10 bg-black/30 md:hidden"
          />
          <nav
            id="menu-mobile"
            aria-label="Menu principale"
            className="absolute inset-x-0 top-full z-20 border-b border-line bg-card shadow-lg md:hidden"
          >
            <ul className="mx-auto max-w-2xl px-2 py-2">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`block rounded-xl px-4 py-4 text-lg ${
                      isActive(path, it.href) ? `${SECTIONS[it.section].chip} font-semibold` : ""
                    }`}
                  >
                    <span className="mr-3" aria-hidden="true">
                      {SECTIONS[it.section].icon}
                    </span>
                    {SECTIONS[it.section].label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mx-auto max-w-2xl px-6 pb-4">
              <SyncBadge />
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
