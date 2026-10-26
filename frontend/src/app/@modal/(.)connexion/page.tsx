import Modal from "@/components/layout/modal";
import LoginContent from "@/app/connexion/login-content";
import type { SearchParams } from "@/lib/forum/query";

export default function LoginModal(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Modal title="Connexion à la communauté" narrow>
      <LoginContent {...props} />
    </Modal>
  );
}
