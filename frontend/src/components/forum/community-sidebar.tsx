import Card from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { discussionHref } from "@/lib/forum/query";
import type { DiscussionSummary } from "@/lib/forum/types";
import Link from "next/link";

export default function CommunitySidebar({
  isMember,
  question,
}: {
  isMember: boolean;
  question?: DiscussionSummary;
}) {
  return (
    <aside className="flex flex-col gap-[18px] md:col-start-2 wide:col-start-auto">
      {!isMember && (
        <Card>
          <h2 className="mb-1.5 font-serif text-[19px] font-bold tracking-[-.01em]">
            Rejoignez la communauté
          </h2>
          <p className="text-sm text-secondary">
            Partagez votre expérience avec les lecteurs du Revenu.
          </p>
          <ul className="mt-2.5 mb-3.5 space-y-1.5 text-sm text-secondary">
            {[
              "Posez vos questions d’argent aux lecteurs",
              "Échangez dans les espaces qui vous intéressent",
              "Aidez les autres en partageant votre expérience",
            ].map((text) => (
              <li key={text} className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 size-4 text-brand-text" />
                {text}
              </li>
            ))}
          </ul>
          <ButtonLink href="/connexion" className="w-full">
            Rejoindre la communauté
          </ButtonLink>
        </Card>
      )}
      {question && (
        <Card className="hidden md:block">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-text">
            <Icon name="help" className="size-4" />
            Une question vous attend
          </p>
          <h2 className="font-serif text-[19px] leading-snug font-bold">
            <Link href={discussionHref(question.documentId)}>
              {question.title}
            </Link>
          </h2>
          <p className="mt-2.5 text-[13px] text-muted">
            {question.replyCount} réponses
          </p>
          <ButtonLink
            variant="secondary"
            href={`${discussionHref(question.documentId)}#replies`}
            className="mt-3"
          >
            Je réponds
          </ButtonLink>
        </Card>
      )}
      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
          <Icon name="book" className="text-brand-text" />
          Les bons réflexes
        </h2>
        <p className="text-sm leading-6 text-secondary">
          On débat des idées, jamais des personnes. Les débutants sont les
          bienvenus : aucune question n’est bête.
        </p>
        <Link
          href="/charte"
          className="mt-3 inline-block text-[13px] font-semibold text-brand-text hover:underline"
        >
          Lire la charte
        </Link>
      </Card>
    </aside>
  );
}
