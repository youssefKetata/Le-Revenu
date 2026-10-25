export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1 bg-[#eb0f0f] p-1 text-xl font-black tracking-tight text-white">
          <span className="bg-black px-1">LE</span>
          <span className="pr-1">REVENU</span>
        </span>
        <span className="text-sm font-semibold text-neutral-600">Communauté</span>
      </div>
      <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-4 text-sm font-semibold text-[#eb0f0f]">Bientôt ici</p>
        <h1 className="font-serif text-4xl leading-tight font-bold sm:text-5xl">
          Un espace pour échanger et partager vos expériences.
        </h1>
        <p className="mt-6 max-w-xl leading-7 text-neutral-600">
          Questions d’épargne, placements, retraite : la communauté des lecteurs
          du Revenu se prépare à vous accueillir.
        </p>
      </section>
    </main>
  );
}
