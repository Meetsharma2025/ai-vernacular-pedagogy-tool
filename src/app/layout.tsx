import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "GyanSetu ज्ञानसेतु — AI-Powered Vernacular Pedagogy (SIH 26042)",
  description:
    "One Classroom. Many Mother Tongues. One Learning Bridge. Nemotron-powered mother-tongue primary education for Jharkhand PALASH MTB-MLE.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GyanSetu",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
