import Modal from "@/components/layout/modal";
import NewDiscussionContent from "@/app/discussions/nouvelle/new-discussion-content";
import type { SearchParams } from "@/lib/forum/query";

export default function PublishModal(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Modal title="Nouvelle publication">
      <NewDiscussionContent {...props} />
    </Modal>
  );
}
