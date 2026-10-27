import { Suspense } from "react";
import Modal from "@/components/layout/modal";
import { DiscussionFormSkeleton } from "@/components/layout/form-skeletons";
import NewDiscussionContent from "@/app/discussions/nouvelle/new-discussion-content";
import type { SearchParams } from "@/lib/forum/query";

export default function PublishModal(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Modal title="Nouvelle publication">
      <Suspense fallback={<DiscussionFormSkeleton />}>
        <NewDiscussionContent {...props} />
      </Suspense>
    </Modal>
  );
}
