"use client";

import { useState, type SubmitEvent } from "react";

type ServerError = { error: string | null; field?: string };
type Rule = (value: string) => string | undefined;

export function useFormValidation<Field extends string>(
  rules: Record<Field, Rule>,
  serverState: ServerError,
  controlIds: Partial<Record<Field, string>> = {},
) {
  const [clientErrors, setClientErrors] = useState<Partial<Record<Field, string>>>({});
  const [dismissedServer, setDismissedServer] = useState<ServerError | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const serverField =
    serverState.field && Object.hasOwn(rules, serverState.field)
      ? (serverState.field as Field)
      : undefined;
  const serverVisible = dismissedServer !== serverState;
  const errors = { ...clientErrors };
  if (serverField && serverVisible && serverState.error)
    errors[serverField] = serverState.error;

  function change(field: Field, value: string) {
    if (serverField === field) setDismissedServer(serverState);
    if (submitted || errors[field])
      setClientErrors((previous) => ({ ...previous, [field]: rules[field](value) }));
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    setSubmitted(true);
    const data = new FormData(event.currentTarget);
    const next: Partial<Record<Field, string>> = {};
    const fields = Object.keys(rules) as Field[];
    for (const field of fields) {
      const value = data.get(field);
      const error = rules[field](typeof value === "string" ? value : "");
      if (error) next[field] = error;
    }
    setClientErrors(next);
    setDismissedServer(serverState);
    const first = fields.find((field) => next[field]);
    if (first) {
      event.preventDefault();
      event.currentTarget
        .querySelector<HTMLElement>(`[id="${controlIds[first] ?? first}"]`)
        ?.focus();
    }
  }

  return {
    errors,
    change,
    submit,
    formError: !serverField && serverVisible ? serverState.error : null,
  };
}
