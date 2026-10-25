"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: null, identifier: "" });
  const inputClass = "mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100";

  return (
    <form action={action} className="mt-8 space-y-5" aria-describedby={state.error ? "login-error" : undefined}>
      <div>
        <label htmlFor="identifier" className="block text-sm font-semibold">Identifiant ou adresse e-mail</label>
        <input id="identifier" name="identifier" autoComplete="username" maxLength={254} defaultValue={state.identifier} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" maxLength={72} required className={inputClass} />
      </div>
      {state.error && <p id="login-error" role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-[#eb0f0f] px-4 py-3 font-semibold text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
