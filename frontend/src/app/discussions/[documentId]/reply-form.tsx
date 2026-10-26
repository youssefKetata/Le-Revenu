"use client";

import { useActionState, useState } from "react";
import { createReply } from "@/app/actions/publish";
import PublishError from "@/components/forum/publish-error";
import { Button } from "@/components/ui/button";
import {
  FormField,
  fieldDescription,
  formControlClassName,
  submitOnShortcut,
} from "@/components/ui/form-field";
import { Avatar } from "@/components/forum/byline";
import { discussionHref } from "@/lib/forum/query";
import type { PublishState } from "@/lib/forum/types";
import { textError } from "@/lib/form-validation";
import { useFormValidation } from "@/lib/use-form-validation";

const rules = { content: (value: string) => textError(value, 1, 10_000) };

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
  const validation = useFormValidation(rules, state, { content: "reply-content" });
  const { errors } = validation;
  return (
    <form
      action={action}
      noValidate
      onSubmit={validation.submit}
      className="flex flex-col gap-2.5 px-4 py-4 md:px-5"
      aria-describedby={validation.formError ? "publish-error" : undefined}
    >
      <div className="flex items-center gap-[11px]">
        <Avatar name={username} size="sm" />
        <p className="text-[12.5px] text-muted">
          Répondre en tant que{" "}
          <strong className="text-foreground">{username}</strong>
        </p>
      </div>
      <FormField
        id="reply-content"
        label="Votre réponse"
        labelHidden
        hint="10 000 caractères maximum. Votre réponse est publiée immédiatement."
        error={errors.content}
      >
        <textarea
          id="reply-content"
          name="content"
          className={`${formControlClassName} min-h-[110px] resize-y leading-normal`}
          value={content}
          onChange={(event) => {
            setContent(event.currentTarget.value);
            validation.change("content", event.currentTarget.value);
          }}
          onKeyDown={submitOnShortcut}
          disabled={pending}
          rows={4}
          aria-required="true"
          aria-invalid={!!errors.content}
          aria-describedby={fieldDescription("reply-content", errors.content, true)}
          placeholder="Partagez votre expérience avec la communauté…"
        />
      </FormField>
      <PublishError
        state={{ ...state, error: validation.formError }}
        returnTo={`${discussionHref(documentId)}#replies`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p className="text-[12.5px] text-muted">Ctrl/⌘ + Entrée pour publier</p>
        <Button type="submit" disabled={pending}>
          {pending ? "Publication…" : "Publier ma réponse"}
        </Button>
      </div>
    </form>
  );
}
