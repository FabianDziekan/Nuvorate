"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

/** Lets page-specific controls use the persistent header without remounting it. */
export function DashboardHeaderAction({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById("dashboard-header-actions")), []);
  return target ? createPortal(children, target) : null;
}
