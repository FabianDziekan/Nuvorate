import Link from "next/link";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

const legalLinks = [
  { href: "/privacy", label: "Polityka prywatności" },
  { href: "/terms", label: "Regulamin" },
  { href: "/cookies", label: "Polityka cookies" },
];

function LegalLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NuvoRate — strona główna">
      <img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-10 w-10 shrink-0 rounded-xl object-contain" />
      <span className={`text-[19px] font-bold tracking-[-0.04em] ${inverse ? "text-white" : "text-ink"}`}>NuvoRate</span>
    </Link>
  );
}

export function LegalDocument({ eyebrow, title, intro, sections }: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
        <div className="container-page flex h-[74px] items-center justify-between">
          <LegalLogo />
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm font-semibold text-black/55 transition hover:text-ink sm:inline-flex">Strona główna</Link>
            <Link href="/login" className="button-secondary min-h-10 px-4 py-2 text-sm">Zaloguj się</Link>
          </div>
        </div>
      </header>

      <main className="container-page py-12 sm:py-16 lg:py-20">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">{intro}</p>
          <p className="mt-5 text-sm font-medium text-black/45">Data wejścia w życie: 21 sierpnia 2026</p>

          <div className="mt-10 space-y-8 sm:mt-12">
            {sections.map((section, index) => (
              <section key={section.title} className="rounded-[24px] border border-black/[0.07] bg-[#FAFAFC] p-6 sm:p-7">
                <h2 className="text-xl font-semibold tracking-[-0.025em] text-ink"><span className="mr-2 text-brand">{index + 1}.</span>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-sm leading-6 text-black/60 sm:text-base sm:leading-7">{paragraph}</p>
                ))}
                {section.items ? (
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-black/60 sm:text-base sm:leading-7">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>{item}</span></li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </main>

      <footer className="bg-ink py-10 text-white">
        <div className="container-page flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div><LegalLogo inverse /><p className="mt-4 text-xs text-white/40">© 2026 NuvoRate. Wszelkie prawa zastrzeżone.</p></div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55" aria-label="Dokumenty prawne">
            {legalLinks.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>)}
          </nav>
        </div>
      </footer>
    </div>
  );
}
