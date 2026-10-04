import Link from "next/link";

export function KnowledgeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="border-b border-black/[0.06] bg-white/90">
        <div className="container-page flex h-[74px] items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NuvoRate — strona główna">
            <img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-10 w-10 shrink-0 rounded-xl object-contain" />
            <span className="text-[19px] font-bold tracking-[-0.04em]">NuvoRate</span>
          </Link>
          <Link href="/wiedza" className="text-sm font-medium text-black/60 transition hover:text-brand">Centrum wiedzy</Link>
        </div>
      </header>
      {children}
      <footer className="bg-ink py-10 text-white">
        <div className="container-page flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="text-lg font-bold tracking-[-0.04em]">NuvoRate</Link>
            <p className="mt-3 max-w-lg text-xs leading-5 text-white/55">NuvoRate to platforma SaaS do zarządzania opiniami Google i reputacją lokalnych firm. Usługa jest świadczona przez CONNECTON sp. z o.o.</p>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm text-white/65" aria-label="Nawigacja stopki">
            <Link href="/wiedza" className="hover:text-white">Centrum wiedzy</Link>
            <Link href="/terms" className="hover:text-white">Regulamin</Link>
            <Link href="/privacy" className="hover:text-white">Prywatność</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
