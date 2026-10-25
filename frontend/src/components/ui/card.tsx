import type { ComponentProps } from "react";

type Props = ComponentProps<"section"> & { as?: "section" | "article" };

export default function Card({
  as: Element = "section",
  className = "",
  ...props
}: Props) {
  return (
    <Element
      {...props}
      className={`rounded-[14px] border border-black/7 bg-white p-[22px] shadow-sm ${className}`}
    />
  );
}
