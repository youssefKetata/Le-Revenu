import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { Avatar } from "@/components/forum/byline";
import { Button, ButtonLink } from "@/components/ui/button";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-3.5"
      aria-label="Le Revenu — accueil de la communauté"
    >
      <span className="inline-flex items-stretch gap-[3px] bg-brand p-[3px] text-xl leading-none font-black tracking-tighter text-white md:text-[22px]">
        <span className="bg-black px-0.5 py-[3px]">LE</span>
        <span className="px-0.5 py-[3px]">REVENU</span>
      </span>
      <span className="hidden border-l border-border pl-3.5 font-semibold md:inline">
        Communauté
      </span>
    </Link>
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
    <header className="sticky top-0 z-30 border-b border-black/7 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex min-h-[66px] w-full max-w-7xl items-center gap-2.5 px-4 md:min-h-[74px] md:gap-5 md:px-6">
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
            className="bg-red-50 px-6 py-2 text-center text-[13px] text-red-800"
          >
            Le service de connexion est indisponible. Vos discussions restent
            accessibles.
          </p>
        )
      }
    >
      <div className="ml-auto flex items-center justify-end gap-2 md:gap-2.5">
        {session.member && (
          <span className="hidden max-w-[150px] items-center gap-2 text-[13px] font-semibold wrap-anywhere md:inline-flex wide:max-w-[200px]">
            <Avatar name={session.member.username} />
            <span>{session.member.username}</span>
          </span>
        )}
        {session.member || session.unavailable ? (
          <form action={logout}>
            <Button variant="secondary" type="submit">
              Se déconnecter
            </Button>
          </form>
        ) : (
          <ButtonLink variant="secondary" href="/connexion">
            Se connecter
          </ButtonLink>
        )}
        <ButtonLink href="/discussions/nouvelle" className="max-[380px]:hidden">
          <span aria-hidden="true">＋</span> Publier
        </ButtonLink>
      </div>
    </HeaderShell>
  );
}
