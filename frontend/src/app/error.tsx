"use client";

import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PageContainer>
      <Card className="py-9 text-center">
        <h1 className="font-serif text-2xl font-bold">
          La page n’a pas pu être affichée
        </h1>
        <p className="mt-3 text-muted">Réessayez dans quelques instants.</p>
        <Button className="mt-5" onClick={reset}>
          Réessayer
        </Button>
      </Card>
    </PageContainer>
  );
}
