"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/icon";
import styles from "@/components/ui/button.module.css";
import { logout } from "@/app/actions/auth";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/espaces", label: "Espaces", icon: "grid" },
  { href: "/discussions/nouvelle", label: "Publier", icon: "plus" },
  { href: "/charte", label: "Charte", icon: "book" },
  { href: "/connexion", label: "Connexion", icon: "user" },
];
export default function MobileNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t border-hairline bg-glass px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] backdrop-blur-[20px] backdrop-saturate-180 md:hidden"
    >
      {links.map((link) =>
        signedIn && link.href === "/connexion" ? (
          <form action={logout} key={link.href}>
            <button
              type="submit"
              className="flex min-h-12 min-w-14 flex-col items-center gap-0.5 px-2 py-1 text-[11.5px] text-muted"
            >
              <Icon name="user" />
              Déconnexion
            </button>
          </form>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            aria-label={link.label === "Publier" ? "Publier" : undefined}
            className={`flex min-h-12 min-w-14 flex-col items-center gap-0.5 px-2 py-1 text-[11.5px] ${pathname === link.href ? "font-semibold text-brand-text" : "text-muted"}`}
          >
            {link.label === "Publier" ? (
              <span
                className={`${styles.primary} -mt-[18px] grid size-12 place-items-center rounded-full text-white shadow-lg`}
              >
                <Icon name="plus" className="size-6" />
              </span>
            ) : (
              <>
                <Icon name={link.icon} />
                {link.label}
              </>
            )}
          </Link>
        ),
      )}
    </nav>
  );
}
