import FormPanel from "./form-panel";
import Skeleton from "@/components/ui/skeleton";

function FieldSkeleton({ multiline = false, hint = false }: { multiline?: boolean; hint?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-5 w-24" />
      <Skeleton className={`${multiline ? "h-[120px]" : "h-10"} w-full rounded-[9px]`} />
      {hint && <Skeleton className="h-4 w-3/4" />}
    </div>
  );
}

export function LoginSkeleton() {
  return (
    <FormPanel title="Rejoindre la communauté">
      <span role="status" className="sr-only">Chargement du formulaire de connexion…</span>
      <div aria-hidden="true" className="px-4 pt-4 pb-[22px] md:px-[22px]">
        <div className="space-y-[7px]">
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-[9px] border border-border bg-surface-muted px-3.5 py-3">
          <Skeleton className="size-[38px] shrink-0 rounded-[9px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        </div>
        <div className="mt-3.5 space-y-3.5">
          <FieldSkeleton />
          <FieldSkeleton />
          <Skeleton className="h-9 w-full rounded-[10px]" />
        </div>
      </div>
    </FormPanel>
  );
}

export function DiscussionFormSkeleton() {
  return (
    <FormPanel title="Nouvelle publication">
      <span role="status" className="sr-only">Chargement du formulaire de publication…</span>
      <div aria-hidden="true">
        <div className="space-y-4 px-4 pt-4 pb-[22px] md:px-[22px]">
          <div className="grid gap-2.5 md:grid-cols-2">
            {[0, 1].map((index) => (
              <div key={index} className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-[11px] md:flex-col md:items-start md:gap-2 md:py-3.5">
                <Skeleton className="size-[22px] shrink-0" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="hidden h-3.5 w-full md:block" />
              </div>
            ))}
          </div>
          <FieldSkeleton hint />
          <FieldSkeleton />
          <FieldSkeleton multiline hint />
          <Skeleton className="h-10 w-full rounded-[9px]" />
        </div>
        <div className="flex items-center justify-between gap-2.5 border-t border-hairline px-4 py-3.5 md:px-[22px]">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-9 w-24 rounded-[10px]" />
        </div>
      </div>
    </FormPanel>
  );
}
