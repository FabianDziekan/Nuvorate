"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DashboardDemo } from "@/components/dashboard/dashboard-demo";
import {
  billingCycles,
  pricingPlans,
  type BillingCycle,
} from "@/lib/pricing";
import {
  landingTranslations,
  type LandingTranslations,
} from "@/lib/landing-translations";

type IconName =
  | "arrow"
  | "chart"
  | "check"
  | "clock"
  | "close"
  | "data"
  | "menu"
  | "nfc"
  | "quote"
  | "search"
  | "shield"
  | "spark"
  | "star"
  | "trend";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    data: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    nfc: (
      <>
        <path d="M8.5 8.5a5 5 0 0 1 0 7" />
        <path d="M5.5 5.5a9 9 0 0 1 0 13" />
        <path d="M15.5 8.5a5 5 0 0 0 0 7" />
        <path d="M18.5 5.5a9 9 0 0 0 0 13" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
    quote: (
      <>
        <path d="M7 10h4v7H4v-4a6 6 0 0 1 6-6" />
        <path d="M17 10h4v7h-7v-4a6 6 0 0 1 6-6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" />
        <path d="m19 15 .6 2.1L22 18l-2.4.9L19 21l-.6-2.1L16 18l2.4-.9L19 15Z" />
        <path d="m5 13 .6 2.1L8 16l-2.4.9L5 19l-.6-2.1L2 16l2.4-.9L5 13Z" />
      </>
    ),
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    trend: (
      <>
        <path d="m4 17 6-6 4 4 6-8" />
        <path d="M15 7h5v5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#top" className="inline-flex items-center gap-2.5" aria-label="NuvoRate">
      <img
        src="/brand/nuvorate-logo.png"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-xl object-contain"
      />
      <span
        className={`text-[19px] font-bold tracking-[-0.04em] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        NuvoRate
      </span>
    </a>
  );
}

function Navbar({ t }: { t: LandingTranslations }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-[74px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t.aria.mainNav}>
          {t.nav.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-black/60 transition hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="px-3 text-sm font-semibold text-ink">
            {t.nav.login}
          </Link>
          <Link href="/register" className="button-primary min-h-10 px-5 py-2.5">
            {t.nav.register}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-full border border-black/10 lg:hidden"
          aria-expanded={open}
          aria-label={open ? t.aria.closeMenu : t.aria.openMenu}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <div className="border-t border-black/[0.06] bg-white px-5 pb-6 pt-4 shadow-card lg:hidden">
          <nav className="mx-auto flex max-w-[1240px] flex-col" aria-label={t.aria.mobileMenu}>
            {t.nav.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/[0.06] py-4 text-base font-medium"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link href="/login" className="button-secondary px-3">
                {t.nav.login}
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="button-primary px-3">
                {t.nav.register}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

const mockupMetricIcons: IconName[] = ["quote", "star", "trend", "nfc"];

function HeroProductPreview({ t }: { t: LandingTranslations["mockup"] }) {
  const [liveUpdate, setLiveUpdate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeout = window.setTimeout(() => setLiveUpdate(true), 1200);
    const interval = window.setInterval(() => setLiveUpdate((value) => !value), 6200);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const score = liveUpdate ? "92" : "91";
  const reviews = liveUpdate ? "49" : "48";

  return (
    <div className="hero-product-preview relative mx-auto w-full max-w-[720px]">
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#F7F7FA] p-2 shadow-soft">
        <div className="flex h-10 items-center justify-between rounded-[20px] border border-black/[0.06] bg-white px-4">
          <div className="flex items-center gap-2">
            <img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-5 w-5 rounded-md object-contain" />
            <span className="text-[11px] font-semibold text-ink">NuvoRate</span>
            <span className="ml-2 text-[10px] text-black/35">centrum reputacji</span>
          </div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[9px] font-semibold text-brand">{t.business}</span>
        </div>

        <div className="mt-2 grid min-h-[448px] grid-cols-[142px_1fr] overflow-hidden rounded-[22px] border border-black/[0.06] bg-white">
          <aside className="border-r border-black/[0.06] bg-[#FCFCFE] p-4">
            <div className="rounded-xl border border-black/[0.06] bg-white p-3">
              <p className="text-[9px] font-semibold text-ink">{t.company}</p>
              <p className="mt-1 text-[8px] text-black/35">{t.planBusiness}</p>
            </div>
            <div className="mt-5 space-y-1.5">
              {["Pulpit", "Opinie", "Analiza", "Odpowiedzi"].map((item, index) => (
                <div key={item} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[9px] ${index === 0 ? "bg-brand-soft font-semibold text-brand" : "text-black/40"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-brand" : "bg-black/15"}`} />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-20 rounded-xl bg-ink p-3 text-white">
              <p className="text-[8px] text-white/45">Twój plan</p>
              <p className="mt-1 text-[9px] font-semibold">Business aktywny</p>
            </div>
          </aside>

          <div className="min-w-0 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-black/35">Centrum reputacji</p>
                <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-ink">Dzień dobry, Anno</h3>
                <p className="mt-1 text-[9px] text-black/40">Najważniejsze sygnały z opinii klientów.</p>
              </div>
              <span className="rounded-xl border border-black/[0.07] bg-white px-3 py-2 text-[9px] font-medium text-black/45">Ostatnie 30 dni</span>
            </div>

            <div className="mt-5 grid grid-cols-[1.12fr_0.88fr] gap-3">
              <article className="hero-preview-card group rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-medium text-black/40">Reputation Score</p>
                    <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.06em] text-ink">{score}<span className="ml-1 text-base text-black/30">/100</span></p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name="trend" className="h-4 w-4" /></span>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-black/[0.06]"><div className="hero-preview-score h-full rounded-full bg-brand" style={{ width: `${score}%` }} /></div>
                <p className="mt-3 text-[9px] font-medium text-[#198754]">+4 pkt względem poprzedniego okresu</p>
              </article>
              <article className="hero-preview-card rounded-2xl border border-black/[0.06] bg-white p-4">
                <div className="flex items-center justify-between"><p className="text-[9px] font-medium text-black/40">Nowe opinie</p><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand"><Icon name="quote" className="h-3.5 w-3.5" /></span></div>
                <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-0.06em] text-ink">{reviews}</p>
                <p className="mt-2 text-[9px] text-black/40">w ostatnich 30 dniach</p>
              </article>
            </div>

            <div className="mt-3 grid grid-cols-[1.08fr_0.92fr] gap-3">
              <article key={String(liveUpdate)} className="hero-preview-review rounded-2xl border border-black/[0.06] bg-white p-4">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-[10px] font-semibold text-brand">AK</span><div><p className="text-[10px] font-semibold text-ink">Anna K.</p><p className="mt-0.5 text-[8px] text-black/35">Nowa opinia</p></div></div><span className="rounded-full bg-brand-soft px-2 py-1 text-[9px] font-semibold text-brand">5,0 ★</span></div>
                <p className="mt-3 text-[10px] leading-4 text-black/55">Świetna obsługa i bardzo miła atmosfera. Na pewno wrócę.</p>
              </article>
              <article className="hero-preview-card rounded-2xl bg-ink p-4 text-white">
                <div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-medium uppercase tracking-[0.12em] text-white/45">Analiza reputacji</p><p className="mt-1 text-[11px] font-semibold">Warto obserwować</p></div><span className="hero-preview-signal h-2 w-2 rounded-full bg-brand" /></div>
                <p className="mt-4 text-[9px] leading-4 text-white/65">Czas oczekiwania wraca w negatywnych opiniach.</p>
              </article>
            </div>

            <article className="hero-preview-card mt-3 rounded-2xl border border-brand/15 bg-brand-soft/50 p-4">
              <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[8px] font-medium uppercase tracking-[0.12em] text-brand">Propozycja odpowiedzi</p><p className="mt-1 truncate text-[10px] font-medium text-ink">Dziękujemy za opinię. Pracujemy nad skróceniem czasu oczekiwania.</p></div><span className="shrink-0 rounded-xl bg-brand px-3 py-2 text-[9px] font-semibold text-white">Gotowa</span></div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHeroProductPreview() {
  const [liveUpdate, setLiveUpdate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeout = window.setTimeout(() => setLiveUpdate(true), 1200);
    const interval = window.setInterval(() => setLiveUpdate((value) => !value), 6200);
    return () => { window.clearTimeout(timeout); window.clearInterval(interval); };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-20 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[26px] border border-black/[0.08] bg-[#F7F7FA] p-3 shadow-soft">
        <div className="rounded-[18px] border border-black/[0.06] bg-white p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-6 w-6 rounded-lg object-contain" /><span className="text-xs font-semibold text-ink">NuvoRate</span></div><span className="rounded-full bg-brand-soft px-2.5 py-1 text-[9px] font-semibold text-brand">Business</span></div>
          <div className="mt-5 flex items-end justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/35">Reputation Score</p><p className="mt-2 text-[42px] font-semibold leading-none tracking-[-0.065em] text-ink">{liveUpdate ? "92" : "91"}<span className="ml-1 text-lg text-black/30">/100</span></p></div><p className="mb-1 text-xs font-semibold text-[#198754]">+4 pkt</p></div>
          <div className="mt-4 h-1.5 rounded-full bg-black/[0.06]"><div className="hero-preview-score h-full rounded-full bg-brand" style={{ width: `${liveUpdate ? 92 : 91}%` }} /></div>
          <div key={String(liveUpdate)} className="hero-preview-review mt-5 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5"><div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Nowa opinia</p><p className="mt-1 text-sm font-semibold text-ink">Anna K. <span className="text-brand">5,0 ★</span></p></div><span className="rounded-xl bg-brand-soft px-2.5 py-1.5 text-[9px] font-semibold text-brand">Zobacz</span></div><p className="mt-2 text-xs leading-5 text-black/50">Świetna obsługa i bardzo miła atmosfera.</p></div>
          <div className="mt-3 rounded-2xl bg-ink p-3.5 text-white"><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/45">Analiza reputacji</p><p className="mt-1 text-xs font-semibold">Czas oczekiwania wymaga uwagi</p></div>
        </div>
      </div>
    </div>
  );
}

function ReputationSystemPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[700px]">
      <div className="pointer-events-none absolute -inset-12 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative rounded-[30px] border border-black/[0.08] bg-[#F7F7FA] p-3 shadow-soft">
        <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-7 w-7 rounded-lg object-contain" />
              <div>
                <p className="text-xs font-semibold text-ink">NuvoRate</p>
                <p className="mt-0.5 text-[9px] text-black/35">System reputacji firmy</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand">Business</span>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
            <div className="pointer-events-none absolute left-1/2 top-12 hidden h-[calc(100%-96px)] w-px -translate-x-1/2 bg-brand/15 sm:block" />
            <div className="pointer-events-none absolute left-12 right-12 top-1/2 hidden h-px -translate-y-1/2 bg-brand/15 sm:block" />

            <article className="hero-system-card relative rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand shadow-sm"><Icon name="quote" className="h-4 w-4" /></span>
                  <div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Nowa opinia Google</p><p className="mt-1 text-xs font-semibold">Anna K. <span className="text-brand">5,0 ★</span></p></div>
                </div>
                <span className="rounded-full bg-brand-soft px-2 py-1 text-[8px] font-semibold text-brand">Nowa</span>
              </div>
              <p className="mt-3 text-[10px] leading-4 text-black/50">Świetna obsługa, ale czas oczekiwania był zbyt długi.</p>
            </article>

            <article className="hero-system-card relative rounded-2xl bg-ink p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#A6A7FF]"><Icon name="chart" className="h-4 w-4" /></span>
                <span className="rounded-full bg-brand/25 px-2 py-1 text-[8px] font-semibold text-[#C7C8FF]">Analiza</span>
              </div>
              <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-white/40">NuvoRate wykrywa</p>
              <p className="mt-1 text-sm font-semibold">Czas oczekiwania wymaga uwagi</p>
              <div className="mt-3 flex gap-2 text-[8px]"><span className="rounded-lg bg-white/[0.08] px-2 py-1.5 text-white/65">Mocna obsługa</span><span className="rounded-lg bg-white/[0.08] px-2 py-1.5 text-white/65">Problem: czas</span></div>
            </article>

            <article className="hero-system-card relative rounded-2xl border border-brand/15 bg-brand-soft/55 p-4">
              <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand shadow-sm"><Icon name="spark" className="h-4 w-4" /></span><span className="rounded-xl bg-brand px-2.5 py-1.5 text-[8px] font-semibold text-white">Gotowa</span></div>
              <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-brand">Propozycja odpowiedzi</p>
              <p className="mt-1 text-[10px] leading-4 text-black/60">Dziękujemy za opinię. Pracujemy nad skróceniem czasu oczekiwania.</p>
            </article>

            <article className="hero-system-card relative rounded-2xl border border-black/[0.06] bg-white p-4">
              <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name="nfc" className="h-4 w-4" /></span><span className="text-[9px] font-semibold text-[#198754]">+1 opinia</span></div>
              <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Plakietka NFC</p>
              <p className="mt-1 text-sm font-semibold text-ink">Łatwiejsza droga do opinii</p>
              <p className="mt-1 text-[10px] leading-4 text-black/45">Klient skanuje, a Ty widzisz efekt w panelu.</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileReputationSystemPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-20 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative rounded-[26px] border border-black/[0.08] bg-[#F7F7FA] p-3 shadow-soft">
        <div className="rounded-[18px] border border-black/[0.06] bg-white p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-6 w-6 rounded-lg object-contain" /><span className="text-xs font-semibold text-ink">NuvoRate</span></div><span className="text-[9px] font-medium text-black/35">System reputacji</span></div>
          <div className="mt-5 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5"><div className="flex items-center justify-between"><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Nowa opinia Google</p><p className="mt-1 text-sm font-semibold text-ink">Anna K. <span className="text-brand">5,0 ★</span></p></div><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-brand"><Icon name="quote" className="h-4 w-4" /></span></div><p className="mt-2 text-xs leading-5 text-black/50">Świetna obsługa, ale czas oczekiwania był zbyt długi.</p></div>
          <div className="my-2.5 ml-7 h-4 w-px bg-brand/25" />
          <div className="rounded-2xl bg-ink p-3.5 text-white"><div className="flex items-center justify-between"><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/45">Analiza NuvoRate</p><Icon name="chart" className="h-4 w-4 text-[#A6A7FF]" /></div><p className="mt-1 text-sm font-semibold">Czas oczekiwania wymaga uwagi</p><p className="mt-2 text-xs leading-5 text-white/60">Mocna obsługa. Problem: czas oczekiwania.</p></div>
          <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-brand/15 bg-brand-soft/55 p-3"><p className="text-[8px] font-medium uppercase tracking-[0.1em] text-brand">Odpowiedź</p><p className="mt-1 text-[10px] font-semibold text-ink">Propozycja gotowa</p></div><div className="rounded-2xl border border-black/[0.06] bg-white p-3"><p className="text-[8px] font-medium uppercase tracking-[0.1em] text-black/35">NFC</p><p className="mt-1 text-[10px] font-semibold text-ink">Nowa opinia bliżej</p></div></div>
        </div>
      </div>
    </div>
  );
}

function NfcWaveIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M3.5 9a12 12 0 0 1 17 0" />
      <path d="M6.75 12.5a7.5 7.5 0 0 1 10.5 0" />
      <path d="M10 16a3 3 0 0 1 4 0" />
    </svg>
  );
}

const heroFlowSteps = ["NFC", "Opinia", "Analiza", "Odpowiedź", "Efekt"];

