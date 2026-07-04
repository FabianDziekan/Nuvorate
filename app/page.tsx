"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  billingCycles,
  pricingPlans,
  type BillingCycle,
} from "@/lib/pricing";

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

const navItems = [
  { label: "Funkcje", href: "#funkcje" },
  { label: "Jak działa", href: "#jak-dziala" },
  { label: "Cennik", href: "#cennik" },
  { label: "FAQ", href: "#faq" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<"PL" | "EN">("PL");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-[74px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Główna nawigacja">
          {navItems.map((item) => (
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
            aria-label="Wybór języka"
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
            Zaloguj się
          </Link>
          <Link href="/register" className="button-primary min-h-10 px-5 py-2.5">
            Załóż konto
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-full border border-black/10 lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <div className="border-t border-black/[0.06] bg-white px-5 pb-6 pt-4 shadow-card lg:hidden">
          <nav className="mx-auto flex max-w-[1240px] flex-col" aria-label="Menu mobilne">
            {navItems.map((item) => (
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
              <span className="text-sm text-black/50">Język</span>
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
                Zaloguj się
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="button-primary px-3">
                Załóż konto
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function MiniChart({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative w-full ${compact ? "h-24" : "h-36"}`}>
      <svg
        aria-label="Wykres wzrostu liczby opinii"
        className="h-full w-full overflow-visible"
        viewBox="0 0 500 150"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={compact ? "areaCompact" : "area"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B5CF6" stopOpacity=".22" />
            <stop offset="100%" stopColor="#5B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 65, 105, 145].map((y) => (
          <line
            key={y}
            x1="0"
            x2="500"
            y1={y}
            y2={y}
            stroke="#0F0F10"
            strokeOpacity=".06"
            strokeDasharray="4 6"
          />
        ))}
        <path
          d="M0 124 C40 118,65 106,95 111 S145 92,180 96 S230 79,265 83 S315 58,350 68 S405 38,500 27 L500 150 L0 150 Z"
          fill={`url(#${compact ? "areaCompact" : "area"})`}
        />
        <path
          d="M0 124 C40 118,65 106,95 111 S145 92,180 96 S230 79,265 83 S315 58,350 68 S405 38,500 27"
          fill="none"
          stroke="#5B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {[95, 180, 265, 350, 500].map((x, index) => {
          const ys = [111, 96, 83, 68, 27];
          return (
            <g key={x}>
              <circle cx={x} cy={ys[index]} r="5.5" fill="white" stroke="#5B5CF6" strokeWidth="3" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const metrics = [
  { label: "Nowe opinie", value: "24", change: "+20%", icon: "quote" as IconName },
  { label: "Średnia ocena", value: "4,7", change: "+0,2", icon: "star" as IconName },
  { label: "Pozytywne", value: "86%", change: "+6%", icon: "trend" as IconName },
  { label: "Skany NFC", value: "148", change: "+32%", icon: "nfc" as IconName },
];

function DashboardMockup({ hero = false }: { hero?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-black/[0.08] bg-[#F7F7FA] shadow-soft ${
        hero ? "min-w-[760px] origin-top-left scale-[0.58] sm:scale-[0.72] lg:scale-[0.83]" : ""
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
          BUSINESS
        </span>
      </div>
      <div className="flex min-h-[480px]">
        <aside className="w-[142px] shrink-0 border-r border-black/[0.06] bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white">
              <span className="text-[10px] font-bold">N</span>
            </span>
            <span className="text-[11px] font-bold">NuvoRate</span>
          </div>
          <div className="mt-8 space-y-2 text-[10px]">
            {["Pulpit", "Opinie", "Analiza", "NFC", "Powiadomienia"].map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${
                  index === 0 ? "bg-brand-soft font-semibold text-brand" : "text-black/40"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-brand" : "bg-black/15"}`} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-32 rounded-xl bg-ink p-3 text-white">
            <p className="text-[8px] text-white/50">Twój plan</p>
            <p className="mt-1 text-[10px] font-semibold">Business</p>
            <div className="mt-2 h-1 rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-brand" />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-black/35">Restauracja Nova</p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight">Dzień dobry, Anno</h3>
            </div>
            <div className="rounded-lg border border-black/[0.07] bg-white px-3 py-2 text-[9px] text-black/50">
              Ostatnie 30 dni
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2.5">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-black/[0.06] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-medium text-black/40">{metric.label}</span>
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-soft text-brand">
                    <Icon name={metric.icon} className="h-3 w-3" />
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-[19px] font-semibold tracking-tight">{metric.value}</span>
                  <span className="rounded-full bg-[#EAF9F1] px-1.5 py-0.5 text-[8px] font-semibold text-[#198754]">
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1.45fr_0.75fr] gap-3">
            <div className="rounded-xl border border-black/[0.06] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-medium text-black/40">NOWE OPINIE</p>
                  <p className="mt-1 text-[12px] font-semibold">Trend reputacji</p>
                </div>
                <span className="text-[8px] text-black/35">vs poprzedni okres</span>
              </div>
              <MiniChart compact />
              <div className="flex justify-between text-[7px] text-black/25">
                <span>1 maj</span><span>8 maj</span><span>15 maj</span><span>22 maj</span><span>30 maj</span>
              </div>
            </div>
            <div className="rounded-xl bg-ink p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-white/50">ANALIZA AI</span>
                <Icon name="spark" className="h-3.5 w-3.5 text-[#A6A7FF]" />
              </div>
              <p className="mt-4 text-[11px] font-semibold leading-4">
                Klienci najczęściej chwalą obsługę i atmosferę.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  ["Miła obsługa", "82%"],
                  ["Atmosfera", "71%"],
                  ["Jakość", "64%"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="flex justify-between text-[7px] text-white/50">
                      <span>{label}</span><span>{value}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-black/[0.06] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-black/40">OSTATNIE OPINIE</p>
                <p className="mt-1 text-[11px] font-semibold">Najnowsze głosy klientów</p>
              </div>
              <span className="rounded-lg bg-brand-soft px-2.5 py-1.5 text-[8px] font-semibold text-brand">
                Zobacz wszystkie
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Anna K.", "Świetna obsługa i bardzo miła atmosfera.", "5,0"],
                ["Marek P.", "Dobre miejsce, wrócę ponownie.", "4,0"],
              ].map(([name, text, rating]) => (
                <div key={name} className="rounded-lg bg-[#F8F8FA] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-semibold">{name}</span>
                    <span className="text-[8px] font-semibold text-brand">{rating} ★</span>
                  </div>
                  <p className="mt-1.5 text-[8px] leading-3 text-black/45">{text}</p>
                  <button type="button" className="mt-2 text-[7px] font-semibold text-brand">
                    Wygeneruj odpowiedź
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

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40 lg:min-h-[850px] lg:pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_70%_28%,rgba(91,92,246,0.13),transparent_34%),radial-gradient(circle_at_10%_35%,rgba(91,92,246,0.06),transparent_26%)]" />
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div className="max-w-[650px] animate-fade-up">
          <span className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse-soft" />
            Platforma do zarządzania reputacją
          </span>
          <h1 className="mt-7 text-balance text-[46px] font-semibold leading-[1.03] tracking-[-0.055em] text-ink sm:text-6xl lg:text-[72px]">
            Więcej opinii.{" "}
            <span className="text-brand">Większe zaufanie.</span> Więcej klientów.
          </h1>
          <p className="mt-7 max-w-[590px] text-pretty text-lg leading-8 text-black/60 sm:text-xl">
            Zbieraj opinie, monitoruj reputację i szybciej reaguj na głos klientów.
            Wszystko, czego potrzebujesz, w jednym przejrzystym panelu.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="button-primary">
              Załóż konto
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <a href="#dashboard" className="button-secondary">
              Zobacz dashboard
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-black/45">
            {["Proste wdrożenie", "Dane w jednym miejscu", "NFC jako opcja"].map((item) => (
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
            <DashboardMockup hero />
          </div>
          <div className="absolute bottom-2 right-2 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card sm:bottom-10 sm:right-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF9F1] text-[#198754]">
                <Icon name="trend" />
              </span>
              <div>
                <p className="text-xs text-black/40">Reputacja rośnie</p>
                <p className="mt-0.5 text-sm font-semibold">+20% nowych opinii</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const benefits = [
  {
    icon: "quote" as IconName,
    title: "Więcej opinii",
    text: "Ułatw klientom podzielenie się doświadczeniem i buduj regularny dopływ nowych rekomendacji.",
  },
  {
    icon: "shield" as IconName,
    title: "Większe zaufanie",
    text: "Aktualne, autentyczne opinie wzmacniają wiarygodność firmy w oczach nowych klientów.",
  },
  {
    icon: "clock" as IconName,
    title: "Oszczędność czasu",
    text: "Powiadomienia i gotowe podsumowania pomagają szybciej zauważać to, co naprawdę ważne.",
  },
  {
    icon: "data" as IconName,
    title: "Wszystko w jednym miejscu",
    text: "Opinie, statystyki, trendy i odpowiedzi masz zawsze pod ręką w jednym panelu.",
  },
];

function Benefits() {
  return (
    <section id="funkcje" className="section-space border-y border-black/[0.05] bg-[#FAFAFC]">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Korzyści</span>
          <h2 className="section-title mt-5">Reputacja, która pracuje na rozwój Twojej firmy</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            NuvoRate porządkuje cały proces zarządzania opiniami, aby każda informacja
            prowadziła do lepszej decyzji.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className="group rounded-[24px] border border-black/[0.06] bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand/20"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                <Icon name={benefit.icon} />
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

const steps = [
  {
    title: "Klient wystawia opinię",
    text: "Udostępniasz link lub opcjonalną plakietkę NFC, a klient przechodzi prostą ścieżkę dodania opinii.",
  },
  {
    title: "NuvoRate monitoruje",
    text: "Nowe oceny i komentarze trafiają do jednego uporządkowanego panelu.",
  },
  {
    title: "NuvoRate analizuje",
    text: "Platforma pokazuje trendy, mocne strony i powtarzające się problemy.",
  },
  {
    title: "Otrzymujesz gotowe informacje",
    text: "Wiesz, co wymaga reakcji, gdzie firma rośnie i jakie działania warto podjąć.",
  },
];

function HowItWorks() {
  return (
    <section id="jak-dziala" className="section-space">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span className="eyebrow">Jak działa</span>
            <h2 className="section-title mt-5">Od opinii klienta do lepszej decyzji</h2>
            <p className="section-copy mt-5">
              NuvoRate zamienia rozproszone komentarze w prosty, powtarzalny proces
              zarządzania reputacją.
            </p>
            <a href="#cennik" className="button-secondary mt-8">
              Zobacz dostępne plany
              <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
          <div className="relative">
            <div className="absolute bottom-12 left-6 top-12 hidden w-px bg-gradient-to-b from-brand/0 via-brand/25 to-brand/0 sm:block" />
            <div className="space-y-4">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-card sm:pl-20"
                >
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand text-sm font-bold text-white shadow-purple sm:absolute sm:left-6 sm:top-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                    Krok {index + 1}
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

function DashboardPreview() {
  return (
    <section id="dashboard" className="section-space overflow-hidden bg-ink text-white">
      <div className="container-page">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A6A7FF]">
              Dashboard NuvoRate
            </span>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Cała reputacja Twojej firmy. Jeden czytelny widok.
            </h2>
          </div>
          <p className="text-base leading-7 text-white/55 sm:text-lg">
            Najważniejsze statystyki, najnowsze opinie, powiadomienia i inteligentna
            analiza. Od razu widzisz, co działa i co wymaga Twojej uwagi.
          </p>
        </div>
        <div className="relative mt-14">
          <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,rgba(91,92,246,0.25),transparent_55%)]" />
          <div className="relative mx-auto max-w-[1050px] rounded-[30px] border border-white/10 bg-white/[0.04] p-2 shadow-2xl sm:p-4">
            <DashboardMockup />
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Analiza opinii", "Najczęściej chwalone elementy i problemy widoczne bez ręcznego czytania każdej opinii."],
            ["Generowanie odpowiedzi", "Profesjonalna propozycja odpowiedzi jednym kliknięciem, zawsze z możliwością edycji."],
            ["Ważne powiadomienia", "Nowa opinia, negatywna ocena i spadek średniej trafiają od razu na Twój radar."],
          ].map(([title, text], index) => (
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

function NfcSection() {
  return (
    <section className="section-space overflow-hidden">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-2 min-h-[440px] lg:order-1">
          <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10" />
          <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15" />
          <div className="absolute left-1/2 top-1/2 flex h-[260px] w-[180px] -translate-x-1/2 -translate-y-1/2 -rotate-6 flex-col justify-between rounded-[28px] bg-ink p-6 text-white shadow-2xl transition duration-500 hover:-rotate-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">NuvoRate</span>
              <Icon name="nfc" className="h-7 w-7 text-[#A6A7FF]" />
            </div>
            <div>
              <div className="mb-5 flex text-[#A6A7FF]">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Icon key={item} name="star" className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-2xl font-semibold leading-tight tracking-tight">
                Podziel się swoją opinią
              </p>
              <p className="mt-3 text-xs leading-5 text-white/50">
                Zbliż telefon i oceń wizytę.
              </p>
            </div>
          </div>
          <div className="absolute right-[5%] top-[20%] rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card animate-float sm:right-[12%]">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon name="nfc" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] text-black/40">Skan NFC</p>
                <p className="text-sm font-semibold">Gotowe w 2 sekundy</p>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="eyebrow">Opcjonalny dodatek</span>
          <h2 className="section-title mt-5">Jeszcze prostsza droga do opinii</h2>
          <p className="section-copy mt-5">
            Plakietki NFC pomagają wykorzystać moment, w którym klient jest najbardziej
            gotowy podzielić się doświadczeniem. Jedno zbliżenie telefonu prowadzi go
            prosto do opinii.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Prosta konfiguracja z kontem NuvoRate",
              "Liczba skanów widoczna w dashboardzie",
              "Idealne do lokali i punktów usługowych",
              "NFC wspiera abonament, ale nie jest wymagane",
            ].map((item) => (
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
              <p className="text-sm text-black/45">Plakietki NFC</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">
                od 10 zł <span className="text-base font-medium text-black/35">/ szt.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const isYearly = billingCycle === "yearly";

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
          <span className="eyebrow">Prosty cennik</span>
          <h2 className="section-title mt-5">Wybierz plan dla swojej firmy</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Zacznij od podstawowego monitorowania albo wybierz pełną analizę reputacji.
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
                {cycle.label}
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
            const yearlyPrice = isYearly ? plan.prices.yearly : null;
            const featuredBadge =
              "featuredBadge" in plan ? plan.featuredBadge : null;

            return (
              <article
                key={plan.id}
                className={
                  isBusiness
                    ? "relative flex flex-col overflow-hidden rounded-[28px] bg-ink p-7 text-white shadow-2xl sm:p-9"
                    : "flex flex-col rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-card sm:p-9"
                }
              >
                {isBusiness && (
                  <div className="absolute right-0 top-0 h-56 w-56 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
                )}
                <div className={isBusiness ? "relative" : undefined}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${isBusiness ? "text-[#A6A7FF]" : "text-brand"}`}>
                      {plan.title}
                    </p>
                    {(isYearly || featuredBadge) && (
                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                          isBusiness
                            ? "bg-brand text-white"
                            : "bg-brand-soft text-brand"
                        }`}
                      >
                        {isYearly ? "Najlepsza wartość" : featuredBadge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{plan.subtitle}</h3>
                  <p className={`mt-3 min-h-12 text-sm leading-6 ${isBusiness ? "text-white/50" : "text-black/50"}`}>
                    {plan.description}
                  </p>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-[-0.06em]">{price.price}</span>
                    <span className={`pb-1 text-sm ${isBusiness ? "text-white/40" : "text-black/40"}`}>
                      {price.period}
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
                  {plan.features.map((feature) => (
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
                  Wybierz {plan.name}
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-5 text-black/40">
          Plakietki NFC są opcjonalnym dodatkiem dostępnym od 10 zł za sztukę.
          Szczegółowe zasady rozliczeń zostaną podane przed uruchomieniem sprzedaży.
        </p>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "Czym jest NuvoRate?",
    answer:
      "NuvoRate to platforma do zbierania opinii, monitorowania reputacji online i analizowania informacji zwrotnych klientów w jednym panelu.",
  },
  {
    question: "Czy plakietka NFC jest potrzebna do korzystania z NuvoRate?",
    answer:
      "Nie. Głównym produktem NuvoRate jest abonament. Plakietka NFC jest opcjonalnym dodatkiem, który ułatwia klientom przejście do wystawienia opinii.",
  },
  {
    question: "Czym różni się Starter od Business?",
    answer:
      "Starter zapewnia podstawowy dashboard, monitoring opinii, statystyki i powiadomienia. Business rozszerza platformę o inteligentną analizę, automatyczne podsumowania oraz zaawansowane funkcje zarządzania reputacją.",
  },
  {
    question: "Co zobaczę w dashboardzie?",
    answer:
      "Między innymi liczbę nowych opinii, średnią ocenę, udział opinii pozytywnych, liczbę skanów NFC, trendy, ostatnie opinie i najważniejsze alerty.",
  },
  {
    question: "Czy NuvoRate może przygotować odpowiedź na opinię?",
    answer:
      "Tak. Platforma może wygenerować propozycję odpowiedzi dopasowaną do oceny i treści opinii. Zawsze możesz ją sprawdzić oraz edytować przed publikacją.",
  },
  {
    question: "Dla jakich firm jest NuvoRate?",
    answer:
      "Dla firm, które rozwijają się dzięki zaufaniu klientów, między innymi restauracji, salonów beauty, barberów, hoteli i firm usługowych.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="section-space">
      <div className="container-page grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mt-5">Najczęściej zadawane pytania</h2>
          <p className="section-copy mt-5">
            Krótko i konkretnie o produkcie, planach oraz opcjonalnych plakietkach NFC.
          </p>
        </div>
        <div className="border-t border-black/[0.08]">
          {faqItems.map((item, index) => {
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

function FinalCTA() {
  return (
    <section className="pb-8 sm:pb-12">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[30px] bg-brand px-6 py-16 text-center text-white shadow-purple sm:px-12 sm:py-20">
          <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-24 -bottom-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Reputacja pod kontrolą
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Zacznij świadomie rozwijać reputację swojej firmy
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Zbieraj więcej opinii, reaguj szybciej i korzystaj z jednego miejsca do
              monitorowania tego, co klienci mówią o Twojej firmie.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="button-secondary border-white bg-white px-7 hover:bg-white">
                Załóż konto
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Zobacz dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink py-12 text-white">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 md:flex-row">
          <div className="max-w-sm">
            <Logo inverse />
            <p className="mt-5 text-sm leading-6 text-white/45">
              Profesjonalna platforma do zarządzania opiniami i reputacją online.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm sm:grid-cols-3">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-white/55 transition hover:text-white">
                {item.label}
              </a>
            ))}
            <Link href="/login" className="text-left text-white/55 transition hover:text-white">
              Zaloguj się
            </Link>
            <span className="text-white/55">PL / EN</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-7 text-xs text-white/35 sm:flex-row">
          <p>© 2026 NuvoRate. Wszystkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            <span>Polityka prywatności</span>
            <span>Regulamin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <DashboardPreview />
        <NfcSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
