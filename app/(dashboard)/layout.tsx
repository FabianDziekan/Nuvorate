import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

/**
 * Route-group boundary for authenticated product routes. It preserves the
 * App Router segment across client navigation without changing public URLs.
 * Page-specific chrome is migrated into this boundary incrementally.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
