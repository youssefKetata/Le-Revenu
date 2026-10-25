import Link from "next/link";
import { loginHref } from "@/lib/forum/query";
import type { PublishState } from "@/lib/forum/types";

export default function PublishError({
  state,
  returnTo,
}: {
  state: PublishState;
  returnTo: string;
}) {
  if (!state.error) return null;
  return (
    <div
      id="publish-error"
      className="rounded-[9px] border border-red-200 bg-red-50 px-[15px] py-3 text-[13px] leading-relaxed text-red-800"
      role="alert"
    >
      <p>{state.error}</p>
      {state.signIn && (
        <Link
          className="mt-2 inline-block font-semibold underline"
          target="_blank"
          rel="noopener"
          href={loginHref(returnTo)}
        >
          Se reconnecter dans un nouvel onglet
        </Link>
      )}
    </div>
  );
}
