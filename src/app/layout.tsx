import type { Metadata, Viewport } from "next";
import "./globals.css";
import Benvenuto from "@/components/Benvenuto";
import Gate from "@/components/Gate";
import Header from "@/components/Header";
import { APP_NAME } from "@/lib/config";
import { PREFS_BOOT_SCRIPT } from "@/lib/prefs";
import RegisterSW from "@/components/RegisterSW";
import SyncInit from "@/components/SyncInit";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Diario personale: peso, digiuno 16:8 e menu",
  manifest: `${base}/manifest.webmanifest`,
  icons: { icon: `${base}/icon-192.png`, apple: `${base}/icon-192.png` },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2a7562",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Gate>
          <Benvenuto />
          <Header />
          <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-5 pb-12">
            {children}
          </main>
        </Gate>
        <RegisterSW />
        <SyncInit />
      </body>
    </html>
  );
}
