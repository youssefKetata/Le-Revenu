import type { KeyboardEvent, ReactNode } from "react";

export function submitOnShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export const formControlClassName =
  "min-w-0 w-full rounded-[9px] border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25 aria-invalid:border-brand disabled:opacity-65";

export function fieldDescription(id: string, error?: string, hasHint = false) {
  return (
    [hasHint && `${id}-help`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-error`} role="alert" className="text-[12.5px] text-brand-text">
      {error}
    </p>
  ) : null;
}

export function FormField({
  id,
  label,
  hint,
  error,
  labelHidden = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  labelHidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={labelHidden ? "sr-only" : "text-sm font-semibold"}
      >
        {label}
      </label>
      {children}
      <FieldError id={id} error={error} />
      {hint && (
        <p id={`${id}-help`} className="text-[12.5px] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
