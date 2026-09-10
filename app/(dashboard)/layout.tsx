import type { ReactNode } from "react";

/**
 * Route-group boundary for authenticated product routes. It preserves the
 * App Router segment across client navigation without changing public URLs.
 * Page-specific chrome is migrated into this boundary incrementally.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
