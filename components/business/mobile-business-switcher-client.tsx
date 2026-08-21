"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveBusinessAction } from "@/app/active-business/actions";

export type MobileSwitcherBusiness = {
  id: string;
  name: string | null;
  industry: string | null;
  city: string | null;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function subtitle(business: MobileSwitcherBusiness) {
  return business.city || business.industry || "Lokalizacja firmy";
}

export function MobileBusinessSwitcherClient({
  activeBusiness,
  businesses,
}: {
  activeBusiness: MobileSwitcherBusiness;
  businesses: MobileSwitcherBusiness[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const activeName = activeBusiness.name?.trim() || "Twoja firma";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !isPending) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isPending, open]);

  function selectBusiness(businessId: string) {
    if (isPending || businessId === activeBusiness.id) return;

    // Close before the active-business update can refresh/remount this header.
    setOpen(false);
    setError("");
    startTransition(async () => {
      const result = await setActiveBusinessAction(businessId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className="hidden max-[768px]:block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Zmień lokalizację. Aktywna: ${activeName}`}
        className="flex h-11 min-w-11 items-center justify-center gap-0.5 rounded-xl border border-black/[0.08] bg-white px-1.5 text-brand transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-xs font-bold">
          {activeName.slice(0, 1).toUpperCase()}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <section
          className="fixed left-1/2 top-[82px] z-50 w-[240px] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-card"
          role="menu"
          aria-label="Dostępne lokalizacje"
        >
          {businesses.map((business) => {
            const active = business.id === activeBusiness.id;
            const name = business.name?.trim() || "Firma bez nazwy";
            return (
              <button
                key={business.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                disabled={isPending}
                onClick={() => selectBusiness(business.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:cursor-wait ${active ? "bg-brand-soft/70 text-brand" : "text-ink active:scale-[0.99]"}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${active ? "bg-white text-brand" : "bg-[#FAFAFC] text-black/45"}`}>
                  {name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{name}</span>
                  <span className="mt-0.5 block truncate text-xs text-black/40">{subtitle(business)}</span>
                </span>
                {active ? <CheckIcon /> : null}
              </button>
            );
          })}
          {isPending ? <p className="px-2.5 py-2 text-xs font-medium text-black/45">Zmieniamy lokalizację…</p> : null}
          {error ? <p className="px-2.5 py-2 text-xs font-medium text-red-600" role="alert">{error}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