function HeroReputationFlow({ startOnView = false }: { startOnView?: boolean }) {
  const [step, setStep] = useState(0);
  const [responseLength, setResponseLength] = useState(0);
  const flowRef = useRef<HTMLDivElement>(null);
  const [hasEnteredView, setHasEnteredView] = useState(!startOnView);
  const responseText = "Dziękujemy za opinię. Pracujemy nad skróceniem czasu oczekiwania.";

  useEffect(() => {
    if (!startOnView || !flowRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setHasEnteredView(true);
    }, { threshold: 0.35 });
    observer.observe(flowRef.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasEnteredView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setStep((current) => (current + 1) % heroFlowSteps.length), 2400);
    return () => window.clearInterval(interval);
  }, [hasEnteredView]);

  useEffect(() => {
    if (step < 3) {
      setResponseLength(0);
      return;
    }

    setResponseLength(0);
    const interval = window.setInterval(() => {
      setResponseLength((length) => {
        if (length >= responseText.length) {
          window.clearInterval(interval);
          return length;
        }

        return length + 2;
      });
    }, 28);

    return () => window.clearInterval(interval);
  }, [step, responseText.length]);

  const isActive = (index: number) => step === index;
  const isComplete = (index: number) => step > index;
  const nodeClass = (index: number) =>
    `transition-all duration-500 ${isActive(index) ? "scale-[1.01] border-brand/30 shadow-purple" : "border-black/[0.06] shadow-none"}`;

  return (
    <div ref={flowRef} className="relative mx-auto w-full max-w-[700px]">
      <div className="pointer-events-none absolute -inset-12 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[30px] border border-black/[0.08] bg-[#F7F7FA] p-3 shadow-soft">
        <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5"><img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-7 w-7 rounded-lg object-contain" /><div><p className="text-xs font-semibold text-ink">NuvoRate</p><p className="mt-0.5 text-[9px] text-black/35">Reputacja firmy w ruchu</p></div></div>
            <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand">Business</span>
          </div>

          <div className="mt-6 flex items-center gap-1.5" aria-label="Etapy zarządzania reputacją">
            {heroFlowSteps.map((label, index) => <div key={label} className="flex min-w-0 flex-1 items-center gap-1.5"><span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-500 ${isActive(index) ? "hero-flow-timeline-pulse bg-brand" : isComplete(index) ? "bg-brand" : "bg-black/10"}`} /><span className={`truncate text-[8px] font-medium transition-colors duration-500 ${isActive(index) ? "text-brand" : "text-black/35"}`}>{label}</span>{index < heroFlowSteps.length - 1 ? <span className={`h-px min-w-0 flex-1 ${isActive(index) ? "hero-flow-connector-current" : isComplete(index) ? "bg-brand/45" : "bg-black/[0.07]"}`} /> : null}</div>)}
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-[0.88fr_1.12fr]">
            <article className={`rounded-2xl border bg-[#FAFAFC] p-4 ${nodeClass(0)}`}>
              <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><NfcWaveIcon /></span><span className={`rounded-full px-2.5 py-1 text-[8px] font-semibold transition-colors duration-500 ${isActive(0) ? "bg-brand text-white" : "bg-white text-black/40"}`}>Skan NFC</span></div>
              <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Plakietka NuvoRate</p>
              <p className="mt-1 text-sm font-semibold text-ink">Klient zostawia opinię</p>
              <div className={`mt-4 flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 ${isActive(0) ? "hero-flow-scan" : ""}`}><span className="h-5 w-8 rounded-md border-2 border-ink/80" /><span className="flex gap-1 text-brand"><span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-30" /></span></div>
            </article>

            <article className={`rounded-2xl border bg-white p-4 ${nodeClass(1)} ${step >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-40"}`}>
              <div className={`transition-all duration-500 ${step >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-[10px] font-semibold text-brand">AK</span><div><p className="text-[10px] font-semibold text-ink">Anna K.</p><p className="mt-0.5 text-[8px] text-black/35">Google · przed chwilą</p></div></div><span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand">5,0 ★</span></div>
              <p className="mt-4 text-[10px] leading-4 text-black/60">Świetna obsługa i bardzo miła atmosfera. Czas oczekiwania był jednak zbyt długi.</p>
              <div className="mt-3 flex items-center gap-2"><span className="rounded-lg border border-black/[0.06] bg-[#FAFAFC] px-2 py-1 text-[8px] font-semibold text-black/45">GOOGLE</span><span className={`text-[8px] font-semibold transition-colors duration-500 ${isActive(1) ? "text-brand" : "text-black/35"}`}>{isActive(1) ? "Opinia trafia do NuvoRate" : "Opinia zapisana"}</span></div></div>
            </article>

            <article className={`rounded-2xl border bg-ink p-4 text-white ${isActive(2) ? "scale-[1.01] border-brand/50 shadow-purple" : "border-ink shadow-none"} ${step >= 2 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-40"} transition-all duration-500`}>
              <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#A6A7FF]"><Icon name="chart" className="h-4 w-4" /></span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-semibold text-[#C7C8FF]">Analiza reputacji</span></div>
              <div className={`transition-all duration-500 ${step >= 2 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}><p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-white/40">NuvoRate wykrywa</p>
              <p className="mt-1 text-sm font-semibold">Czas oczekiwania wymaga uwagi</p>
              <div className="mt-3 grid grid-cols-2 gap-2"><span className="rounded-lg bg-white/[0.07] px-2 py-2 text-[8px] text-white/65">Mocna strona: obsługa</span><span className="rounded-lg bg-white/[0.07] px-2 py-2 text-[8px] text-white/65">Problem: czas</span></div></div>
            </article>

            <article className={`rounded-2xl border bg-brand-soft/55 p-4 ${nodeClass(3)} ${step >= 3 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-40"}`}>
              <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand shadow-sm"><Icon name="spark" className="h-4 w-4" /></span><span className={`rounded-xl px-2.5 py-1.5 text-[8px] font-semibold transition-colors duration-500 ${isActive(3) ? "bg-brand text-white" : "bg-white text-brand"}`}>Odpowiedź gotowa</span></div>
              <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-brand">Propozycja odpowiedzi</p>
              <p className="mt-1 min-h-8 text-[10px] leading-4 text-black/60" aria-live="polite">{responseText.slice(0, responseLength)}{step >= 3 && responseLength < responseText.length ? <span className="ml-0.5 inline-block h-2.5 w-px bg-brand align-middle" /> : null}</p>
            </article>
          </div>

          <div className={`mt-3 rounded-2xl border p-3.5 transition-all duration-500 ${isActive(4) ? "scale-[1.01] border-brand/25 bg-brand-soft shadow-sm" : "border-black/[0.06] bg-[#FAFAFC]"} ${step >= 4 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-40"}`}>
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-brand"><Icon name="check" className="h-4 w-4" /></span><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Efekt</p><p className="mt-0.5 text-xs font-semibold text-ink">Reputacja firmy pod kontrolą</p></div></div><span className="text-[9px] font-semibold text-[#198754]">Gotowe</span></div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-brand/10 pt-2 text-[8px] font-medium text-black/45"><span>✓ Opinia zebrana</span><span>✓ Problem wykryty</span><span>✓ Odpowiedź gotowa</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHeroReputationFlow() {
  const [step, setStep] = useState(0);
  const [responseLength, setResponseLength] = useState(0);
  const responseText = "Dziękujemy za opinię. Pracujemy nad skróceniem czasu oczekiwania.";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeout = window.setTimeout(() => setStep((current) => (current + 1) % heroFlowSteps.length), step === 3 ? 5200 : 4000);
    return () => window.clearTimeout(timeout);
  }, [step]);

  useEffect(() => {
    if (step < 3) {
      setResponseLength(0);
      return;
    }

    setResponseLength(0);
    const interval = window.setInterval(() => {
      setResponseLength((length) => {
        if (length >= responseText.length) {
          window.clearInterval(interval);
          return length;
        }

        return length + 1;
      });
    }, 24);

    return () => window.clearInterval(interval);
  }, [step, responseText.length]);

  const active = (index: number) => step === index;
  const card = "rounded-2xl border p-4";

  const stageContent = [
    <div className={`${card} border-brand/30 bg-[#FAFAFC] shadow-card`}>
      <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><NfcWaveIcon /></span><span className="rounded-full bg-brand px-2.5 py-1 text-[8px] font-semibold text-white">Skan NFC</span></div>
      <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Plakietka NuvoRate</p><p className="mt-1 text-sm font-semibold text-ink">Klient zostawia opinię</p>
      <div className="hero-flow-scan mt-4 flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2"><span className="h-5 w-8 rounded-md border-2 border-ink/80" /><span className="flex gap-1 text-brand"><span className="h-1.5 w-1.5 rounded-full bg-current" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" /><span className="h-1.5 w-1.5 rounded-full bg-current opacity-30" /></span></div>
    </div>,
    <div className={`${card} hero-preview-review border-brand/30 bg-white shadow-card`}>
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-[10px] font-semibold text-brand">AK</span><div><p className="text-[10px] font-semibold text-ink">Anna K.</p><p className="mt-0.5 text-[8px] text-black/35">Google · przed chwilą</p></div></div><span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand">5,0 ★</span></div>
      <p className="mt-4 text-[10px] leading-4 text-black/60">Świetna obsługa i bardzo miła atmosfera. Czas oczekiwania był jednak zbyt długi.</p><div className="mt-3 flex items-center gap-2"><span className="rounded-lg border border-black/[0.06] bg-[#FAFAFC] px-2 py-1 text-[8px] font-semibold text-black/45">GOOGLE</span><span className="text-[8px] font-semibold text-brand">Opinia trafia do NuvoRate</span></div>
    </div>,
    <div className={`${card} hero-flow-scan border-brand/50 bg-ink text-white shadow-card`}>
      <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#A6A7FF]"><Icon name="chart" className="h-4 w-4" /></span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-semibold text-[#C7C8FF]">Analiza reputacji</span></div><p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-white/40">NuvoRate wykrywa</p><p className="mt-1 text-sm font-semibold">Czas oczekiwania wymaga uwagi</p><div className="mt-3 grid grid-cols-2 gap-2"><span className="rounded-lg bg-white/[0.07] px-2 py-2 text-[8px] text-white/65">Mocna strona: obsługa</span><span className="rounded-lg bg-white/[0.07] px-2 py-2 text-[8px] text-white/65">Problem: czas</span></div>
    </div>,
    <div className={`${card} border-brand/25 bg-brand-soft/55 shadow-card`}>
      <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand shadow-sm"><Icon name="spark" className="h-4 w-4" /></span><span className="rounded-xl bg-brand px-2.5 py-1.5 text-[8px] font-semibold text-white">Tworzenie odpowiedzi</span></div><p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-brand">Propozycja odpowiedzi</p><p className="mt-1 min-h-8 text-[10px] leading-4 text-black/60" aria-live="polite">{responseText.slice(0, responseLength)}{responseLength < responseText.length ? <span className="ml-0.5 inline-block h-2.5 w-px bg-brand align-middle" /> : null}</p>
    </div>,
    <div className={`${card} border-brand/20 bg-brand-soft/55 shadow-card`}><p className="text-[8px] font-medium uppercase tracking-[0.12em] text-brand">Efekt</p><div className="mt-2 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-ink">Reputacja firmy pod kontrolą</p><span className="text-[9px] font-semibold text-[#198754]">✓ Gotowe</span></div><div className="mt-4 flex items-center gap-2 border-t border-brand/15 pt-3 text-[9px] font-medium text-black/50"><span>Opinia zebrana</span><span className="h-1 w-1 rounded-full bg-brand/40" /><span>Wniosek gotowy</span></div></div>,
  ];

  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-20 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative rounded-[26px] border border-black/[0.08] bg-[#F7F7FA] p-3 shadow-soft">
        <div className="rounded-[18px] border border-black/[0.06] bg-white p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-6 w-6 rounded-lg object-contain" /><span className="text-xs font-semibold text-ink">NuvoRate</span></div><span className="text-[9px] font-medium text-black/35">System reputacji</span></div>
          <div className="mt-4 flex items-center gap-1" aria-label="Etapy zarządzania reputacją">{heroFlowSteps.map((label, index) => <div key={label} className="flex min-w-0 flex-1 items-center gap-1"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active(index) ? "hero-flow-timeline-pulse bg-brand" : step > index ? "bg-brand" : "bg-black/10"}`} /><span className={`truncate text-[7px] font-medium ${active(index) ? "text-brand" : "text-black/35"}`}>{label}</span>{index < heroFlowSteps.length - 1 ? <span className={`h-px min-w-0 flex-1 ${active(index) ? "hero-flow-connector-current" : step > index ? "bg-brand/45" : "bg-black/[0.07]"}`} /> : null}</div>)}</div>
          <div className="relative mt-4 min-h-[184px]">
            <div key={step} className="mobile-process-stage absolute inset-x-0 top-0">{stageContent[step]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup({ hero = false, t }: { hero?: boolean; t: LandingTranslations["mockup"] }) {
  const chartBars = [2, 4, 1, 6, 3, 8, 5, 10, 7, 16, 6, 9, 4, 12, 5, 7];
  const maxChartBar = Math.max(...chartBars);

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-black/[0.08] bg-[#F7F7FA] shadow-soft ${
        hero ? "min-w-[760px] origin-top-left scale-[0.54] sm:scale-[0.64] lg:scale-[0.72]" : ""
      }`}
    >
      <div className="flex h-[46px] items-center justify-between border-b border-black/[0.07] bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B6B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFD166]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#5DD39E]" />
          </div>
          <span className="ml-3 text-[10px] font-semibold text-black/35">app.nuvorate.pl</span>
        </div>
        <span className="rounded-full bg-brand-soft px-2 py-1 text-[9px] font-semibold text-brand">
          {t.appBadge}
        </span>
      </div>
      <div className="flex min-h-[548px]">
        <aside className="w-[150px] shrink-0 border-r border-black/[0.06] bg-white p-4">
          <div className="flex items-center gap-2">
            <img
              src="/brand/nuvorate-logo.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-[11px] font-bold">NuvoRate</span>
          </div>
          <div className="mt-6 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
            <p className="text-[9px] font-semibold text-ink">{t.company}</p>
            <p className="mt-1 text-[8px] text-black/35">{t.planBusiness}</p>
          </div>
          <div className="mt-5 space-y-1.5 text-[10px]">
            {t.nav.map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${
                  index === 0 ? "bg-brand-soft font-semibold text-brand" : "text-black/40"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-brand" : "bg-black/15"}`} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-ink p-3 text-white">
            <p className="text-[8px] text-white/50">{t.yourPlan}</p>
            <p className="mt-1 text-[10px] font-semibold">{t.businessActive}</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-black/35">{t.dashboardLabel}</p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight">{t.greeting}</h3>
              <p className="mt-0.5 text-[9px] text-black/35">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-black/[0.07] bg-white px-3 py-2 text-[9px] font-medium text-black/50">
                {t.range}
              </div>
              <div className="rounded-full bg-brand-soft px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-brand">
                {t.business}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {t.metrics.map((metric, index) => (
              <div key={metric.label} className="rounded-xl border border-black/[0.06] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-medium text-black/40">{metric.label}</span>
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-soft text-brand">
                    <Icon name={mockupMetricIcons[index]} className="h-3 w-3" />
                  </span>
                </div>
                <p className="mt-3 text-[19px] font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-1 text-[8px] text-black/35">{metric.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-black/[0.06] bg-white p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-black/35">{t.planLimits}</p>
                <p className="mt-1 text-[11px] font-semibold">{t.billingPeriod}</p>
                <p className="mt-1 text-[8px] leading-3 text-black/35">{t.limitsRenewal}</p>
              </div>
              <span className="rounded-full bg-brand-soft px-2 py-1 text-[8px] font-semibold text-brand">
                {t.planBusiness}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {t.limits.map(([label, value, width]) => (
                <div key={label} className="rounded-xl bg-[#FAFAFC] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-semibold">{label}</p>
                    <p className="text-[9px] font-semibold text-brand">{value}</p>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-black/[0.06]">
                    <div className="h-full rounded-full bg-brand" style={{ width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[1.45fr_0.78fr] gap-3">
            <div className="rounded-xl border border-black/[0.06] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-black/35">{t.newReviewsLabel}</p>
                  <p className="mt-1 text-[12px] font-semibold">{t.chartTitle}</p>
                </div>
                <span className="flex items-center gap-1.5 text-[8px] text-black/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {t.currentPeriod}
                </span>
              </div>
              <div className="mt-4 flex h-[92px] items-end gap-1.5 border-b border-black/[0.08] pb-1.5">
                {chartBars.map((bar, index) => (
                  <span
                    key={`${bar}-${index}`}
                    className={`flex-1 rounded-t-[4px] ${bar > 2 ? "bg-brand" : "bg-black/10"}`}
                    style={{
                      height: `${Math.max(4, Math.round((bar / maxChartBar) * 78))}px`,
                      opacity: bar > 2 ? 0.86 : 1,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[7px] text-black/25">
                {t.chartLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {t.insights.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-2.5">
                    <p className="text-[7px] font-medium uppercase tracking-[0.1em] text-black/35">{label}</p>
                    <p className="mt-1.5 text-[10px] font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-ink p-4 text-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {t.analysisLabel}
                  </span>
                  <p className="mt-1 text-[12px] font-semibold">{t.analysisTitle}</p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[7px] font-semibold text-[#A6A7FF]">
                  {t.business}
                </span>
              </div>
              <p className="mt-4 text-[10px] font-medium leading-4 text-white/80">
                {t.analysisText}
              </p>
              <div className="mt-4 space-y-2.5">
                {t.analysisPoints.map((item) => (
                  <p key={item} className="rounded-lg bg-white/[0.06] px-2.5 py-2 text-[8px] leading-3 text-white/65">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-black/[0.06] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-black/40">OSTATNIE OPINIE</p>
                <p className="mt-1 text-[11px] font-semibold">{t.latestReviewsTitle}</p>
              </div>
              <span className="rounded-lg bg-brand-soft px-2.5 py-1.5 text-[8px] font-semibold text-brand">
                {t.seeAll}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {t.reviews.map(([name, text, rating, action]) => (
                <div key={name} className="rounded-lg bg-[#F8F8FA] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-semibold">{name}</span>
                    <span className="text-[8px] font-semibold text-brand">{rating} ★</span>
                  </div>
                  <p className="mt-1.5 text-[8px] leading-3 text-black/45">{text}</p>
                  <button type="button" className="mt-2 text-[7px] font-semibold text-brand">
                    {action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileDashboardProductMockup() {
  return (
    <div className="relative mx-auto flex w-full justify-center overflow-visible">
      <img
        src="/landing/a_clean_product_marketing_style_render_a_single_i.png"
        alt="Mobilny pulpit aplikacji NuvoRate"
        className="block h-auto w-[min(76vw,300px)] rotate-[-2deg] object-contain drop-shadow-[0_24px_26px_rgba(10,10,22,0.28)]"
      />
    </div>
  );
}

function Hero({ t }: { t: LandingTranslations }) {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-32 lg:min-h-[820px] lg:pb-28 lg:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_70%_28%,rgba(91,92,246,0.13),transparent_34%),radial-gradient(circle_at_10%_35%,rgba(91,92,246,0.06),transparent_26%)]" />
      <div className="container-page grid items-center gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:gap-12">
        <div className="max-w-[650px]">
          <span className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {t.hero.eyebrow}
          </span>
          <h1 className="mt-6 text-balance text-[38px] font-semibold leading-[1.06] tracking-[-0.055em] text-ink sm:text-5xl lg:mt-7 lg:text-[72px] lg:leading-[1.03]">
            {t.hero.titleStart}{" "}
            <span className="text-brand">{t.hero.titleHighlight}</span> {t.hero.titleEnd}
          </h1>
          <p className="mt-5 max-w-[590px] text-pretty text-base leading-7 text-black/60 sm:text-lg sm:leading-8 lg:mt-7 lg:text-xl">
            {t.hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 lg:mt-9 lg:flex-row">
            <Link href="/register" className="button-primary w-full lg:w-auto">
              {t.hero.primaryCta}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <a href="#dashboard" className="button-secondary w-full lg:w-auto">
              {t.hero.secondaryCta}
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/45 lg:mt-7 lg:gap-x-5">
            {t.hero.bullets.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:hidden">
          <MobileHeroReputationFlow />
        </div>
        <div className="relative hidden lg:block">
          <HeroReputationFlow />
        </div>
      </div>
    </section>
  );
}

function BenefitsJourneyVisual({ activeStep, isVisible }: { activeStep: number; isVisible: boolean }) {
  const motionClass = `animate-fade-up transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`;

  if (activeStep === 0) {
    return <div key="profile" className={`w-full max-w-sm ${motionClass}`}><div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name="data" className="h-4 w-4" /></span><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Profil firmy</p><p className="mt-1 text-sm font-semibold text-ink">Restauracja Nova</p></div><span className="ml-auto h-2 w-2 rounded-full bg-[#198754]" /></div><div className="mt-4 grid grid-cols-2 gap-2 text-[9px]"><span className="rounded-lg bg-[#FAFAFC] px-2.5 py-2 text-black/55">Google Business</span><span className="rounded-lg bg-[#FAFAFC] px-2.5 py-2 text-black/55">Profil gotowy</span></div></div></div>;
  }

  if (activeStep === 1) {
    return <div key="nfc-places" className={`w-full max-w-sm ${motionClass}`}><div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-sm"><div className="flex items-center justify-between"><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Plakietki NFC</p><p className="mt-1 text-sm font-semibold text-ink">Miejsca kontaktu z klientem</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><NfcWaveIcon /></span></div><div className="mt-4 grid grid-cols-3 gap-2">{["Przy kasie", "Na stoliku", "Przy wyjściu"].map((place) => <span key={place} className="rounded-xl border border-black/[0.06] bg-[#FAFAFC] px-2 py-3 text-center text-[8px] font-medium text-black/50"><NfcWaveIcon className="mx-auto h-3.5 w-3.5 text-brand" /><span className="mt-1.5 block">{place}</span></span>)}</div></div></div>;
  }

  if (activeStep === 2) {
    return <div key="review" className={`w-full max-w-sm ${motionClass}`}><div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-sm"><div className="flex items-center justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand ${isVisible ? "hero-flow-scan" : ""}`}><NfcWaveIcon /></span><span className="rounded-full bg-brand px-2.5 py-1 text-[8px] font-semibold text-white">Skan NFC</span></div><div className="ml-4 h-4 w-px bg-brand/20" /><div className="rounded-xl border border-black/[0.06] bg-[#FAFAFC] p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[9px] font-semibold text-brand">AK</span><span className="text-[10px] font-semibold text-ink">Anna K.</span></div><span className="rounded-full bg-brand-soft px-2 py-1 text-[9px] font-semibold text-brand">5,0 ★</span></div><p className="mt-2 text-[9px] leading-4 text-black/55">Świetna obsługa i bardzo miła atmosfera.</p></div></div></div>;
  }

  if (activeStep === 3) {
    return <div key="analysis" className={`w-full max-w-sm ${motionClass}`}><div className={`rounded-2xl bg-ink p-4 text-left text-white shadow-sm ${isVisible ? "hero-flow-scan" : ""}`}><div className="flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#A6A7FF]"><Icon name="chart" className="h-4 w-4" /></span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-semibold text-[#C7C8FF]">Analiza reputacji</span></div><p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-white/40">Najważniejszy sygnał</p><p className="mt-1 text-sm font-semibold">Czas oczekiwania wymaga uwagi</p><div className="mt-3 grid grid-cols-2 gap-2"><span className="rounded-lg bg-white/[0.07] px-2 py-2 text-[8px] text-white/65">Mocna strona: obsługa</span><span className="rounded-lg bg-white/[0.07] px-2 py-2 text-[8px] text-white/65">Problem: czas</span></div></div></div>;
  }

  return <div key="growth" className={`w-full max-w-sm ${motionClass}`}><div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-sm"><div className="flex items-center justify-between"><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Reputation Score</p><p className="mt-2 text-3xl font-semibold leading-none tracking-[-0.06em] text-ink">91<span className="ml-1 text-sm text-black/30">/100</span></p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><Icon name="trend" className="h-4 w-4" /></span></div><div className="mt-4 h-1.5 rounded-full bg-black/[0.06]"><div className="h-full w-[91%] rounded-full bg-brand" /></div><div className="mt-3 flex items-center justify-between text-[9px]"><span className="font-semibold text-[#198754]">+4 pkt w tym miesiącu</span><span className="text-black/40">Plan działania gotowy</span></div></div></div>;
}

function BenefitsJourney({ t }: { t: LandingTranslations["benefits"] }) {
  const journeyRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const icons: IconName[] = ["nfc", "quote", "chart", "spark", "trend"];

  useEffect(() => {
    const journey = journeyRef.current;
    if (!journey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.4 });
    observer.observe(journey);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 1023px)").matches) return;
    const timer = window.setInterval(() => setActiveStep((current) => (current + 1) % t.journey.steps.length), 6000);
    return () => window.clearInterval(timer);
  }, [isVisible, t.journey.steps.length]);

  const activeJourneyCard = (
    <div className="relative flex min-h-[252px] flex-col items-center justify-center text-center lg:min-h-[282px]">
      <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-brand shadow-sm">{activeStep === 0 ? <NfcWaveIcon className="h-3.5 w-3.5" /> : <Icon name={icons[activeStep]} className="h-3.5 w-3.5" />}</span><p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">Etap {String(activeStep + 1).padStart(2, "0")}</p></div>
      <p className="mt-3 text-balance text-xl font-semibold tracking-[-0.03em] text-ink sm:text-2xl">{t.journey.steps[activeStep][0]}</p><p className="mt-2 max-w-md text-sm leading-6 text-black/55">{t.journey.steps[activeStep][1]}</p><div className="mt-5 flex w-full justify-center"><BenefitsJourneyVisual activeStep={activeStep} isVisible={isVisible} /></div>
    </div>
  );

  return (
    <div ref={journeyRef} className="mx-auto max-w-5xl">
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">{t.journey.title}</h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55 sm:text-base">{t.journey.description}</p>
      </div>
      <div className="mt-8 rounded-[28px] border border-black/[0.06] bg-white p-4 shadow-card lg:hidden">
        <div className="grid grid-cols-5 gap-2" aria-label="Proces współpracy z NuvoRate">
          {t.journey.steps.map(([label], index) => <button key={label} type="button" onClick={() => setActiveStep(index)} aria-label={`Etap ${index + 1}: ${label}`} aria-pressed={activeStep === index} className={`flex min-h-11 items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-300 active:scale-95 ${activeStep === index ? "border-brand bg-brand text-white shadow-sm" : "border-black/[0.06] bg-[#FAFAFC] text-black/40"}`}>{String(index + 1).padStart(2, "0")}</button>)}
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-brand">{t.journey.steps[activeStep][0]}</p>
        <div className="relative mt-4 h-[380px] overflow-hidden rounded-[22px] border border-black/[0.06] bg-[#FAFAFC] p-5">
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft/70 blur-3xl" />
          <div key={activeStep} className="mobile-journey-stage">{activeJourneyCard}</div>
        </div>
        <div className="mt-4 flex flex-col gap-1.5 text-[10px] font-medium text-black/40"><span>{t.journey.footer}</span><span className="text-[#198754]">{t.journey.statuses[activeStep]}</span></div>
      </div>
      <div className="mt-10 hidden rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-card lg:block">
        <div className="flex items-center gap-1.5" aria-label="Proces współpracy z NuvoRate">
          {t.journey.steps.map(([label], index) => <div key={label} className="flex min-w-0 flex-1 items-center gap-1.5"><span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-700 ${index === activeStep ? "hero-flow-timeline-pulse bg-brand" : index < activeStep ? "bg-brand" : "bg-black/10"}`} /><span className={`truncate text-[11px] font-medium transition-colors duration-700 ${index === activeStep ? "text-brand" : "text-black/35"}`}>{label}</span>{index < t.journey.steps.length - 1 ? <span className={`h-px min-w-0 flex-1 ${index < activeStep ? "bg-brand/45" : "bg-black/[0.07]"}`} /> : null}</div>)}
        </div>
        <div className="relative mt-6 min-h-[330px] overflow-hidden rounded-[22px] border border-black/[0.06] bg-[#FAFAFC] p-8"><div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft/70 blur-3xl" />{activeJourneyCard}</div>
        <div className="mt-5 flex items-center justify-between gap-3 text-[10px] font-medium text-black/40"><span>{t.journey.footer}</span><span className="text-right text-[#198754]">{t.journey.statuses[activeStep]}</span></div>
      </div>
    </div>
  );
}

function Benefits({ t }: { t: LandingTranslations["benefits"] }) {
  const [activeMobileBenefit, setActiveMobileBenefit] = useState<number | null>(null);

  const handleMobileBenefitTap = (index: number) => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    setActiveMobileBenefit(index);
    window.setTimeout(() => setActiveMobileBenefit((current) => (current === index ? null : current)), 700);
  };

  return (
    <section id="funkcje" className="section-space overflow-hidden border-y border-black/[0.05] bg-[#FAFAFC]">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-5">{t.title}</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">{t.description}</p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-14 lg:gap-4 lg:grid-cols-4">
          {t.items.map((benefit, index) => {
            const isActive = activeMobileBenefit === index;

            return (
            <article key={benefit.title} onClick={() => handleMobileBenefitTap(index)} className={`group flex items-center gap-4 rounded-[24px] border bg-white p-4 shadow-card transition-all duration-200 active:scale-[0.995] lg:block lg:p-6 lg:hover:-translate-y-1 lg:hover:border-brand/20 ${isActive ? "-translate-y-0.5 scale-[1.01] border-brand/30 shadow-purple" : "border-black/[0.06]"}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition lg:group-hover:bg-brand lg:group-hover:text-white ${isActive ? "bg-brand text-white shadow-sm" : "bg-brand-soft text-brand"}`}><Icon name={benefit.icon as IconName} className="h-4 w-4" /></span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-[-0.025em] text-ink lg:mt-6 lg:text-lg">{benefit.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-black/55 lg:mt-3 lg:leading-6">{benefit.text}</p>
              </div>
            </article>
            );
          })}
        </div>

        <div className="mt-10 border-t border-black/[0.07] pt-10 lg:mt-20 lg:pt-20">
          <BenefitsJourney t={t} />
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ t }: { t: LandingTranslations["howItWorks"] }) {
  const [activeMobileStep, setActiveMobileStep] = useState<number | null>(null);

  const handleMobileStepTap = (index: number) => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    setActiveMobileStep(index);
    window.setTimeout(() => setActiveMobileStep((current) => (current === index ? null : current)), 700);
  };

  return (
    <section id="jak-dziala" className="section-space">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 className="section-title mt-5">{t.title}</h2>
            <p className="section-copy mt-5">
              {t.description}
            </p>
            <a href="#cennik" className="button-secondary mt-8">
              {t.cta}
              <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
          <div className="relative">
            <div className="absolute bottom-12 left-6 top-12 hidden w-px bg-gradient-to-b from-brand/0 via-brand/25 to-brand/0 lg:block" />
            <div className="space-y-4">
              {t.steps.map((step, index) => {
                const isActive = activeMobileStep === index;

                return (
                  <article
                    key={step.title}
                    onClick={() => handleMobileStepTap(index)}
                    className={`group relative flex items-start gap-4 rounded-[24px] border bg-white p-4 shadow-card transition-all duration-200 active:scale-[0.995] lg:block lg:p-6 lg:pl-20 lg:transition-all lg:duration-300 lg:hover:-translate-y-1 lg:hover:border-brand/30 lg:hover:shadow-purple ${isActive ? "-translate-y-0.5 scale-[1.01] border-brand/30 shadow-purple" : "border-black/[0.06]"}`}
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold transition-all duration-200 lg:absolute lg:left-6 lg:top-6 lg:h-12 lg:w-12 lg:rounded-2xl lg:transition-all lg:duration-300 lg:group-hover:bg-brand lg:group-hover:text-white lg:group-hover:shadow-purple ${isActive ? "bg-brand text-white shadow-sm" : "bg-brand-soft text-brand"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pointer-events-none absolute right-6 top-6 hidden max-w-[50%] translate-y-1 rounded-lg bg-brand-soft px-2.5 py-1.5 text-right text-[9px] font-semibold text-brand opacity-0 transition-all duration-300 lg:block lg:group-hover:translate-y-0 lg:group-hover:opacity-100">{t.context[index]}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand lg:text-xs">
                        {t.stepLabel} {index + 1}
                      </p>
                      <h3 className="mt-1 text-base font-semibold tracking-[-0.025em] lg:mt-2 lg:text-xl">{step.title}</h3>
                      <p className="mt-1 line-clamp-3 max-w-xl text-sm leading-5 text-black/55 lg:mt-2 lg:line-clamp-none lg:leading-6">{step.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview({
  t,
  hero,
  mockup,
}: {
  t: LandingTranslations["dashboard"];
  hero: LandingTranslations["hero"];
  mockup: LandingTranslations["mockup"];
}) {
  return (
    <section id="dashboard" className="section-space overflow-hidden bg-ink text-white">
      <div className="container-page">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A6A7FF]">
              {t.badge}
            </span>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              {t.title}
            </h2>
          </div>
          <p className="text-base leading-7 text-white/55 sm:text-lg">
            {t.description}
          </p>
        </div>
        <div className="relative mt-10 lg:mt-14">
          <div className="absolute -inset-20 hidden bg-[radial-gradient(circle_at_center,rgba(91,92,246,0.25),transparent_55%)] md:block" />
          <div className="relative mx-auto max-w-[1050px]">
            <div className="md:hidden">
              <MobileDashboardProductMockup />
            </div>
            <div className="hidden md:block">
              <DashboardDemo />
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {t.cards.map(([title, text], index) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/20 text-[#A6A7FF]">
                  <Icon name={index === 0 ? "chart" : index === 1 ? "spark" : "trend"} className="h-4 w-4" />
                </span>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/50">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NfcFeatureAccordion({ features }: { features: LandingTranslations["nfc"]["features"] }) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card">
      {features.map(([title, description], index) => {
        const isOpen = activeFeature === index;

        return (
          <div key={title} className={`border-b border-black/[0.06] transition-colors duration-300 last:border-b-0 ${isOpen ? "border-brand/20 bg-[#FAFAFC]" : ""}`}>
            <button
              type="button"
              onClick={() => setActiveFeature((current) => (current === index ? null : index))}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              aria-controls={`nfc-feature-${index}`}
            >
              <span className={`text-sm font-semibold transition-colors duration-300 ${isOpen ? "text-brand" : "text-ink"}`}>{title}</span>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-300 ${isOpen ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
                <Icon name="arrow" className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
              </span>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div id={`nfc-feature-${index}`} className="overflow-hidden">
                <div className={`px-5 pb-5 transition-all duration-300 ease-out ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}>
                  <p className="max-w-md text-sm leading-6 text-black/55">{description}</p>
                  <div className="mt-4 border-t border-brand/15 pt-4">
                    {index === 0 ? <div className="flex gap-2">{["Kasa", "Stolik", "Recepcja"].map((place) => <span key={place} className="flex-1 rounded-lg bg-brand-soft px-2 py-2 text-center text-[8px] font-semibold text-brand"><NfcWaveIcon className="mx-auto h-3.5 w-3.5" />{place}</span>)}</div> : index === 1 ? <div className="flex min-w-0 items-center justify-between gap-2 text-[10px]"><span className="min-w-0 truncate rounded-lg bg-brand-soft px-2 py-1 font-semibold text-brand">nuvorate.pl/r/kasa</span><span className="shrink-0 text-black/40">token: nfc_8Q4P</span></div> : index === 2 ? <div className="flex items-center justify-between"><span className="text-[10px] text-black/40">Skany w 30 dni</span><span className="text-lg font-semibold text-brand">84</span></div> : <div className="flex items-center justify-between gap-3 text-[10px]"><span className="font-semibold text-ink">Kasa</span><span className="text-right text-brand">84 skany · najwięcej</span></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NfcSection({ t }: { t: LandingTranslations["nfc"] }) {
  return (
    <section className="section-space overflow-hidden">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <div className="relative min-h-[350px] sm:min-h-[390px]">
          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft" />
          <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10" />
          <div className="absolute left-1/2 top-1/2 flex h-[245px] w-[175px] -translate-x-1/2 -translate-y-1/2 -rotate-6 flex-col justify-between rounded-[28px] bg-ink p-6 text-white shadow-2xl transition duration-500 hover:-rotate-2"><div className="flex items-center justify-between"><span className="text-sm font-bold">{t.cardBrand}</span><NfcWaveIcon className="h-6 w-6 text-[#A6A7FF]" /></div><div><p className="text-2xl font-semibold leading-tight tracking-tight">{t.cardTitle}</p><p className="mt-3 text-xs leading-5 text-white/50">{t.cardText}</p></div></div>
          <div className="absolute bottom-4 right-[4%] rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card sm:right-[12%]"><p className="text-[10px] text-black/40">{t.priceLabel}</p><p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-ink">{t.price} <span className="text-xs font-medium text-black/35">{t.unit}</span></p></div>
          </div>
          <div className="lg:hidden"><NfcFeatureAccordion features={t.features} /></div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="eyebrow">{t.badge}</span>
          <h2 className="section-title mt-5">{t.title}</h2>
          <p className="section-copy mt-5">
            {t.description}
          </p>
          <div className="mt-8 hidden lg:block"><NfcFeatureAccordion features={t.features} /></div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ t }: { t: LandingTranslations["pricing"] }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const isYearly = billingCycle === "yearly";
  const pricingCardHover =
    "pricing-card origin-center transition duration-300 ease-out motion-safe:hover:z-10 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01] motion-safe:hover:shadow-2xl";

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");

    if (error) {
      setCheckoutError(error);
    }
  }, []);

  return (
    <section id="cennik" className="section-space bg-[#FAFAFC]">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-5">{t.title}</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            {t.description}
          </p>
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-sm rounded-full border border-black/[0.08] bg-white p-1 shadow-sm sm:w-fit">
          {billingCycles.map((cycle) => {
            const active = billingCycle === cycle.id;

            return (
              <button
                key={cycle.id}
                type="button"
                onClick={() => setBillingCycle(cycle.id)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-5 ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-black/55 hover:bg-black/[0.04] hover:text-black"
                }`}
                aria-pressed={active}
              >
                {t.billing[cycle.id]}
              </button>
            );
          })}
        </div>
        {checkoutError && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-brand/20 bg-white px-5 py-4 text-center text-sm font-medium text-ink shadow-sm">
            {checkoutError}
          </div>
        )}
        <div className="mx-auto mt-10 grid max-w-[930px] gap-5 lg:mt-14 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          {pricingPlans.map((plan) => {
            const isBusiness = plan.id === "business";
            const price = plan.prices[billingCycle];
            const translatedPlan = t.plans[plan.id];
            const translatedPrice = translatedPlan.prices[billingCycle];
            const yearlyPrice = isYearly ? translatedPlan.prices.yearly : null;
            const featuredBadge = "featuredBadge" in translatedPlan ? translatedPlan.featuredBadge : null;

            return (
              <article
                key={plan.id}
                className={
                  isBusiness
                    ? `relative flex flex-col overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-2xl sm:p-7 lg:p-9 ${pricingCardHover}`
                    : `relative flex flex-col rounded-[28px] border border-black/[0.08] bg-white p-6 shadow-card sm:p-7 lg:p-9 ${pricingCardHover}`
                }
              >
                {isBusiness && (
                  <div className="absolute right-0 top-0 h-56 w-56 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
                )}
                <div className={isBusiness ? "relative" : undefined}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${isBusiness ? "text-[#A6A7FF]" : "text-brand"}`}>
                      {translatedPlan.title}
                    </p>
                    {(isYearly || featuredBadge) && (
                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                          isBusiness
                            ? "bg-brand text-white"
                            : "bg-brand-soft text-brand"
                        }`}
                      >
                        {isYearly ? t.yearlyBadge : featuredBadge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{translatedPlan.subtitle}</h3>
                  <p className={`mt-3 min-h-12 text-sm leading-6 ${isBusiness ? "text-white/50" : "text-black/50"}`}>
                    {translatedPlan.description}
                  </p>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-[-0.06em]">{price.price}</span>
                    <span className={`pb-1 text-sm ${isBusiness ? "text-white/40" : "text-black/40"}`}>
                      {translatedPrice.period}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="mt-4 space-y-1 text-sm">
                      <p className={isBusiness ? "font-medium text-white/75" : "font-medium text-black/70"}>
                        {yearlyPrice?.monthlyEquivalent}
                      </p>
                      <p className={isBusiness ? "text-[#A6A7FF]" : "text-brand"}>
                        {yearlyPrice?.saving}
                      </p>
                    </div>
                  )}
                </div>
                <div className={`my-8 h-px ${isBusiness ? "bg-white/10" : "bg-black/[0.07]"}`} />
                <ul className={`${isBusiness ? "relative" : ""} flex-1 space-y-4`}>
                  {translatedPlan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex gap-3 text-sm ${isBusiness ? "text-white/70" : "text-black/70"}`}
                    >
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${isBusiness ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={price.href}
                  className={
                    isBusiness
                      ? "button-primary relative mt-9 w-full bg-brand hover:bg-[#6C6DF8]"
                      : "button-secondary mt-9 w-full"
                  }
                >
                  {t.choosePrefix} {translatedPlan.name}
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-5 text-black/40">
          {t.nfcNote}
        </p>
      </div>
    </section>
  );
}

function FAQ({ t }: { t: LandingTranslations["faq"] }) {
  const [open, setOpen] = useState<number>(-1);

  return (
    <section id="faq" className="section-space">
      <div className="container-page grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-5">{t.title}</h2>
          <p className="section-copy mt-5">
            {t.description}
          </p>
        </div>
        <div className="border-t border-black/[0.08]">
          {t.items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.question} className="border-b border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left sm:gap-6 sm:py-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold sm:text-lg">{item.question}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
                      isOpen
                        ? "rotate-45 border-brand bg-brand text-white"
                        : "border-black/10 text-black/50"
                    }`}
                  >
                    <span className="text-xl font-light leading-none">+</span>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pr-12 text-sm leading-7 text-black/55">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ t }: { t: LandingTranslations["cta"] }) {
  return (
    <section className="pb-8 sm:pb-12">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[30px] bg-brand px-6 py-14 text-center text-white shadow-purple sm:px-12 sm:py-16 lg:py-20">
          <div aria-hidden="true" className="cta-orbit cta-orbit-one absolute -left-20 -top-28 h-72 w-72 rounded-full border border-white/[0.16]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-two absolute -right-24 -bottom-32 h-80 w-80 rounded-full border border-white/[0.18]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-three absolute -right-8 top-[22%] h-40 w-40 rounded-full border border-white/[0.14]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-four absolute bottom-7 left-[28%] h-28 w-28 rounded-full border border-white/[0.12]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-five absolute -right-40 -top-48 h-[26rem] w-[26rem] rounded-full border-2 border-white/[0.12]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-six absolute -bottom-44 left-[5%] h-72 w-72 rounded-full border border-white/[0.14]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-seven absolute -left-12 bottom-[18%] h-44 w-44 rounded-full border border-white/[0.1]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-eight absolute right-[30%] top-8 h-52 w-52 rounded-full border border-white/[0.1]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-nine absolute -bottom-24 right-[18%] h-64 w-64 rounded-full border border-white/[0.1]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-ten absolute -left-28 top-[38%] h-60 w-60 rounded-full border border-white/[0.1]" />
          <div aria-hidden="true" className="cta-orbit cta-orbit-eleven absolute -right-16 bottom-10 h-36 w-36 rounded-full border border-white/[0.1]" />
          <div aria-hidden="true" className="cta-orbit-dot-track cta-orbit-dot-track-one absolute -left-20 -top-28 h-72 w-72 rounded-full"><span className="cta-orbit-dot" /></div>
          <div aria-hidden="true" className="cta-orbit-dot-track cta-orbit-dot-track-two absolute -right-24 -bottom-32 h-80 w-80 rounded-full"><span className="cta-orbit-dot" /></div>
          <div aria-hidden="true" className="cta-orbit-dot-track cta-orbit-dot-track-three absolute right-[30%] top-8 h-52 w-52 rounded-full"><span className="cta-orbit-dot" /></div>
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              {t.eyebrow}
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {t.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {t.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 lg:mt-9 lg:flex-row">
              <Link href="/register" className="button-secondary w-full border-white bg-white px-7 hover:bg-white lg:w-auto">
                {t.primary}
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10 lg:w-auto"
              >
                {t.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ t, nav }: { t: LandingTranslations["footer"]; nav: LandingTranslations["nav"] }) {
  return (
    <footer className="bg-ink py-12 text-white">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-8 lg:gap-10 lg:pb-10 lg:flex-row">
          <div className="max-w-sm">
            <Logo inverse />
            <p className="mt-5 text-sm leading-6 text-white/45">
              {t.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3 sm:gap-x-12 lg:gap-x-16">
            {nav.items.map((item) => (
              <a key={item.href} href={item.href} className="text-white/55 transition hover:text-white">
                {item.label}
              </a>
            ))}
            <Link href="/login" className="text-left text-white/55 transition hover:text-white">
              {nav.login}
            </Link>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-7 text-xs text-white/35 sm:flex-row">
          <p>{t.copyright}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="transition hover:text-white">{t.privacy}</Link>
            <Link href="/terms" className="transition hover:text-white">{t.terms}</Link>
            <Link href="/cookies" className="transition hover:text-white">{t.cookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const t = landingTranslations.PL;

  return (
    <>
      <Navbar t={t} />
      <main>
        <Hero t={t} />
        <Benefits t={t.benefits} />
        <HowItWorks t={t.howItWorks} />
        <DashboardPreview t={t.dashboard} hero={t.hero} mockup={t.mockup} />
        <NfcSection t={t.nfc} />
        <Pricing t={t.pricing} />
        <FAQ t={t.faq} />
        <FinalCTA t={t.cta} />
      </main>
      <Footer t={t.footer} nav={t.nav} />
    </>
  );
}
