"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveBusinessAction } from "@/app/active-business/actions";
import { createBusinessLocationAction } from "@/app/business-locations/actions";

export type SwitcherBusiness = {
  id: string;
  name: string | null;
  industry: string | null;
  city: string | null;
};

type DesktopBusinessSwitcherClientProps = {
  activeBusiness: SwitcherBusiness;
  businesses: SwitcherBusiness[];
  canCreateLocation: boolean;
  isBillingOwner: boolean;
  locationUsage: { current: number; allowed: number };
  plan: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 shrink-0 text-black/35 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>;
}

function PlusIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

function CloseIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function businessSubtitle(business: SwitcherBusiness) {
  return business.city || business.industry || "Lokalizacja firmy";
}

export function DesktopBusinessSwitcherClient({
  activeBusiness,
  businesses,
  canCreateLocation,
  isBillingOwner,
  locationUsage,
  plan,
}: DesktopBusinessSwitcherClientProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const canSwitch = businesses.length > 1;
  const canOpenMenu = canSwitch || isBillingOwner;
  const activeName = activeBusiness.name?.trim() || "Twoja firma";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  function selectBusiness(businessId: string) {
    if (isPending || businessId === activeBusiness.id) return;
    setError("");
    startTransition(async () => {
      const result = await setActiveBusinessAction(businessId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function submitLocation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !canCreateLocation) return;
    const form = new FormData(event.currentTarget);
    setCreateError("");
    startTransition(async () => {
      const result = await createBusinessLocationAction({
        name: form.get("name"),
        industry: form.get("industry"),
        city: form.get("city"),
        googleReviewUrl: form.get("googleReviewUrl"),
      });
      if (!result.success) {
        setCreateError(result.error);
        return;
      }
      setCreateOpen(false);
      setOpen(false);
      setSuccessMessage("Lokalizacja została utworzona.");
      router.refresh();
    });
  }

  const locationLimitMessage =
    plan === "Business"
      ? "Wykorzystano limit lokalizacji planu Business."
      : "Plan Starter obejmuje jedną lokalizację.";

  return (
    <div ref={rootRef} className="relative mt-9">
      <p className="px-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-black/35">Twoja firma</p>
      {canOpenMenu ? (
        <button type="button" onClick={() => setOpen((current) => !current)} disabled={isPending} aria-haspopup="menu" aria-expanded={open} className="mt-1.5 flex w-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5 text-left transition duration-200 hover:border-brand/20 hover:bg-brand-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:cursor-wait disabled:opacity-70">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand">{activeName.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{activeName}</span><span className="mt-0.5 block truncate text-xs text-black/40">{businessSubtitle(activeBusiness)}</span></span>
          <ChevronIcon open={open} />
        </button>
      ) : (
        <div className="mt-1.5 flex w-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand">{activeName.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{activeName}</span><span className="mt-0.5 block truncate text-xs text-black/40">{businessSubtitle(activeBusiness)}</span></span>
        </div>
      )}
      <p className="mt-2 px-3.5 text-[11px] font-semibold text-brand">Plan {plan}</p>
      {isBillingOwner ? <p className="mt-1 px-3.5 text-[11px] text-black/40">{locationUsage.current} z {locationUsage.allowed} lokalizacji</p> : null}
      {error ? <p className="mt-2 px-3.5 text-xs font-medium text-red-600">{error}</p> : null}
      {successMessage ? <p className="mt-2 px-3.5 text-xs font-semibold text-brand">{successMessage}</p> : null}

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-card" role="menu" aria-label="Wybierz lokalizację">
          {businesses.map((business) => {
            const active = business.id === activeBusiness.id;
            const name = business.name?.trim() || "Firma bez nazwy";
            return (
              <button key={business.id} type="button" role="menuitemradio" aria-checked={active} disabled={isPending} onClick={() => selectBusiness(business.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:cursor-default ${active ? "bg-brand-soft/70 text-brand" : "text-ink hover:bg-black/[0.035] disabled:opacity-60"}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${active ? "bg-white text-brand" : "bg-[#FAFAFC] text-black/45"}`}>{name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{name}</span><span className="mt-0.5 block truncate text-xs text-black/40">{businessSubtitle(business)}</span></span>
                {active ? <CheckIcon /> : null}
              </button>
            );
          })}
          {isBillingOwner ? (
            <div className="mt-1 border-t border-black/[0.06] pt-1.5">
              <button type="button" role="menuitem" disabled={isPending || !canCreateLocation} onClick={() => { setCreateError(""); setCreateOpen(true); setOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-brand transition hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:cursor-not-allowed disabled:text-black/35 disabled:hover:bg-transparent">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft"><PlusIcon /></span>
                <span className="min-w-0 flex-1">Dodaj lokalizację</span>
              </button>
              {!canCreateLocation ? <p className="px-3 pb-1 pt-1 text-[11px] leading-4 text-black/40">{locationLimitMessage}</p> : null}
            </div>
          ) : null}
          {isPending ? <p className="px-3 py-2 text-xs font-medium text-black/45">Trwa zapisywanie zmian…</p> : null}
        </div>
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/35 p-5" role="presentation">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Zamknij okno dodawania lokalizacji" onClick={() => !isPending && setCreateOpen(false)} />
          <section className="relative w-full max-w-lg rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="create-location-title">
            <div className="flex items-start justify-between gap-5"><div><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand">Nowa lokalizacja</p><h2 id="create-location-title" className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">Dodaj lokalizację</h2><p className="mt-2 text-sm leading-6 text-black/45">Dane zostaną przypisane do Twojego konta i planu.</p></div><button type="button" disabled={isPending} onClick={() => setCreateOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-black/45 transition hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:opacity-50" aria-label="Zamknij"><CloseIcon /></button></div>
            <form className="mt-6 space-y-4" onSubmit={submitLocation}>
              <label className="block text-sm font-semibold text-ink">Nazwa firmy / lokalizacji<input name="name" required maxLength={160} disabled={isPending} className="mt-2 h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm font-normal outline-none transition placeholder:text-black/30 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-[#FAFAFC]" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold text-ink">Branża<input name="industry" required maxLength={120} disabled={isPending} className="mt-2 h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm font-normal outline-none transition placeholder:text-black/30 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-[#FAFAFC]" /></label><label className="block text-sm font-semibold text-ink">Miasto<input name="city" required maxLength={120} disabled={isPending} className="mt-2 h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm font-normal outline-none transition placeholder:text-black/30 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-[#FAFAFC]" /></label></div>
              <label className="block text-sm font-semibold text-ink">Link Google Reviews<input name="googleReviewUrl" type="url" required disabled={isPending} placeholder="https://g.page/r/..." className="mt-2 h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm font-normal outline-none transition placeholder:text-black/30 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:bg-[#FAFAFC]" /></label>
              {createError ? <p className="text-sm font-medium text-red-600" role="alert">{createError}</p> : null}
              <div className="flex justify-end gap-3 pt-2"><button type="button" disabled={isPending} onClick={() => setCreateOpen(false)} className="button-secondary">Anuluj</button><button type="submit" disabled={isPending} className="button-primary">{isPending ? "Tworzenie lokalizacji…" : "Utwórz lokalizację"}</button></div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
