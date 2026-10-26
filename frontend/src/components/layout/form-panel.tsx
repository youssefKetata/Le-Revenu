import type { ReactNode } from "react";
import { FormCloseButton } from "./modal";

export default function FormPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-floating">
      <div className="flex items-center justify-between gap-4 px-4 pt-[18px] md:px-[22px]">
        <h1 className="font-serif text-[23px] font-bold tracking-[-.01em]">
          {title}
        </h1>
        <FormCloseButton />
      </div>
      {children}
    </section>
  );
}
