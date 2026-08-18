"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/dashboard/actions";
import { AppNavigationIcon } from "./app-navigation-icon";

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function MoreIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></svg>;
}

const primaryItems = [
  { label: "Pulpit", href: "/dashboard", icon: "dashboard" as const },
  { label: "Opinie", href: "/reviews", icon: "reviews" as const },
  { label: "Analiza", href: "/analysis", icon: "analysis" as const },
  { label: "NFC", href: "/nfc", icon: "nfc" as const },
];

const moreItems = [
  { label: "Odpowiedzi", href: "/responses", icon: "responses" as const },
  { label: "Weryfikacja autora", href: "/author-verification", icon: "verification" as const },
  { label: "Powiadomienia", href: "/notifications", icon: "bell" as const },
  { label: "Ustawienia", href: "/settings", icon: "settings" as const },
];

const morePaths = moreItems.map((item) => item.href);

export function MobileBottomNavigationClient({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = morePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const moreHighlighted = moreActive || moreOpen;

  useEffect(() => {
    document.body.classList.add("mobile-bottom-navigation-active");
    return () => document.body.classList.remove("mobile-bottom-navigation-active");
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  return (
    <>
      <nav className="mobile-bottom-navigation fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.08] bg-white/95 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden" aria-label="Główna nawigacja">
        <div className="mx-auto flex h-16 max-w-md items-stretch">
          {primaryItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`mobile-bottom-navigation-item flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl text-[10.5px] leading-none transition-[color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 ${active ? "mobile-bottom-navigation-item-active font-semibold text-brand" : "mobile-bottom-navigation-item-inactive font-medium text-black/55 active:scale-[0.98]"}`} aria-current={active ? "page" : undefined}>
                <span className={`grid h-7 w-7 place-items-center rounded-lg transition-[background-color,transform] duration-200 ${active ? "scale-[1.04] bg-brand-soft" : "bg-transparent"}`}>
                  <AppNavigationIcon name={item.icon} className="h-[19px] w-[19px]" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={() => setMoreOpen(true)} className={`mobile-bottom-navigation-item relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl text-[10.5px] leading-none transition-[color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 ${moreHighlighted ? "mobile-bottom-navigation-item-active font-semibold text-brand" : "mobile-bottom-navigation-item-inactive font-medium text-black/55 active:scale-[0.98]"}`} aria-haspopup="dialog" aria-expanded={moreOpen}>
            <span className={`relative grid h-7 w-7 place-items-center rounded-lg transition-[background-color,transform] duration-200 ${moreHighlighted ? "scale-[1.04] bg-brand-soft" : "bg-transparent"}`}>
              <MoreIcon className="h-[19px] w-[19px]" />
              {unreadCount > 0 ? <span className="mobile-bottom-navigation-unread-dot absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-white" aria-label={`${unreadCount} nieprzeczytanych powiadomień`} /> : null}
            </span>
            <span>Więcej</span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <button type="button" className="absolute inset-0 bg-black/20" aria-label="Zamknij menu" onClick={() => setMoreOpen(false)} />
          <section className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(15,15,16,0.14)]" role="dialog" aria-modal="true" aria-label="Więcej opcji">
            <div className="mx-auto h-1 w-10 rounded-full bg-black/10" />
            <div className="mb-4 mt-3 flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">Więcej</h2>
              <button type="button" onClick={() => setMoreOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-black/45 transition hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35" aria-label="Zamknij menu">
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${active ? "bg-brand-soft text-brand" : "text-ink hover:bg-black/[0.035]"}`}>
                    <AppNavigationIcon name={item.icon} className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/notifications" && unreadCount > 0 ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 border-t border-black/[0.07] pt-3">
              <form action={signOut}>
                <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-black/55 transition hover:bg-black/[0.035]">
                  <AppNavigationIcon name="logout" className="h-5 w-5" />
                  Wyloguj się
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
