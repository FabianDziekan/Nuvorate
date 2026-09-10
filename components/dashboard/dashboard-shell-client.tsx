"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Pulpit główny", "/reviews": "Opinie", "/analysis": "Analiza reputacji",
  "/responses": "Odpowiedzi", "/nfc": "NFC", "/notifications": "Powiadomienia",
  "/settings": "Ustawienia", "/support": "Pomoc i kontakt", "/author-verification": "Autorzy opinii",
};

export function DashboardShellClient({ children }: { children: ReactNode }) { return <>{children}</>; }

/**
 * The shell owns the only scroll container. It survives dashboard route
 * changes, so reset it only when the pathname itself changes.
 */
export function DashboardShellScrollArea({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return;
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "auto" });
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <div
      ref={scrollAreaRef}
      data-dashboard-scroll-container
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 lg:pb-0"
    >
      {children}
    </div>
  );
}

export function DashboardShellNavItem({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return <Link href={href} className={`sidebar-nav-item flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-brand-soft text-brand" : "text-black/45 hover:bg-black/[0.035] hover:text-ink"}`} aria-current={active ? "page" : undefined}>{children}</Link>;
};
export function DashboardShellTitle({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  return <div className="hidden min-w-0 lg:block"><p className="truncate text-xs text-black/35">{businessName}</p><p className="mt-0.5 text-sm font-semibold">{titles[pathname] ?? "NuvoRate"}</p></div>;
};
export function DashboardShellHeaderActionSlot() { return <div id="dashboard-header-actions" />; }
export function DashboardShellUpgradeLink() { return <Link href="/checkout?plan=business" className="mt-4 block w-full rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-white/15">Przejdź na Business</Link>; }
export function DashboardShellDashboardOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/dashboard" ? <>{children}</> : null;
}
export function DashboardShellPlanCard({ plan, hasActiveSubscription }: { plan: string; hasActiveSubscription: boolean }) {
  const pathname = usePathname();
  if (pathname === "/notifications" || pathname === "/support") return null;
  const showPortal = pathname === "/dashboard" && hasActiveSubscription;
  const showUpgrade = plan === "Starter" && !showPortal;
  return <div className="rounded-2xl bg-ink p-4 text-white">
    <p className="text-[11px] text-white/45">Aktywny plan</p>
    <div className="mt-1 flex items-center justify-between"><p className="font-semibold">{plan}</p><span className="rounded-full bg-brand px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">aktywny</span></div>
    {showPortal ? <form method="post" action="/billing/portal"><button type="submit" className="mt-4 block w-full rounded-xl bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-white/15">Zarządzaj subskrypcją</button></form> : showUpgrade ? <DashboardShellUpgradeLink /> : null}
  </div>;
}
