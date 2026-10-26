import PageContainer from "@/components/layout/page-container";
import type { SearchParams } from "@/lib/forum/query";
import NewDiscussionContent from "./new-discussion-content";

export const metadata = {
  title: "Nouvelle publication — Communauté Le Revenu",
};
export default function NewDiscussionPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <PageContainer>
      <NewDiscussionContent {...props} />
    </PageContainer>
  );
}
