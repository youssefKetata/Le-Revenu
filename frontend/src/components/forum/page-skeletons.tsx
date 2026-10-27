import PageContainer from "@/components/layout/page-container";
import Card from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton";

function TextLines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={index === lines - 1 ? "h-3.5 w-2/3" : "h-3.5 w-full"} />
      ))}
    </div>
  );
}

function CategoryNavSkeleton() {
  return (
    <div aria-hidden="true" className="hidden flex-col gap-0.5 md:flex">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-[11px] px-2.5 py-[7px]">
          <Skeleton className="size-5 shrink-0" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
      <Skeleton className="mt-[18px] mb-1.5 ml-2.5 h-4 w-14" />
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-[11px] px-2.5 py-[7px]">
          <Skeleton className="size-5 shrink-0" />
          <Skeleton className={`h-4 ${index % 2 ? "w-24" : "w-20"}`} />
        </div>
      ))}
      <div className="mt-[18px] border-t border-hairline px-2.5 pt-3">
        <Skeleton className="h-3.5 w-36" />
      </div>
    </div>
  );
}

function AuthorSkeleton() {
  return (
    <div className="flex items-center gap-[11px]">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function SidebarCardsSkeleton() {
  return (
    <aside aria-hidden="true" className="flex flex-col gap-[18px] md:col-start-2 wide:col-start-auto">
      <Card>
        <Skeleton className="mb-3 h-5 w-3/4" />
        <TextLines lines={2} />
        <div className="my-4 space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex gap-2">
              <Skeleton className="size-4 shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-[10px]" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-4 w-32" />
        <TextLines />
        <Skeleton className="mt-4 h-3.5 w-24" />
      </Card>
    </aside>
  );
}

export function FeedSkeleton() {
  return (
    <PageContainer width="community" className="grid items-start gap-[18px] md:grid-cols-[200px_minmax(0,1fr)] md:gap-7 wide:grid-cols-[212px_minmax(0,1fr)_304px]">
      <span role="status" className="sr-only">Chargement des discussions…</span>
      <CategoryNavSkeleton />
      <div aria-hidden="true" className="flex min-w-0 flex-col gap-[18px]">
        <div className="grid gap-x-6 gap-y-[18px] rounded-2xl border border-hairline bg-surface px-5 py-[22px] shadow-card md:grid-cols-[minmax(0,1fr)_auto] md:px-7 md:pt-7 md:pb-6">
          <div>
            <div className="mb-3 space-y-2">
              <Skeleton className="h-7 w-5/6 md:h-8" />
              <Skeleton className="h-7 w-2/3 md:h-8" />
            </div>
            <TextLines />
            <div className="mt-4 flex gap-6">
              <Skeleton className="h-11 w-20" />
              <Skeleton className="h-11 w-16" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-end md:flex-col">
            <Skeleton className="h-9 w-48 rounded-[10px]" />
            <Skeleton className="h-9 w-48 rounded-[10px]" />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] border border-hairline bg-surface px-2.5 py-2 shadow-card md:px-3 md:py-2.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <Skeleton className="h-10 min-w-0 flex-1 rounded-[10px]" />
          <Skeleton className="hidden h-8 w-44 md:block" />
        </div>
        <div className="flex gap-2 overflow-hidden md:hidden">
          {["w-14", "w-20", "w-20", "w-24"].map((width, index) => (
            <Skeleton key={index} className={`h-9 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-10 min-w-0 flex-1 rounded-[9px]" />
            <Skeleton className="h-10 w-28 rounded-[10px]" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-56 rounded-[10px]" />
          <Skeleton className="h-9 w-[72px] shrink-0 rounded-[10px]" />
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-[14px] border border-hairline bg-surface shadow-card">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid gap-2 px-4 py-3.5 md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4">
              <Skeleton className="hidden h-[58px] w-[62px] rounded-[9px] md:block" />
              <div className="min-w-0 space-y-2.5">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-5 w-11/12" />
                <TextLines lines={2} />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-[22px] rounded-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SidebarCardsSkeleton />
    </PageContainer>
  );
}

export function DiscussionSkeleton() {
  return (
    <PageContainer width="discussion" className="grid items-start gap-[18px] md:grid-cols-[200px_minmax(0,1fr)] md:gap-7 wide:grid-cols-[212px_minmax(0,1fr)_304px]">
      <span role="status" className="sr-only">Chargement de la discussion et des réponses…</span>
      <CategoryNavSkeleton />
      <div aria-hidden="true" className="flex min-w-0 flex-col gap-[18px]">
        <Skeleton className="h-5 w-40" />
        <Card padding="none" className="space-y-4 p-4 md:px-[22px] md:py-5">
          <Skeleton className="h-5 w-36 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-full md:h-8" />
            <Skeleton className="h-7 w-2/3 md:h-8" />
          </div>
          <AuthorSkeleton />
          <div className="space-y-6 py-1">
            <TextLines />
            <TextLines lines={2} />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28 rounded-[10px]" />
            <Skeleton className="h-9 w-28 rounded-[10px]" />
          </div>
        </Card>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 2 }, (_, index) => (
            <Card key={index} padding="none" className="space-y-4 px-4 py-4 md:px-5">
              <AuthorSkeleton />
              <TextLines />
              <Skeleton className="h-8 w-28" />
            </Card>
          ))}
          <Card className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-20 w-full rounded-[9px]" />
            <Skeleton className="ml-auto h-9 w-28 rounded-[10px]" />
          </Card>
        </div>
      </div>
      <aside aria-hidden="true" className="flex flex-col gap-[18px] md:col-start-2 wide:col-start-auto">
        <Card className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-3 w-36" />
          <div className="flex -space-x-1">
            <Skeleton className="size-[30px] rounded-full" />
            <Skeleton className="size-[30px] rounded-full" />
          </div>
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <TextLines />
          <Skeleton className="h-9 w-44 rounded-[10px]" />
        </Card>
      </aside>
    </PageContainer>
  );
}

export function SpacesSkeleton() {
  return (
    <PageContainer width="community" className="grid items-start gap-7 md:grid-cols-[212px_minmax(0,1fr)]">
      <span role="status" className="sr-only">Chargement des espaces…</span>
      <CategoryNavSkeleton />
      <div aria-hidden="true" className="min-w-0 space-y-[18px]">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="grid gap-4 min-[600px]:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="mt-3 mb-3 h-6 w-32" />
              <TextLines lines={2} />
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export function CharterSkeleton() {
  return (
    <PageContainer width="community" className="grid items-start gap-7 md:grid-cols-[212px_minmax(0,1fr)]">
      <span role="status" className="sr-only">Chargement de la charte…</span>
      <CategoryNavSkeleton />
      <div aria-hidden="true" className="min-w-0">
        <Skeleton className="h-8 w-4/5 max-w-96" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        <div className="mt-6 space-y-5">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-3 pt-1">
                <Skeleton className="h-4 w-48 max-w-full" />
                <TextLines lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
