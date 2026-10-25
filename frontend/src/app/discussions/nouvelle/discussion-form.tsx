"use client";

import { useActionState, useState } from "react";
import { createDiscussion } from "@/app/actions/publish";
import PublishError from "@/components/forum/publish-error";
import { Button } from "@/components/ui/button";
import { FormField, formControlClassName } from "@/components/ui/form-field";
import type { Category, PublishState } from "@/lib/forum/types";

export default function DiscussionForm({
  categories,
}: {
  categories: Pick<Category, "documentId" | "name">[];
}) {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    createDiscussion,
    { error: null },
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("question");
  return (
    <form
      action={action}
      className="mt-[26px] flex flex-col gap-[22px]"
      aria-describedby={state.error ? "publish-error" : undefined}
    >
      <fieldset disabled={pending} className="space-y-6">
        <legend className="sr-only">Créer une discussion</legend>
        <FormField
          id="title"
          label="Titre de votre publication"
          hint="Un titre précis, entre 10 et 255 caractères."
        >
          <input
            id="title"
            name="title"
            className={formControlClassName}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={10}
            maxLength={255}
            required
            aria-invalid={state.field === "title" || undefined}
            aria-describedby="title-help"
            placeholder="Ex. : Comment répartir mon épargne cette année ?"
          />
        </FormField>
        <div className="grid gap-[18px] md:grid-cols-2">
          <FormField id="category" label="Espace">
            <select
              id="category"
              name="category"
              className={formControlClassName}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              aria-invalid={state.field === "category" || undefined}
            >
              <option value="" disabled>
                Choisir un espace
              </option>
              {categories.map((item) => (
                <option key={item.documentId} value={item.documentId}>
                  {item.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="type" label="Type de publication">
            <select
              id="type"
              name="type"
              className={formControlClassName}
              value={type}
              onChange={(event) => setType(event.target.value)}
              required
              aria-invalid={state.field === "type" || undefined}
            >
              <option value="question">Question</option>
              <option value="discussion">Discussion</option>
            </select>
          </FormField>
        </div>
        <FormField
          id="content"
          label="Votre message"
          hint="Contenu obligatoire · 50 000 caractères maximum · Texte simple."
        >
          <textarea
            id="content"
            name="content"
            className={`${formControlClassName} resize-y leading-relaxed`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={10}
            maxLength={50_000}
            required
            aria-invalid={state.field === "content" || undefined}
            aria-describedby="content-help"
            placeholder="Donnez le contexte et partagez votre question ou votre expérience…"
          />
        </FormField>
      </fieldset>
      <PublishError state={state} returnTo="/discussions/nouvelle" />
      <div className="flex flex-wrap items-center justify-between gap-[15px] border-t border-border pt-5">
        <p className="text-sm text-muted">
          Votre publication sera visible par tous.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Publication…" : "Publier ma discussion"}
        </Button>
      </div>
    </form>
  );
}
