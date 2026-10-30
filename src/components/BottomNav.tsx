"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Oggi" },
  { href: "/andamento/", label: "Andamento" },
  { href: "/menu/", label: "Menu" },
  { href: "/salute/", label: "Salute" },
  { href: "/consigli/", label: "Consigli" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-line print:hidden">
      <ul className="max-w-xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const active =
            it.href === "/" ? path === "/" : path.startsWith(it.href.slice(0, -1));
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`block text-center py-3 text-[0.8rem] font-medium ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
