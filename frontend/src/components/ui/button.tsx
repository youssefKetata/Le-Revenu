import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./button.module.css";

type Variant = "primary" | "secondary" | "quiet";
const variants: Record<Variant, string> = {
  primary: `${styles.primary} border-transparent text-white hover:brightness-[.93]`,
  secondary:
    "border-hairline bg-surface text-foreground shadow-[0_1px_2px_rgb(0_0_0/6%)] hover:bg-surface-muted",
  quiet:
    "border-transparent text-secondary hover:bg-fill hover:text-foreground",
};

export function buttonClassName(variant: Variant = "primary", className = "") {
  return `inline-flex min-h-9 items-center justify-center gap-[7px] rounded-[10px] border px-4 py-1.5 text-sm leading-snug font-semibold text-center transition-[background-color,box-shadow,filter,transform] active:scale-[.98] disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 ${variants[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClassName(variant, className)}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonClassName(variant, className)} />;
}
