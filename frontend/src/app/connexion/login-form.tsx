"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField, formControlClassName } from "@/components/ui/form-field";

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState(login, {
    error: null,
    identifier: "",
  });
  return (
    <form
      action={action}
      className="mt-8 space-y-5"
      aria-describedby={state.error ? "login-error" : undefined}
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <FormField id="identifier" label="Identifiant ou adresse e-mail">
        <input
          id="identifier"
          name="identifier"
          className={formControlClassName}
          autoComplete="username"
          maxLength={254}
          defaultValue={state.identifier}
          required
        />
      </FormField>
      <FormField id="password" label="Mot de passe">
        <input
          id="password"
          name="password"
          type="password"
          className={formControlClassName}
          autoComplete="current-password"
          maxLength={72}
          required
        />
      </FormField>
      {state.error && (
        <p id="login-error" role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
