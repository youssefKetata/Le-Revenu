import PageContainer from "@/components/layout/page-container";
import { LoginSkeleton } from "@/components/layout/form-skeletons";

export default function Loading() {
  return (
    <PageContainer width="login">
      <LoginSkeleton />
    </PageContainer>
  );
}
