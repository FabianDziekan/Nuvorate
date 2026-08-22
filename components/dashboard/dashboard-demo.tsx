import {
  AppNavigationIcon,
  type AppNavigationIconName,
} from "@/components/navigation/app-navigation-icon";
import { MobileTrendChart } from "@/components/dashboard/mobile-trend-chart";

const navigation: Array<{ icon: AppNavigationIconName; label: string }> = [
  { icon: "dashboard", label: "Pulpit" },
  { icon: "reviews", label: "Opinie" },
  { icon: "analysis", label: "Analiza" },
  { icon: "responses", label: "Odpowiedzi" },
  { icon: "verification", label: "Weryfikacja autora" },
  { icon: "nfc", label: "NFC" },
  { icon: "bell", label: "Powiadomienia" },
  { icon: "settings", label: "Ustawienia" },
];

const chartPoints = [
  ["23 lip", 2], ["25 lip", 7], ["27 lip", 7], ["29 lip", 5], ["31 lip", 2],
  ["2 sie", 2], ["4 sie", 4], ["6 sie", 1], ["8 sie", 8], ["10 sie", 7],
  ["12 sie", 5], ["14 sie", 2], ["16 sie", 4], ["18 sie", 2], ["20 sie", 4],
  ["22 sie", 10], ["24 sie", 8], ["26 sie", 6], ["28 sie", 1], ["30 sie", 3],
].map(([label, value]) => ({
  averageRating: 4.4,
  label: String(label),
  tooltipLabel: String(label),
  value: Number(value),
}));

const metrics: Array<{
  detail: string;
  icon: AppNavigationIconName;
  label: string;
  tag: string;
  value: string;
}> = [
  { label: "Nowe opinie", value: "121", tag: "Ostatnie 30 dni", detail: "w wybranym okresie", icon: "reviews" },
  { label: "Średnia ocena", value: "4,4", tag: "Aktualna", detail: "w skali do 5", icon: "analysis" },
  { label: "Pozytywne opinie", value: "86%", tag: "Oceny 4–5", detail: "104 z 121 opinii", icon: "analysis" },
  { label: "Skany NFC", value: "19", tag: "Ostatnie 30 dni", detail: "skany z plakietki NFC", icon: "nfc" },
];

function PreviewBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
      <span className="text-[13px] font-bold tracking-[-0.04em] text-ink">NuvoRate</span>
    </div>
  );
}

