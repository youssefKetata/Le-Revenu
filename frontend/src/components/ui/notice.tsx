import type { ReactNode } from "react";
import Card from "./card";
import { buttonClassName } from "./button";

export function Notice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="py-9 text-center">
      <h2 className="font-serif text-2xl font-bold">{title}</h2>
      <div className="mt-3 leading-7 text-muted">{children}</div>
    </Card>
  );
}

export function ServiceError({ href = "/" }: { href?: string }) {
  return (
    <Notice title="La communauté est momentanément indisponible">
      <p>
        Nous ne pouvons pas charger les discussions. Réessayez dans quelques
        instants.
      </p>
      <a className={buttonClassName("secondary", "mt-5")} href={href}>
        Réessayer
      </a>
    </Notice>
  );
}
