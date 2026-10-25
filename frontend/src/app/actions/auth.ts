"use server";

import { redirect } from "next/navigation";
import { clearSession, saveSession, sessionToken } from "@/lib/session";
import { StrapiError, strapiRequest } from "@/lib/strapi";

export type LoginState = { error: string | null; identifier: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const value = formData.get("identifier");
  const identifier = typeof value === "string" ? value.trim() : "";
  const password = formData.get("password");
  if (!identifier || identifier.length > 254 || typeof password !== "string" || !password
    || Buffer.byteLength(password, "utf8") > 72
    || formData.getAll("identifier").length !== 1 || formData.getAll("password").length !== 1) {
    return { error: "Saisissez votre identifiant et votre mot de passe.", identifier: identifier.slice(0, 254) };
  }
  try {
    const response = await strapiRequest<{ jwt: string }>("/auth/local", {
      method: "POST", body: { identifier, password },
    });
    await saveSession(response.jwt);
  } catch (error) {
    const status = error instanceof StrapiError ? error.status : 503;
    const message = status === 429
      ? "Trop de tentatives. Réessayez dans quelques instants."
      : status >= 500
        ? "Le service de connexion est indisponible. Réessayez dans quelques instants."
        : "Identifiant ou mot de passe incorrect, ou compte indisponible.";
    return { error: message, identifier };
  }
  redirect("/");
}

export async function logout(): Promise<void> {
  const token = await sessionToken();
  try {
    if (token) await strapiRequest("/auth/logout", { method: "POST", token, body: {} });
  } catch {
    // Local logout must remain possible with an expired token or an unavailable API.
  } finally {
    await clearSession();
  }
  redirect("/");
}
