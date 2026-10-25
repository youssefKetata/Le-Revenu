import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session.member) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-6 w-fit text-sm underline underline-offset-4">← Retour à la communauté</Link>
      <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-3xl font-bold">Connexion</h1>
        <p className="mt-3 leading-6 text-neutral-600">Connectez-vous pour participer aux discussions de la communauté Le Revenu.</p>
        <LoginForm />
      </section>
    </main>
  );
}