export function DashboardDemo() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/15 bg-[#F7F7FA] p-2 shadow-[0_30px_90px_rgba(6,6,16,0.32)] sm:rounded-[30px] sm:p-3">
      <div className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-[#F7F7FA] sm:rounded-[22px]">
        <div className="flex min-h-[590px]">
          <aside className="hidden w-[178px] shrink-0 border-r border-black/[0.06] bg-white p-4 lg:flex lg:flex-col">
            <PreviewBrand />
            <p className="mt-7 text-[8px] font-semibold uppercase tracking-[0.15em] text-black/35">Twoja firma</p>
            <div className="mt-2 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
              <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-[10px] font-bold text-brand">K</span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-ink">KatoBurger</span><span className="mt-0.5 block text-[8px] text-black/35">Katowice</span></span><span className="text-sm text-black/30">⌄</span></div>
            </div>
            <p className="mt-3 text-[9px] font-semibold text-brand">Plan Business</p>
            <p className="mt-1 text-[8px] text-black/35">3 z 3 lokalizacji</p>
            <nav className="mt-5 space-y-1" aria-label="Podgląd nawigacji NuvoRate">
              {navigation.map((item, index) => <div key={item.label} className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[10px] ${index === 0 ? "bg-brand-soft font-semibold text-brand ring-1 ring-brand/10" : "text-black/45"}`}><AppNavigationIcon name={item.icon} className="h-3.5 w-3.5" /><span className="truncate">{item.label}</span></div>)}
            </nav>
            <div className="mt-auto rounded-2xl bg-ink p-3 text-white"><p className="text-[8px] text-white/45">Aktywny plan</p><div className="mt-1 flex items-center justify-between gap-2"><p className="text-[11px] font-semibold">Business</p><span className="rounded-full bg-brand px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em]">aktywny</span></div><span className="mt-3 block rounded-xl bg-white/10 px-2.5 py-2 text-center text-[8px] font-semibold">Zarządzaj subskrypcją</span></div>
          </aside>

          <main className="min-w-0 flex-1">
            <header className="flex h-12 items-center justify-between gap-3 border-b border-black/[0.06] bg-white px-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3"><div className="lg:hidden"><PreviewBrand /></div><div className="hidden lg:block"><p className="text-[8px] text-black/35">KatoBurger</p><p className="mt-0.5 text-[10px] font-semibold text-ink">Pulpit główny</p></div></div>
              <div className="flex shrink-0 items-center gap-1.5"><span className="rounded-xl border border-black/[0.07] bg-white px-2.5 py-1.5 text-[8px] font-medium text-black/50">Ostatnie 30 dni</span><span className="grid h-7 w-7 place-items-center rounded-xl border border-black/[0.07] text-black/40"><AppNavigationIcon name="bell" className="h-3.5 w-3.5" /></span><span className="hidden items-center gap-2 rounded-xl border border-black/[0.07] py-1 pl-1 pr-2 sm:flex"><span className="grid h-5 w-5 place-items-center rounded-md bg-brand-soft text-[7px] font-bold text-brand">AR</span><span className="text-[8px] font-semibold text-ink">Plan Business</span></span></div>
            </header>

            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h3 className="text-lg font-semibold tracking-[-0.045em] text-ink sm:text-2xl">Dzień dobry, Arek</h3><p className="mt-1 text-[9px] text-black/40 sm:text-[10px]">Podsumowanie reputacji firmy KatoBurger.</p></div><div className="text-left sm:text-right"><span className="inline-flex rounded-xl bg-brand px-3 py-2 text-[9px] font-semibold text-white shadow-sm">Synchronizuj z Google</span><p className="mt-1.5 text-[8px] text-black/35">Synchronizacja opinii: wkrótce</p></div></div>

              <section className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4" aria-label="Najważniejsze statystyki">
                {metrics.map((metric) => <article key={metric.label} className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_8px_30px_rgba(15,15,16,0.025)]"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="min-h-5 text-[8px] font-medium leading-3 text-black/40">{metric.label}</p><p className="mt-1 text-lg font-semibold tracking-[-0.05em] text-ink sm:text-xl">{metric.value}</p></div><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><AppNavigationIcon name={metric.icon} className="h-3.5 w-3.5" /></span></div><div className="mt-2 flex items-end justify-between gap-2"><span className="rounded-full bg-emerald-50 px-1.5 py-1 text-[7px] font-semibold text-emerald-700">{metric.tag}</span><span className="hidden text-right text-[7px] text-black/30 xl:block">{metric.detail}</span></div></article>)}
              </section>

              <section className="mt-3 rounded-[22px] border border-black/[0.06] bg-white p-3.5 shadow-[0_8px_30px_rgba(15,15,16,0.025)] sm:p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-[8px] font-medium uppercase tracking-[0.12em] text-black/35">Limity planu</p><h4 className="mt-1 text-sm font-semibold tracking-tight text-ink">Miesięczne limity planu</h4><p className="mt-1 text-[8px] text-black/35">Limity odnawiają się na początku każdego miesiąca.</p></div><span className="rounded-full bg-brand-soft px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-brand">Plan Business</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{[{ label: "Odpowiedzi na opinie", remaining: "210 pozostało", percent: "40%" }, { label: "Analizy reputacji", remaining: "16 pozostało", percent: "68%" }].map((limit) => <div key={limit.label} className="rounded-xl border border-black/[0.06] bg-[#FAFAFC] p-2.5"><div className="flex items-center justify-between gap-2"><p className="text-[8px] font-semibold text-ink">{limit.label}</p><p className="text-[8px] font-semibold text-brand">{limit.remaining}</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]"><span className="block h-full rounded-full bg-brand" style={{ width: limit.percent }} /></div><p className="mt-1 text-[7px] text-black/35">{limit.percent} limitu</p></div>)}</div>
              </section>

              <section className="mt-3 grid gap-3 lg:grid-cols-[1.55fr_0.78fr]">
                <article className="rounded-[22px] border border-black/[0.06] bg-white p-3.5 shadow-[0_8px_30px_rgba(15,15,16,0.025)] sm:p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[8px] font-medium uppercase tracking-[0.12em] text-black/35">Nowe opinie</p><h4 className="mt-1 text-sm font-semibold tracking-tight text-ink">Nowe opinie w czasie</h4></div><div className="hidden items-center gap-3 text-[8px] sm:flex"><span className="flex items-center gap-1.5 text-black/50"><i className="h-1.5 w-1.5 rounded-full bg-brand" />Bieżący okres</span><span className="flex items-center gap-1.5 text-black/25"><i className="h-1.5 w-1.5 rounded-full bg-black/15" />Poprzedni okres</span></div></div><MobileTrendChart points={chartPoints} /></article>
                <article className="rounded-[22px] bg-ink p-3.5 text-white shadow-[0_8px_30px_rgba(15,15,16,0.12)] sm:p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[8px] font-medium uppercase tracking-[0.12em] text-white/45">Inteligentna analiza</p><h4 className="mt-1 text-sm font-semibold tracking-tight">Analiza ostatnich 30 dni</h4></div><span className="rounded-full bg-brand/25 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#C7C8FF]">Business</span></div><p className="mt-3 text-[8px] leading-4 text-white/45">Analiza na podstawie 139 opinii<br />Ostatnia aktualizacja: 13.08.2026</p><p className="mt-4 text-[8px] font-semibold text-[#C7C8FF]">Podsumowanie</p><p className="mt-2 text-[9px] leading-5 text-white/80">KatoBurger ma bardzo dobrą reputację. Klienci szczególnie doceniają smak burgerów, jakość mięsa i świeżość składników.</p><div className="mt-3 border-t border-white/10 pt-3 text-[8px] text-white/55"><span className="font-semibold text-white/80">Najważniejszy sygnał:</span> warto obserwować czas oczekiwania w godzinach szczytu.</div></article>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
