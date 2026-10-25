import PageContainer from "@/components/layout/page-container";
import Card from "@/components/ui/card";

export default function Loading() {
  return (
    <PageContainer>
      <div role="status" aria-live="polite">
        <Card>
          <p className="font-serif text-2xl font-bold">
            Chargement de la communauté…
          </p>
          <p className="mt-3 text-muted">Les discussions arrivent.</p>
          <div className="mt-6 h-2.5 rounded-md bg-border" aria-hidden="true" />
        </Card>
      </div>
    </PageContainer>
  );
}
