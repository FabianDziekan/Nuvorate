import type { Metadata } from "next";
import Link from "next/link";
import { KnowledgeShell } from "@/components/knowledge/knowledge-shell";

const title = "Centrum wiedzy NuvoRate";
const description = "Praktyczne materiały o opiniach Google i reputacji lokalnych firm: zbieraniu autentycznych recenzji, odpowiadaniu na nie i analizowaniu opinii.";
const articlePath = "/wiedza/jak-zdobyc-wiecej-opinii-google";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/wiedza" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "/wiedza", title, description },
};

export default function KnowledgePage() {
  return (
    <KnowledgeShell>
      <main className="container-page py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">Wiedza dla lokalnych firm</p>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">Centrum wiedzy NuvoRate</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">Praktyczne materiały o opiniach Google i reputacji lokalnych firm. Pokazujemy, jak zbierać autentyczne opinie, odpowiadać na recenzje i analizować informacje od klientów.</p>
          <section className="mt-14 border-t border-black/10 pt-8 sm:mt-20" aria-label="Artykuły">
            <Link href={articlePath} className="group block rounded-[28px] border border-black/[0.08] bg-[#FAFAFC] p-7 shadow-card transition hover:border-brand/35 sm:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Poradnik</span>
              <h2 className="mt-4 max-w-2xl text-balance text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Jak zdobyć więcej opinii Google? Praktyczny poradnik dla lokalnych firm</h2>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand">Czytaj artykuł <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span></span>
            </Link>
          </section>
        </div>
      </main>
    </KnowledgeShell>
  );
}
