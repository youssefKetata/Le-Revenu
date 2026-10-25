"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { discussionHref } from "@/lib/forum/query";
import type { Discussion, Item, PublishState, Reply } from "@/lib/forum/types";
import { sessionToken } from "@/lib/session";
import { StrapiError, strapiRequest } from "@/lib/strapi";

function publishError(error: unknown): PublishState {
  if (!(error instanceof StrapiError)) throw error;
  if (error.status >= 500)
    return {
      error:
        "La publication n’a pas pu être confirmée. Vérifiez la discussion avant de réessayer ; votre texte est conservé.",
    };
  if (error.status === 401)
    return {
      error:
        "Votre session a expiré. Reconnectez-vous pour publier. Votre texte est conservé.",
      signIn: true,
    };
  if (error.status === 403)
    return {
      error:
        "Votre compte n’est pas autorisé à publier. Reconnectez-vous ou contactez un administrateur.",
      signIn: true,
    };
  if (error.status === 404)
    return {
      error:
        "La discussion ou la catégorie n’existe plus. Actualisez la page avant de publier.",
    };
  if (error.status === 429)
    return {
      error: "Trop de tentatives. Patientez un instant avant de réessayer.",
    };
  const messages: Record<string, string> = {
    title:
      "Le titre doit contenir entre 10 et 255 caractères, sans compter les espaces au début et à la fin.",
    content: "Le contenu ne peut pas être vide ou dépasser la limite indiquée.",
    type: "Choisissez Question ou Discussion.",
    category: "Choisissez une catégorie valide.",
  };
  return {
    error:
      messages[error.field ?? ""] ??
      "Vérifiez les champs du formulaire avant de publier.",
    field: error.field,
  };
}

function textFields(
  formData: FormData,
  fields: string[],
): Record<string, string> | null {
  const values: Record<string, string> = {};
  for (const name of fields) {
    const value = formData.get(name);
    if (typeof value !== "string" || formData.getAll(name).length !== 1)
      return null;
    values[name] = value;
  }
  return values;
}

export async function createDiscussion(
  _previous: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const token = await sessionToken();
  if (!token)
    return {
      error: "Connectez-vous pour publier. Votre texte est conservé.",
      signIn: true,
    };
  const data = textFields(formData, ["title", "content", "type", "category"]);
  if (!data)
    return {
      error:
        "Le formulaire est invalide. Vérifiez les champs avant de publier.",
    };
  let discussion: Discussion;
  try {
    const result = await strapiRequest<Item<Discussion>>("/discussions", {
      method: "POST",
      token,
      body: { data },
    });
    discussion = result.data;
  } catch (error) {
    return publishError(error);
  }
  revalidatePath("/");
  redirect(discussionHref(discussion.documentId));
}

export async function createReply(
  documentId: string,
  _previous: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const token = await sessionToken();
  if (!token)
    return {
      error: "Connectez-vous pour répondre. Votre texte est conservé.",
      signIn: true,
    };
  if (!/^[a-z0-9]{24}$/.test(documentId))
    return { error: "Cette discussion est introuvable." };
  const data = textFields(formData, ["content"]);
  if (!data)
    return { error: "Le formulaire est invalide. Vérifiez votre réponse." };
  let reply: Reply;
  try {
    const result = await strapiRequest<Item<Reply>>(
      `/discussions/${documentId}/replies`,
      { method: "POST", token, body: { data } },
    );
    reply = result.data;
  } catch (error) {
    return publishError(error);
  }
  revalidatePath("/");
  revalidatePath(discussionHref(documentId));
  redirect(`${discussionHref(documentId)}?page=last#reply-${reply.documentId}`);
}
