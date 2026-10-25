import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader, { HeaderShell } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Communauté Le Revenu",
  description:
    "L’espace d’échange des lecteurs du Revenu : questions, expériences et discussions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a
          className="fixed top-2 left-2 z-50 -translate-y-[200%] rounded-lg bg-white px-4 py-2.5 focus:translate-y-0"
          href="#main"
        >
          Aller au contenu
        </a>
        <Suspense
          fallback={
            <HeaderShell>
              <span className="ml-auto text-sm text-muted">Chargement…</span>
            </HeaderShell>
          }
        >
          <SiteHeader />
        </Suspense>
        {children}
        <footer className="mx-auto mt-auto w-full max-w-7xl border-t border-border px-4 py-6 text-[11px] text-muted md:px-6">
          La communauté des lecteurs du Revenu. Échangeons avec respect et
          bienveillance.
        </footer>
      </body>
    </html>
  );
}
