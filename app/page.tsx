"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  billingCycles,
  pricingPlans,
  type BillingCycle,
} from "@/lib/pricing";
import {
  landingTranslations,
  type LandingLanguage,
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

function Navbar({
  language,
  setLanguage,
  t,
}: {
  language: LandingLanguage;
  setLanguage: (language: LandingLanguage) => void;
  t: LandingTranslations;
}) {
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
          <div
            className="flex rounded-full border border-black/10 bg-black/[0.025] p-1"
            aria-label={t.aria.languageSelect}
          >
            {(["PL", "EN"] as const).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setLanguage(item)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  language === item
                    ? "bg-white text-ink shadow-sm"
                    : "text-black/40 hover:text-ink"
                }`}
                aria-pressed={language === item}
              >
                {item}
              </button>
            ))}
          </div>
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
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-black/50">{t.nav.language}</span>
              <div className="flex rounded-full bg-black/[0.04] p-1">
                {(["PL", "EN"] as const).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setLanguage(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      language === item ? "bg-white shadow-sm" : "text-black/40"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
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

function Hero({ t }: { t: LandingTranslations }) {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40 lg:min-h-[850px] lg:pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_70%_28%,rgba(91,92,246,0.13),transparent_34%),radial-gradient(circle_at_10%_35%,rgba(91,92,246,0.06),transparent_26%)]" />
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div className="max-w-[650px] animate-fade-up">
          <span className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse-soft" />
            {t.hero.eyebrow}
          </span>
          <h1 className="mt-7 text-balance text-[46px] font-semibold leading-[1.03] tracking-[-0.055em] text-ink sm:text-6xl lg:text-[72px]">
            {t.hero.titleStart}{" "}
            <span className="text-brand">{t.hero.titleHighlight}</span> {t.hero.titleEnd}
          </h1>
          <p className="mt-7 max-w-[590px] text-pretty text-lg leading-8 text-black/60 sm:text-xl">
            {t.hero.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="button-primary">
              {t.hero.primaryCta}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <a href="#dashboard" className="button-secondary">
              {t.hero.secondaryCta}
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-black/45">
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
        <div className="relative h-[465px] sm:h-[565px] lg:h-[610px]">
          <div className="absolute -left-20 top-0 animate-float sm:left-0 lg:-left-4">
            <DashboardMockup hero t={t.mockup} />
          </div>
          <div className="absolute bottom-2 right-2 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card sm:bottom-10 sm:right-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF9F1] text-[#198754]">
                <Icon name="trend" />
              </span>
              <div>
                <p className="text-xs text-black/40">{t.hero.floatingLabel}</p>
                <p className="mt-0.5 text-sm font-semibold">{t.hero.floatingValue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits({ t }: { t: LandingTranslations["benefits"] }) {
  return (
    <section id="funkcje" className="section-space border-y border-black/[0.05] bg-[#FAFAFC]">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-5">{t.title}</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            {t.description}
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((benefit, index) => (
            <article
              key={benefit.title}
              className="group rounded-[24px] border border-black/[0.06] bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand/20"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                <Icon name={benefit.icon as IconName} />
              </span>
              <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em]">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/55">{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ t }: { t: LandingTranslations["howItWorks"] }) {
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
            <div className="absolute bottom-12 left-6 top-12 hidden w-px bg-gradient-to-b from-brand/0 via-brand/25 to-brand/0 sm:block" />
            <div className="space-y-4">
              {t.steps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-card sm:pl-20"
                >
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand text-sm font-bold text-white shadow-purple sm:absolute sm:left-6 sm:top-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                    {t.stepLabel} {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview({ t, mockup }: { t: LandingTranslations["dashboard"]; mockup: LandingTranslations["mockup"] }) {
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
        <div className="relative mt-14">
          <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,rgba(91,92,246,0.25),transparent_55%)]" />
          <div className="relative mx-auto max-w-[1050px] rounded-[30px] border border-white/10 bg-white/[0.04] p-2 shadow-2xl sm:p-4">
            <DashboardMockup t={mockup} />
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

function NfcSection({ t }: { t: LandingTranslations["nfc"] }) {
  return (
    <section className="section-space overflow-hidden">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-2 min-h-[440px] lg:order-1">
          <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10" />
          <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15" />
          <div className="absolute left-1/2 top-1/2 flex h-[260px] w-[180px] -translate-x-1/2 -translate-y-1/2 -rotate-6 flex-col justify-between rounded-[28px] bg-ink p-6 text-white shadow-2xl transition duration-500 hover:-rotate-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{t.cardBrand}</span>
              <Icon name="nfc" className="h-7 w-7 text-[#A6A7FF]" />
            </div>
            <div>
              <div className="mb-5 flex text-[#A6A7FF]">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Icon key={item} name="star" className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-2xl font-semibold leading-tight tracking-tight">
                {t.cardTitle}
              </p>
              <p className="mt-3 text-xs leading-5 text-white/50">
                {t.cardText}
              </p>
            </div>
          </div>
          <div className="absolute right-[5%] top-[20%] rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card animate-float sm:right-[12%]">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon name="nfc" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] text-black/40">{t.floatingLabel}</p>
                <p className="text-sm font-semibold">{t.floatingValue}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="eyebrow">{t.badge}</span>
          <h2 className="section-title mt-5">{t.title}</h2>
          <p className="section-copy mt-5">
            {t.description}
          </p>
          <div className="mt-8 space-y-4">
            {t.bullets.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-9 flex items-end gap-4">
            <div>
              <p className="text-sm text-black/45">{t.priceLabel}</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">
                {t.price} <span className="text-base font-medium text-black/35">{t.unit}</span>
              </p>
            </div>
          </div>
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
        <div className="mx-auto mt-8 flex w-fit rounded-full border border-black/[0.08] bg-white p-1 shadow-sm">
          {billingCycles.map((cycle) => {
            const active = billingCycle === cycle.id;

            return (
              <button
                key={cycle.id}
                type="button"
                onClick={() => setBillingCycle(cycle.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
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
        <div className="mx-auto mt-14 grid max-w-[930px] gap-6 lg:grid-cols-2 lg:items-stretch">
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
                    ? `relative flex flex-col overflow-hidden rounded-[28px] bg-ink p-7 text-white shadow-2xl sm:p-9 ${pricingCardHover}`
                    : `relative flex flex-col rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-card sm:p-9 ${pricingCardHover}`
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
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
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
        <div className="relative overflow-hidden rounded-[30px] bg-brand px-6 py-16 text-center text-white shadow-purple sm:px-12 sm:py-20">
          <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-24 -bottom-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              {t.eyebrow}
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {t.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {t.description}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="button-secondary border-white bg-white px-7 hover:bg-white">
                {t.primary}
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 md:flex-row">
          <div className="max-w-sm">
            <Logo inverse />
            <p className="mt-5 text-sm leading-6 text-white/45">
              {t.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm sm:grid-cols-3">
            {nav.items.map((item) => (
              <a key={item.href} href={item.href} className="text-white/55 transition hover:text-white">
                {item.label}
              </a>
            ))}
            <Link href="/login" className="text-left text-white/55 transition hover:text-white">
              {nav.login}
            </Link>
            <span className="text-white/55">{t.language}</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-7 text-xs text-white/35 sm:flex-row">
          <p>{t.copyright}</p>
          <div className="flex gap-6">
            <span>{t.privacy}</span>
            <span>{t.terms}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [language, setLanguageState] = useState<LandingLanguage>("PL");
  const t = landingTranslations[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("nuvorate-landing-language");

    if (savedLanguage === "PL" || savedLanguage === "EN") {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: LandingLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("nuvorate-landing-language", nextLanguage);
  };

  return (
    <>
      <Navbar language={language} setLanguage={setLanguage} t={t} />
      <main>
        <Hero t={t} />
        <Benefits t={t.benefits} />
        <HowItWorks t={t.howItWorks} />
        <DashboardPreview t={t.dashboard} mockup={t.mockup} />
        <NfcSection t={t.nfc} />
        <Pricing t={t.pricing} />
        <FAQ t={t.faq} />
        <FinalCTA t={t.cta} />
      </main>
      <Footer t={t.footer} nav={t.nav} />
    </>
  );
}
