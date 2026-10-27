import PageContainer from "@/components/layout/page-container";
import { DiscussionFormSkeleton } from "@/components/layout/form-skeletons";

export default function Loading() {
  return (
    <PageContainer>
      <DiscussionFormSkeleton />
    </PageContainer>
  );
}
