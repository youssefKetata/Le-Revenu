import PageContainer from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

export default function NotFound() {
  return (
    <PageContainer>
      <Notice title="Cette discussion est introuvable">
        <p>Elle a peut-être été supprimée ou le lien est incorrect.</p>
        <ButtonLink href="/" className="mt-5">
          Retour à la communauté
        </ButtonLink>
      </Notice>
    </PageContainer>
  );
}
