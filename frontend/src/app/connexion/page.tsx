import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";
import { safeReturnTo, type SearchParams } from "@/lib/forum/query";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  const session = await getSession();
  if (session.member) redirect(returnTo);

  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-lg flex-col px-6 py-12 sm:py-20"
    >
      <Link
        href="/"
        className="mb-6 w-fit text-sm underline underline-offset-4"
      >
        ← Retour à la communauté
      </Link>
      <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-3xl font-bold">Connexion</h1>
        <p className="mt-3 leading-6 text-neutral-600">
          Connectez-vous pour participer aux discussions de la communauté Le
          Revenu.
        </p>
        <LoginForm returnTo={returnTo} />
      </section>
    </main>
  );
}
