import { SECTIONS, type Section } from "@/lib/sections";

export default function PageBanner({
  section,
  title,
  children,
}: {
  section: Section;
  title: string;
  children?: React.ReactNode;
}) {
  const s = SECTIONS[section];
  return (
    <div className={`rounded-3xl px-5 py-4 ${s.chip} print:hidden`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {s.icon}
        </span>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      {children && <p className="mt-1 text-sm opacity-90">{children}</p>}
    </div>
  );
}
