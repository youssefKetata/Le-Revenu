"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createDiscussion } from "@/app/actions/publish";
import PublishError from "@/components/forum/publish-error";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FieldError,
  fieldDescription,
  formControlClassName,
  submitOnShortcut,
} from "@/components/ui/form-field";
import type { Category, PublishState } from "@/lib/forum/types";
import { textError } from "@/lib/form-validation";
import { useFormValidation } from "@/lib/use-form-validation";

const types = [
  {
    value: "question",
    icon: "help",
    label: "Poser une question",
    help: "Obtenez l’aide des membres de la communauté",
  },
  {
    value: "discussion",
    icon: "msg",
    label: "Lancer une discussion",
    help: "Partagez une expérience, un avis, une actualité",
  },
] as const;

export default function DiscussionForm({
  categories,
  initialType = "question",
  initialCategory = "",
}: {
  categories: Pick<Category, "documentId" | "name">[];
  initialType?: "question" | "discussion";
  initialCategory?: string;
}) {
  const [state, action, pending] = useActionState<PublishState, FormData>(
    createDiscussion,
    { error: null },
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState(initialType);
  const validation = useFormValidation(
    {
      type: (value) =>
        value === "question" || value === "discussion"
          ? undefined
          : "Choisissez Question ou Discussion.",
      title: (value) => textError(value, 10, 255),
      category: (value) =>
        categories.some((item) => item.documentId === value)
          ? undefined
          : "Choisissez un espace.",
      content: (value) => textError(value, 1, 50_000),
    },
    state,
    { type: "type-question" },
  );
  const { errors } = validation;
  return (
    <form
      action={action}
      noValidate
      aria-describedby={validation.formError ? "publish-error" : undefined}
      onSubmit={validation.submit}
    >
      <div className="space-y-4 px-4 pt-4 pb-[22px] md:px-[22px]">
        <fieldset disabled={pending} className="space-y-3.5">
          <legend className="sr-only">Créer une discussion</legend>
          <fieldset
            className="grid gap-2.5 md:grid-cols-2"
            aria-invalid={!!errors.type}
            aria-describedby={fieldDescription("type", errors.type)}
          >
            <legend className="sr-only">Type de publication</legend>
            {types.map((item) => (
              <label
                key={item.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-[11px] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand md:flex-col md:items-start md:gap-1 md:py-3.5 ${type === item.value ? "border-brand bg-brand-soft" : "border-border hover:border-border-strong"}`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  id={`type-${item.value}`}
                  name="type"
                  value={item.value}
                  checked={type === item.value}
                  onChange={() => {
                    setType(item.value);
                    validation.change("type", item.value);
                  }}
                />
                <Icon
                  name={item.icon}
                  className="size-[22px] text-brand-text md:mb-1"
                />
                <strong className="text-[14.5px]">{item.label}</strong>
                <small className="hidden text-[12.5px] leading-snug text-muted md:block">
                  {item.help}
                </small>
              </label>
            ))}
          </fieldset>
          <FieldError id="type" error={errors.type} />
          <FormField
            id="title"
            label="Titre"
            hint="Un titre clair, entre 10 et 255 caractères, obtient plus vite des réponses."
            error={errors.title}
          >
            <input
              id="title"
              autoFocus
              name="title"
              className={`${formControlClassName} h-10`}
              value={title}
              onChange={(event) => {
                setTitle(event.currentTarget.value);
                validation.change("title", event.currentTarget.value);
              }}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={fieldDescription("title", errors.title, true)}
              placeholder={
                type === "question"
                  ? "Ex. : Faut-il ouvrir un PER à 45 ans ?"
                  : "Ex. : Mon retour d’expérience sur la renégociation de mon crédit"
              }
            />
          </FormField>
          <FormField id="category" label="Espace" error={errors.category}>
            <input type="hidden" name="category" value={category} />
            <Select
              value={category}
              onValueChange={(value) => {
                // Ignore empty native form-reset events; the draft is controlled.
                if (value) {
                  setCategory(value);
                  validation.change("category", value);
                }
              }}
              disabled={pending}
            >
              <SelectTrigger
                id="category"
                aria-required="true"
                aria-invalid={!!errors.category}
                aria-describedby={fieldDescription("category", errors.category)}
              >
                <SelectValue placeholder="Choisissez un espace…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.documentId} value={item.documentId}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="content"
            label="Détails"
            hint="Contenu obligatoire · 50 000 caractères maximum."
            error={errors.content}
          >
            <textarea
              id="content"
              name="content"
              className={`${formControlClassName} resize-y leading-normal`}
              value={content}
              onChange={(event) => {
                setContent(event.currentTarget.value);
                validation.change("content", event.currentTarget.value);
              }}
              onKeyDown={submitOnShortcut}
              rows={5}
              aria-required="true"
              aria-invalid={!!errors.content}
              aria-describedby={fieldDescription("content", errors.content, true)}
              placeholder="Votre situation, ce que vous avez déjà envisagé… Plus le contexte est précis, meilleures sont les réponses."
            />
          </FormField>
        </fieldset>
        <p className="rounded-[9px] bg-surface-muted px-3 py-2.5 text-[13px] text-secondary">
          Partagez votre expérience, sans sollicitation.{" "}
          <Link href="/charte" className="font-semibold text-brand-text">
            Lire la charte
          </Link>
        </p>
        <PublishError state={{ ...state, error: validation.formError }} returnTo="/discussions/nouvelle" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-hairline px-4 py-3.5 md:px-[22px]">
        <p className="text-[12.5px] text-muted">
          Votre publication sera visible par tous.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Publication…" : "Publier"}
        </Button>
      </div>
    </form>
  );
}
