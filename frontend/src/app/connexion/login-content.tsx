import { redirect } from "next/navigation";
import FormPanel from "@/components/layout/form-panel";
import Icon from "@/components/ui/icon";
import { getSession } from "@/lib/session";
import { safeReturnTo, type SearchParams } from "@/lib/forum/query";
import LoginForm from "./login-form";

export default async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  const session = await getSession();
  if (session.member) redirect(returnTo);
  return (
    <>
      <FormPanel title="Rejoindre la communauté">
        <div className="px-4 pt-4 pb-[22px] md:px-[22px]">
          <h2 className="sr-only">Connexion</h2>
          <ul className="space-y-[7px] text-sm text-secondary">
            {[
              "Posez vos questions d’argent aux lecteurs",
              "Partagez vos expériences avec la communauté",
            ].map((text) => (
              <li key={text} className="flex gap-2">
                <Icon name="check" className="mt-0.5 size-4 text-success" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 rounded-[9px] border border-border bg-surface-muted px-3.5 py-3">
            <span
              aria-hidden="true"
              className="grid size-[38px] shrink-0 place-items-center rounded-[9px] bg-brand text-xl font-black text-white"
            >
              R
            </span>
            <div>
              <p className="font-semibold">Votre compte de la communauté</p>
              <p className="text-[12.5px] text-muted">
                Connectez-vous pour participer aux échanges.
              </p>
            </div>
          </div>
          <LoginForm returnTo={returnTo} />
        </div>
      </FormPanel>
    </>
  );
}
