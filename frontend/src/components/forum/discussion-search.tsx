"use client";

import Form from "next/form";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  FormField,
  fieldDescription,
  formControlClassName,
} from "@/components/ui/form-field";
import { feedHref, type FeedQuery } from "@/lib/forum/query";
import { useFormValidation } from "@/lib/use-form-validation";

const rules = {
  q: (value: string) =>
    value.length > 200 ? "Ne dépassez pas 200 caractères." : undefined,
};
const initialState = { error: null };

export default function DiscussionSearch({
  query,
  total,
}: {
  query: FeedQuery;
  total: number;
}) {
  const validation = useFormValidation(rules, initialState, {
    q: "discussion-search",
  });
  const error = validation.errors.q;
  return (
    <div className="flex flex-col gap-2.5">
      <Form
        action="/"
        role="search"
        aria-label="Rechercher des discussions"
        noValidate
        onSubmit={validation.submit}
      >
        {query.category && (
          <input type="hidden" name="category" value={query.category} />
        )}
        {query.sort === "oldest" && (
          <input type="hidden" name="sort" value={query.sort} />
        )}
        {query.view && <input type="hidden" name="view" value={query.view} />}
        <FormField
          id="discussion-search"
          label="Rechercher dans les discussions"
          error={error}
        >
          <div className="flex items-start gap-2">
            <input
              id="discussion-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ""}
              placeholder="Un mot ou une expression…"
              className={`${formControlClassName} h-10 text-sm`}
              aria-invalid={Boolean(error)}
              aria-describedby={fieldDescription("discussion-search", error)}
              onChange={(event) => validation.change("q", event.target.value)}
            />
            <Button type="submit" className="min-h-10 shrink-0">
              Rechercher
            </Button>
          </div>
        </FormField>
      </Form>
      {query.q && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p role="status" className="min-w-0 text-secondary wrap-anywhere">
            {total} résultat{total === 1 ? "" : "s"} pour « {query.q} »
          </p>
          <ButtonLink
            variant="quiet"
            href={feedHref({ ...query, q: undefined, page: 1 })}
          >
            Effacer la recherche
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
