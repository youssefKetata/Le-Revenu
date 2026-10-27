import { Suspense } from "react";
import Modal from "@/components/layout/modal";
import { LoginSkeleton } from "@/components/layout/form-skeletons";
import LoginContent from "@/app/connexion/login-content";
import type { SearchParams } from "@/lib/forum/query";

export default function LoginModal(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Modal title="Connexion à la communauté" narrow>
      <Suspense fallback={<LoginSkeleton />}>
        <LoginContent {...props} />
      </Suspense>
    </Modal>
  );
}
