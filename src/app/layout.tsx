import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Perdita peso",
  description: "Diario personale: peso, digiuno 16:8 e menu",
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
      </body>
    </html>
  );
}
