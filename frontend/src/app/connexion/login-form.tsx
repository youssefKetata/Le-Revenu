"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField, fieldDescription, formControlClassName } from "@/components/ui/form-field";
import { passwordError, textError } from "@/lib/form-validation";
import { useFormValidation } from "@/lib/use-form-validation";

const rules = {
  identifier: (value: string) => textError(value, 1, 254),
  password: passwordError,
};

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState(login, {
    error: null,
    identifier: "",
  });
  const validation = useFormValidation(rules, state);
  const { errors } = validation;
  return (
    <form
      action={action}
      noValidate
      onSubmit={validation.submit}
      className="mt-3.5 space-y-3.5"
      aria-describedby={validation.formError ? "login-error" : undefined}
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <FormField id="identifier" label="Identifiant ou adresse e-mail" error={errors.identifier}>
        <input
          id="identifier"
          name="identifier"
          className={`${formControlClassName} h-10`}
          autoComplete="username"
          autoFocus
          defaultValue={state.identifier}
          aria-required="true"
          aria-invalid={!!errors.identifier}
          aria-describedby={fieldDescription("identifier", errors.identifier)}
          onChange={(event) => validation.change("identifier", event.currentTarget.value)}
        />
      </FormField>
      <FormField id="password" label="Mot de passe" error={errors.password}>
        <input
          id="password"
          name="password"
          type="password"
          className={`${formControlClassName} h-10`}
          autoComplete="current-password"
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={fieldDescription("password", errors.password)}
          onChange={(event) => validation.change("password", event.currentTarget.value)}
        />
      </FormField>
      {validation.formError && (
        <p id="login-error" role="alert" className="text-sm text-brand-text">
          {validation.formError}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
