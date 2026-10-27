import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import AccountMenu from "./account-menu";
import MobileNav from "./mobile-nav";
import Icon from "@/components/ui/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";

export function Brand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 flex-col items-start gap-1 md:flex-row md:items-center md:gap-2.5"
      aria-label="Le Revenu — accueil de la communauté"
    >
      <span
        aria-hidden="true"
        className="inline-flex items-stretch bg-brand p-[.1em] text-[19px] leading-none font-black tracking-[-.02em] text-white md:text-[22px]"
      >
        <span className="mr-[.12em] bg-black px-[.1em] pt-[.1em] pb-[.12em]">
          LE
        </span>
        <span className="px-[.1em] pt-[.1em] pb-[.12em]">REVENU</span>
      </span>
      <span className="hidden h-5 w-px bg-border-strong md:block" />
      <span className="text-xs font-semibold text-secondary md:text-[15px]">
        Communauté
      </span>
    </Link>
  );
}

export function SiteBar() {
  return (
    <div className="border-b border-hairline bg-surface text-[13px] text-secondary">
      <div className="mx-auto flex h-[38px] max-w-[1260px] items-center gap-5 px-4">
        <a
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-foreground hover:text-brand-text"
          href="https://www.lerevenu.com"
          target="_blank"
          rel="noopener"
        >
          <Icon name="arrowLeft" className="size-[15px]" />
          Retour sur lerevenu.com
        </a>
        <nav
          aria-label="Rubriques de lerevenu.com"
          className="hidden min-w-0 gap-4 overflow-hidden border-l border-border pl-5 min-[1101px]:flex"
        >
          {[
            "Bourse",
            "Économie",
            "Placements",
            "Immobilier",
            "Impôts",
            "Succession",
            "Vie pratique",
          ].map((label) => (
            <a
              key={label}
              className="whitespace-nowrap hover:text-brand-text"
              href="https://www.lerevenu.com"
              target="_blank"
              rel="noopener"
            >
              {label}
            </a>
          ))}
        </nav>
        <span className="ml-auto flex items-center gap-4">
          <a
            className="hidden items-center gap-1.5 whitespace-nowrap hover:text-brand-text md:inline-flex"
            href="https://www.lerevenu.com"
            target="_blank"
            rel="noopener"
          >
            <Icon name="book" className="size-[15px]" />
            Le magazine
          </a>
          <a
            className="rounded-full bg-brand px-[11px] py-[3px] font-semibold whitespace-nowrap text-white hover:brightness-[.93]"
            href="https://www.lerevenu.com"
            target="_blank"
            rel="noopener"
          >
            S’abonner
          </a>
        </span>
      </div>
    </div>
  );
}

export function HeaderShell({
  children,
  notice,
}: {
  children: ReactNode;
  notice?: ReactNode;
}) {
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-hairline bg-glass shadow-[0_1px_0_var(--hairline),0_8px_24px_-18px_rgb(0_0_0/35%)] backdrop-blur-[20px] backdrop-saturate-180">
      <div className="mx-auto flex h-[62px] w-full max-w-[1260px] items-center gap-5 px-4">
        <Brand />
        {children}
      </div>
      {notice}
    </header>
  );
}

export default async function SiteHeader() {
  const session = await getSession();
  return (
    <HeaderShell
      notice={
        session.unavailable && (
          <p
            role="status"
            className="bg-brand-soft px-4 py-2 text-center text-[13px] text-brand-text"
          >
            Le service de connexion est indisponible. Vos discussions restent
            accessibles.
          </p>
        )
      }
    >
      <div className="relative ml-auto flex items-center gap-2.5">
        {session.member ? (
          <>
            <span className="hidden min-[861px]:inline-flex">
              <ButtonLink href="/discussions/nouvelle">
                <Icon name="plus" />
                Publier
              </ButtonLink>
            </span>
            <AccountMenu username={session.member.username} />
          </>
        ) : (
          <>
            <ButtonLink href="/connexion" variant="quiet">
              Se connecter
            </ButtonLink>
            <span className="hidden min-[861px]:inline-flex">
              <ButtonLink href="/connexion">Rejoindre</ButtonLink>
            </span>
          </>
        )}
        {session.unavailable && (
          <form action={logout}>
            <Button type="submit" variant="quiet">
              Se déconnecter
            </Button>
          </form>
        )}
      </div>
    </HeaderShell>
  );
}

export async function MobileNavigation() {
  const session = await getSession();
  return <MobileNav signedIn={Boolean(session.member)} />;
}

export function MobileNavigationSkeleton() {
  return (
    <div aria-hidden="true" className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t border-hairline bg-glass px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] backdrop-blur-[20px] backdrop-saturate-180 md:hidden">
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} className="flex min-h-12 min-w-14 flex-col items-center gap-1 px-2 py-1">
          {index === 2 ? (
            <Skeleton className="-mt-[18px] size-12 rounded-full" />
          ) : (
            <>
              <Skeleton className="size-5" />
              <Skeleton className="h-3 w-10" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
