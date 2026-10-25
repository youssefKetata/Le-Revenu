import type { ReactNode } from "react";

export const formControlClassName =
  "min-w-0 w-full rounded-[9px] border border-border bg-white px-[13px] py-[11px] focus:border-brand focus:outline-2 focus:outline-brand/20 focus:outline-offset-1 aria-invalid:border-brand disabled:opacity-65";

export function FormField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-help`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
