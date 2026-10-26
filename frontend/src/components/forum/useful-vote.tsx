"use client";

import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { PublishState } from "@/lib/forum/types";

type Vote = { hasVoted: boolean; usefulCount: number };

export default function UsefulVote({
  vote, save, action, signInHref, disabled = false,
}: {
  vote: Vote;
  save: (useful: boolean) => Promise<PublishState>;
  action: (formData: FormData) => void;
  signInHref: string;
  disabled?: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(vote, (current, hasVoted: boolean) => ({
    hasVoted,
    // Revalidation may already include this vote; don't apply its increment twice.
    usefulCount: current.usefulCount + Number(hasVoted) - Number(current.hasVoted),
  }));
  const [state, setState] = useState<PublishState>({ error: null });
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || disabled) return;
    inFlight.current = true;
    const useful = !optimistic.hasVoted;
    setState({ error: null });
    startTransition(async () => {
      setOptimistic(useful);
      try {
        setState(await save(useful));
      } catch {
        setState({ error: "Votre vote n’a pas pu être confirmé. Actualisez la page avant de réessayer." });
      } finally {
        inFlight.current = false;
      }
    });
  }

  return (
    <div className="space-y-2">
      <form action={action} onSubmit={submit} noValidate>
        <Button
          type="submit"
          variant="quiet"
          name="intent"
          value={optimistic.hasVoted ? "unvote" : "vote"}
          disabled={pending || disabled}
          aria-pressed={optimistic.hasVoted}
          aria-busy={pending}
          aria-label={optimistic.hasVoted ? "Retirer mon vote Utile" : "Marquer cette réponse comme utile"}
          className={`text-success hover:bg-success/10 hover:text-success ${optimistic.hasVoted ? "bg-success/10" : ""}`}
        >
          <Icon name="thumb" /> Utile ({optimistic.usefulCount})
        </Button>
        <span role="status" className="sr-only">
          {pending ? "Enregistrement du vote…" : ""}
        </span>
      </form>
      {state.error && (
        <div role="alert" className="text-sm text-brand-text">
          <p>{state.error}</p>
          {state.signIn && <Link className="underline" href={signInHref}>Se reconnecter</Link>}
        </div>
      )}
    </div>
  );
}
