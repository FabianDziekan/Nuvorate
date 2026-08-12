"use client";

import { useEffect, useState } from "react";
import { MobileTrendChart } from "@/components/dashboard/mobile-trend-chart";

const chartPoints = [
  ["1 lip", 2], ["4 lip", 4], ["7 lip", 3], ["10 lip", 6], ["13 lip", 5], ["16 lip", 8], ["19 lip", 6], ["22 lip", 9], ["25 lip", 7], ["28 lip", 11],
].map(([label, value]) => ({ averageRating: 4.6, label: String(label), tooltipLabel: String(label), value: Number(value) }));

const navigation = ["Pulpit", "Opinie", "Analiza", "Odpowiedzi", "NFC"];

export function DashboardDemo() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setStage((current) => (current + 1) % 4), 5000);
    return () => window.clearInterval(interval);
  }, []);

  const response = "Dziękujemy za opinię. Cieszymy się, że doceniasz naszą obsługę.";
  const typedResponse = stage >= 2 ? response.slice(0, Math.min(response.length, (stage - 1) * 34)) : "";

  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.08] bg-[#F7F7FA] p-2 shadow-soft sm:rounded-[30px] sm:p-3">
      <div className="flex min-h-[580px] overflow-hidden rounded-[20px] border border-black/[0.06] bg-white sm:rounded-[22px]">
        <aside className="hidden w-[164px] shrink-0 border-r border-black/[0.06] bg-[#FCFCFE] p-4 lg:block">
          <div className="flex items-center gap-2"><img src="/brand/nuvorate-logo.png" alt="" aria-hidden="true" className="h-7 w-7 rounded-lg object-contain" /><span className="text-[11px] font-bold text-ink">NuvoRate</span></div>
          <div className="mt-7 space-y-1.5">{navigation.map((item, index) => <div key={item} className={`rounded-xl px-3 py-2 text-[10px] ${index === 0 ? "bg-brand-soft font-semibold text-brand" : "text-black/40"}`}>{item}</div>)}</div>
          <div className="mt-16 rounded-2xl bg-ink p-3 text-white"><p className="text-[8px] text-white/45">Twój plan</p><p className="mt-1 text-[10px] font-semibold">Business aktywny</p></div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Pulpit</p><h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-ink">Dzień dobry, Anno</h3><p className="mt-1 text-[10px] text-black/40">Podsumowanie reputacji firmy.</p></div><span className="rounded-xl border border-black/[0.07] bg-white px-3 py-2 text-[9px] font-medium text-black/45">Ostatnie 30 dni</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Nowe opinie", "49"], ["Średnia ocena", "4,6"], ["Pozytywne", "92%"], ["Skany NFC", "148"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3"><p className="text-[9px] text-black/40">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">{value}</p></div>)}</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-black/[0.06] bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-black/35">Nowe opinie</p><h4 className="mt-1 text-sm font-semibold text-ink">Nowe opinie w czasie</h4></div><span className="text-[9px] font-semibold text-brand">Ostatnie 30 dni</span></div><MobileTrendChart points={chartPoints} /></section>
            <section className="rounded-2xl bg-ink p-4 text-white"><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/45">Analiza ostatnich 30 dni</p><p className="mt-2 text-lg font-semibold">91<span className="ml-1 text-xs text-white/45">/100</span></p><p className="mt-3 text-[10px] leading-4 text-white/65">Klienci najczęściej chwalą obsługę. Warto obserwować czas oczekiwania.</p><div className={`mt-4 rounded-xl bg-white/[0.08] px-3 py-2 text-[9px] transition-all duration-500 ${stage === 1 ? "border border-brand/40" : ""}`}>Mocna strona: obsługa</div><div className={`mt-2 rounded-xl bg-white/[0.08] px-3 py-2 text-[9px] transition-all duration-500 ${stage === 1 ? "border border-brand/40" : ""}`}>Problem: czas oczekiwania</div></section>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section className={`rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4 transition-all duration-500 ${stage === 0 ? "border-brand/30 shadow-card" : ""}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[10px] font-semibold text-brand">AK</span><div><p className="text-[10px] font-semibold text-ink">Anna K.</p><p className="mt-0.5 text-[8px] text-black/35">Google · przed chwilą</p></div></div><span className="rounded-full bg-brand-soft px-2 py-1 text-[9px] font-semibold text-brand">5,0 ★</span></div><p className="mt-3 text-[10px] leading-4 text-black/60">Świetna obsługa i bardzo miła atmosfera.</p></section>
            <section className={`rounded-2xl border border-brand/15 bg-brand-soft/55 p-4 transition-all duration-500 ${stage >= 2 ? "border-brand/35 shadow-card" : ""}`}><div className="flex items-center justify-between"><p className="text-[9px] font-medium uppercase tracking-[0.12em] text-brand">Propozycja odpowiedzi</p><span className="rounded-lg bg-white px-2 py-1 text-[8px] font-semibold text-brand">Odpowiedź</span></div><p className="mt-3 min-h-8 text-[10px] leading-4 text-black/60">{typedResponse}{stage === 2 && typedResponse.length < response.length ? <span className="ml-0.5 inline-block h-2.5 w-px bg-brand align-middle" /> : null}</p></section>
          </div>
          <div className={`mt-4 flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-[10px] transition-all duration-500 ${stage === 3 ? "border-brand/30 shadow-card" : ""}`}><span className="font-semibold text-ink">Reputacja firmy pod kontrolą</span><span className="font-semibold text-[#198754]">+4 pkt w tym miesiącu</span></div>
        </main>
      </div>
    </div>
  );
}
