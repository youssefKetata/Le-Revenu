import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";
const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-brand text-white shadow-sm hover:bg-brand-hover",
  secondary: "border-border bg-white text-foreground hover:bg-surface-muted",
};

export function buttonClassName(variant: Variant = "primary", className = "") {
  return `inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[9px] border px-[15px] py-2 text-[13px] leading-snug font-semibold text-center transition-colors disabled:cursor-wait disabled:opacity-65 ${variants[variant]} ${className}`;
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
