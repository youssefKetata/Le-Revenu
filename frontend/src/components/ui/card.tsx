import type { ComponentProps } from "react";

type Props = ComponentProps<"section"> & {
  as?: "section" | "article";
  padding?: "normal" | "none";
};

export default function Card({
  as: Element = "section",
  padding = "normal",
  className = "",
  ...props
}: Props) {
  return (
    <Element
      {...props}
      className={`rounded-2xl border border-hairline bg-surface shadow-card ${padding === "normal" ? "p-[18px]" : ""} ${className}`}
    />
  );
}
