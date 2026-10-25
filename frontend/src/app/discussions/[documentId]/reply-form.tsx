"use client";

import { useActionState, useState } from "react";
import { createReply } from "@/app/actions/publish";
import PublishError from "@/components/forum/publish-error";
import { Button } from "@/components/ui/button";
import { FormField, formControlClassName } from "@/components/ui/form-field";
import { discussionHref } from "@/lib/forum/query";
import type { PublishState } from "@/lib/forum/types";

export default function ReplyForm({
  documentId,
  username,
}: {
  documentId: string;
  username: string;
}) {
  const [content, setContent] = useState("");
  const [state, action, pending] = useActionState<PublishState, FormData>(
    createReply.bind(null, documentId),
    { error: null },
  );
  return (
    <form
      action={action}
      className="mt-[26px] flex flex-col gap-[22px]"
      aria-describedby={state.error ? "publish-error" : undefined}
    >
      <p className="text-sm text-muted">
        Répondre en tant que <strong>{username}</strong>
      </p>
      <FormField
        id="reply-content"
        label="Votre réponse"
        hint="10 000 caractères maximum. Votre réponse est publiée immédiatement."
      >
        <textarea
          id="reply-content"
          name="content"
          className={`${formControlClassName} resize-y leading-relaxed`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={pending}
          rows={5}
          required
          maxLength={10_000}
          aria-invalid={state.field === "content" || undefined}
          aria-describedby="reply-content-help"
          placeholder="Partagez votre expérience avec la communauté…"
        />
      </FormField>
      <PublishError
        state={state}
        returnTo={`${discussionHref(documentId)}#replies`}
      />
      <div className="flex flex-wrap items-center justify-between gap-[15px] border-t border-border pt-5">
        <p className="text-sm text-muted">
          Merci de rester courtois et constructif.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Publication…" : "Publier ma réponse"}
        </Button>
      </div>
    </form>
  );
}
