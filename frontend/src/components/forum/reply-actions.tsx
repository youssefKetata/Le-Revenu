"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setReplyUseful, updateReplyReaction } from "@/app/actions/reactions";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { discussionHref, loginHref } from "@/lib/forum/query";
import type { PublishState, Reply } from "@/lib/forum/types";
import UsefulVote from "./useful-vote";

function ReactionError({ state, discussionId }: { state: PublishState; discussionId: string }) {
  if (!state.error) return null;
  return (
    <div role="alert" className="text-sm text-brand-text">
      <p>{state.error}</p>
      {state.signIn && (
        <Link className="underline" href={loginHref(`${discussionHref(discussionId)}#replies`)}>
          Se reconnecter
        </Link>
      )}
    </div>
  );
}

export function ClearBestAnswer({ discussionId, replyId, page }: { discussionId: string; replyId: string; page: number }) {
  const [state, action, pending] = useActionState(
    updateReplyReaction.bind(null, discussionId, replyId, page), { error: null },
  );
  return (
    <div className="mt-3 space-y-2">
      <form action={action} noValidate>
        <Button type="submit" variant="quiet" name="intent" value="clear" disabled={pending}>
          {pending ? "Enregistrement…" : "Retirer la meilleure réponse"}
        </Button>
      </form>
      <ReactionError state={state} discussionId={discussionId} />
    </div>
  );
}

export default function ReplyActions({
  discussionId, reply, signedIn, ownReply, canChoose, selected, page,
}: {
  discussionId: string;
  reply: Reply;
  signedIn: boolean;
  ownReply: boolean;
  canChoose: boolean;
  selected: boolean;
  page: number;
}) {
  const [state, action, pending] = useActionState(
    updateReplyReaction.bind(null, discussionId, reply.documentId, page),
    { error: null },
  );
  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        {signedIn && !ownReply ? (
          <UsefulVote
            vote={{ hasVoted: reply.hasVoted, usefulCount: reply.usefulCount }}
            save={setReplyUseful.bind(null, discussionId, reply.documentId)}
            action={action}
            signInHref={loginHref(`${discussionHref(discussionId)}#replies`)}
            disabled={pending}
          />
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm text-success">
            <Icon name="thumb" /> Utile ({reply.usefulCount})
          </span>
        )}
        {canChoose && !ownReply && (
          <form action={action} noValidate>
            <Button type="submit" variant="quiet" name="intent" value={selected ? "clear" : "accept"}
              disabled={pending} aria-pressed={selected}>
              <Icon name="check" />
              {selected ? "Retirer la meilleure réponse" : "Choisir comme meilleure réponse"}
            </Button>
          </form>
        )}
        {!signedIn && (
          <Link className="text-sm text-secondary underline hover:text-foreground"
            href={loginHref(`${discussionHref(discussionId)}#replies`)}>
            Se connecter pour voter
          </Link>
        )}
        {pending && <span role="status" className="text-xs text-muted">Enregistrement…</span>}
      </div>
      <ReactionError state={state} discussionId={discussionId} />
    </div>
  );
}
