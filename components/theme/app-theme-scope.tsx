"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const appThemePaths = [
  "/dashboard",
  "/reviews",
  "/analysis",
  "/responses",
  "/author-verification",
  "/nfc",
  "/notifications",
  "/settings",
];

function isAppThemePath(pathname: string) {
  return appThemePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

/** Keeps the saved app preference out of public and marketing routes. */
export function AppThemeScope() {
  const pathname = usePathname();

  useEffect(() => {
    const isDark =
      isAppThemePath(pathname) &&
      window.localStorage.getItem("nuvorate-theme") === "dark";

    applyTheme(isDark);
  }, [pathname]);

  return null;
}
