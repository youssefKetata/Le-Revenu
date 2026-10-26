import PageContainer from "@/components/layout/page-container";
import type { SearchParams } from "@/lib/forum/query";
import LoginContent from "./login-content";

export const metadata = { title: "Connexion — Communauté Le Revenu" };
export default function LoginPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <PageContainer width="login">
      <LoginContent {...props} />
    </PageContainer>
  );
}
