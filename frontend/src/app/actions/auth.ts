"use server";

import { redirect, RedirectType } from "next/navigation";
import { clearSession, saveSession, sessionToken } from "@/lib/session";
import { StrapiError, strapiRequest } from "@/lib/strapi";
import { safeReturnTo } from "@/lib/forum/query";
import { passwordError, textError } from "@/lib/form-validation";

export type LoginState = {
  error: string | null;
  identifier: string;
  field?: "identifier" | "password";
};

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const value = formData.get("identifier");
  const identifier = typeof value === "string" ? value.trim() : "";
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    formData.getAll("identifier").length !== 1 ||
    formData.getAll("password").length !== 1
  ) {
    return {
      error: "Saisissez votre identifiant et votre mot de passe.",
      identifier: identifier.slice(0, 254),
    };
  }
  const identifierError = textError(identifier, 1, 254);
  if (identifierError)
    return { error: identifierError, field: "identifier", identifier: identifier.slice(0, 254) };
  const invalidPassword = passwordError(password);
  if (invalidPassword)
    return { error: invalidPassword, field: "password", identifier };
  try {
    const response = await strapiRequest<{ jwt: string }>("/auth/local", {
      method: "POST",
      body: { identifier, password },
    });
    await saveSession(response.jwt);
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    const status = error.status;
    const message =
      status === 429
        ? "Trop de tentatives. Réessayez dans quelques instants."
        : status >= 500
          ? "Le service de connexion est indisponible. Réessayez dans quelques instants."
          : "Identifiant ou mot de passe incorrect, ou compte indisponible.";
    return {
      error: message,
      identifier,
      ...(status < 500 && status !== 429 ? { field: "password" as const } : {}),
    };
  }
  redirect(safeReturnTo(formData.get("returnTo")), RedirectType.replace);
}

export async function logout(): Promise<void> {
  const token = await sessionToken();
  try {
    if (token)
      await strapiRequest("/auth/logout", { method: "POST", token, body: {} });
  } catch {
    // Local logout must remain possible with an expired token or an unavailable API.
  } finally {
    await clearSession();
  }
  redirect("/");
}
