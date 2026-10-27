import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader, {
  HeaderShell,
  SiteBar,
  MobileNavigation,
  MobileNavigationSkeleton,
} from "@/components/layout/site-header";
import Skeleton from "@/components/ui/skeleton";
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
              <span role="status" className="sr-only">Chargement du compte…</span>
              <div aria-hidden="true" className="ml-auto flex items-center gap-2.5">
                <Skeleton className="h-9 w-24 rounded-[10px]" />
                <Skeleton className="hidden h-9 w-24 rounded-[10px] min-[861px]:block" />
              </div>
            </HeaderShell>
          }
        >
          <SiteHeader />
        </Suspense>
        {children}
        {modal}
        <Suspense fallback={<MobileNavigationSkeleton />}>
          <MobileNavigation />
        </Suspense>
      </body>
    </html>
  );
}
