"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { discussionHref, readPage } from "@/lib/forum/query";
import type { PublishState } from "@/lib/forum/types";
import { sessionToken } from "@/lib/session";
import { StrapiError, strapiRequest } from "@/lib/strapi";

type Intent = "vote" | "unvote" | "accept" | "clear";

async function changeReaction(
  discussion: string,
  reply: string,
  intent: Intent,
): Promise<PublishState> {
  const token = await sessionToken();
  if (!token) return { error: "Connectez-vous pour participer.", signIn: true };
  if (![discussion, reply].every((id) => /^[a-z0-9]{24}$/.test(id)))
    return { error: "Cette réponse est introuvable." };
  try {
    const vote = intent === "vote" || intent === "unvote";
    await strapiRequest(
      vote
        ? `/discussions/${discussion}/replies/${reply}/useful`
        : `/discussions/${discussion}/best-answer`,
      {
        method: "POST", token,
        body: { data: vote ? { useful: intent === "vote" } : { reply: intent === "accept" ? reply : null } },
      },
    );
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    if (error.status === 401)
      return { error: "Votre session a expiré. Reconnectez-vous pour continuer.", signIn: true };
    if (error.status === 403)
      return { error: "Vous n’êtes pas autorisé à effectuer cette action. Actualisez la page pour vérifier votre connexion." };
    if (error.status === 404)
      return { error: "La question ou la réponse n’existe plus. Actualisez la page." };
    return { error: "La modification n’a pas pu être confirmée. Actualisez la page avant de réessayer." };
  }
  if (intent === "accept" || intent === "clear") revalidatePath("/");
  revalidatePath(discussionHref(discussion));
  return { error: null };
}

export async function setReplyUseful(
  discussion: string,
  reply: string,
  useful: boolean,
): Promise<PublishState> {
  if (typeof useful !== "boolean") return { error: "Ce vote est invalide." };
  // Enhanced voting returns fresh route data without navigating or moving focus.
  return changeReaction(discussion, reply, useful ? "vote" : "unvote");
}

export async function updateReplyReaction(
  discussion: string,
  reply: string,
  page: number,
  _previous: PublishState,
  formData: FormData,
): Promise<PublishState> {
  if (!readPage(String(page))) return { error: "Cette page est invalide." };
  const intent = formData.get("intent");
  if (
    formData.getAll("intent").length !== 1 ||
    (intent !== "vote" && intent !== "unvote" && intent !== "accept" && intent !== "clear")
  )
    return { error: "Cette action est invalide." };
  const state = await changeReaction(discussion, reply, intent);
  if (state.error) return state;
  const query = page > 1 ? `?page=${page}` : "";
  const anchor = intent === "vote" || intent === "unvote" ? `reply-${reply}` : "replies";
  redirect(`${discussionHref(discussion)}${query}#${anchor}`);
}
