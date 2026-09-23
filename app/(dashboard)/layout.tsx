import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { DashboardContentSkeleton } from "@/components/dashboard/dashboard-content-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { redirect } from "next/navigation";
import { getDashboardRequestContext, getDashboardUser } from "@/lib/dashboard-request-context";
import { hasPaidAccess } from "@/lib/billing-access";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Route-group boundary for authenticated product routes. It preserves the
 * App Router segment across client navigation without changing public URLs.
 * Page-specific chrome is migrated into this boundary incrementally.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: { user } } = await getDashboardUser();
  if (!user) redirect("/login?next=/dashboard");
  const { billingContext } = await getDashboardRequestContext(user.id);
  if (!billingContext) redirect("/onboarding");
  if (!hasPaidAccess(billingContext.plan, billingContext.subscriptionStatus)) redirect("/activate");
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardContentSkeleton />}>
        {children}
      </Suspense>
    </DashboardShell>
  );
}
