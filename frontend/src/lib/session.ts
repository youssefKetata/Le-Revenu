import "server-only";
import { cookies } from "next/headers";
import { StrapiError, strapiRequest } from "@/lib/strapi";

const cookieName = "le_revenu_session";
export type Member = { documentId: string; username: string };

export async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(cookieName)?.value;
}

export async function saveSession(token: string): Promise<void> {
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(cookieName);
}

export async function getSession(): Promise<{ member: Member | null; unavailable: boolean }> {
  const token = await sessionToken();
  if (!token) return { member: null, unavailable: false };
  try {
    // Strapi checks the JWT, current member and active session; no local token trust.
    const user = await strapiRequest<Member>("/users/me", { token });
    return { member: { documentId: user.documentId, username: user.username }, unavailable: false };
  } catch (error) {
    if (error instanceof StrapiError && (error.status === 401 || error.status === 403)) {
      return { member: null, unavailable: false };
    }
    return { member: null, unavailable: true };
  }
}
