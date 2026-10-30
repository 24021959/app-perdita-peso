import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import RegisterSW from "@/components/RegisterSW";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Perdita peso",
  description: "Diario personale: peso, digiuno 16:8 e menu",
  manifest: `${base}/manifest.webmanifest`,
  icons: { icon: `${base}/icon-192.png`, apple: `${base}/icon-192.png` },
  appleWebApp: { capable: true, title: "Perdita peso", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f6f5c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-5 pb-28">
          {children}
        </main>
        <BottomNav />
        <RegisterSW />
      </body>
    </html>
  );
}
