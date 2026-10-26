import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader, {
  HeaderShell,
  SiteBar,
  MobileNavigation,
} from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Communauté Le Revenu",
  description:
    "L’espace d’échange des lecteurs du Revenu : questions, expériences et discussions.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <a
          className="fixed top-2 left-3 z-50 -translate-y-[200%] rounded-lg bg-foreground px-3.5 py-2 font-semibold text-background focus:translate-y-0"
          href="#main"
        >
          Aller au contenu
        </a>
        <SiteBar />
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
        {modal}
        <Suspense fallback={null}>
          <MobileNavigation />
        </Suspense>
      </body>
    </html>
  );
}
