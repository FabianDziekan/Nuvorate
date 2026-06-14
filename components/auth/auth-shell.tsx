import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[0.88fr_1.12fr]">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(91,92,246,0.34),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(91,92,246,0.2),transparent_28%)]" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full border border-white/[0.07]" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full border border-white/[0.06]" />
        <div className="relative">
          <BrandLogo inverse />
        </div>
        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A6A7FF]">
            Reputacja pod kontrolą
          </span>
          <h2 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-[-0.05em] xl:text-6xl">
            Więcej opinii.
            <br />
            <span className="text-[#8F90FF]">Większe zaufanie.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/55">
            Monitoruj reputację, reaguj szybciej i rozwijaj firmę na podstawie
            prawdziwego głosu klientów.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            ["24", "nowe opinie"],
            ["4,7", "średnia ocena"],
            ["86%", "pozytywnych"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_70%_0%,rgba(91,92,246,0.08),transparent_55%)] lg:hidden" />
        <div className="relative w-full max-w-[470px]">
          <div className="mb-12 lg:hidden">
            <BrandLogo />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-black/55">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
