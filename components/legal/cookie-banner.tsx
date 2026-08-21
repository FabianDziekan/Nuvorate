"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const cookieConsentKey = "nuvorate-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(cookieConsentKey) !== "accepted");
  }, []);

  function acceptCookies() {
    window.localStorage.setItem(cookieConsentKey, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-md rounded-[24px] border border-black/[0.08] bg-white p-5 shadow-soft sm:bottom-6 sm:p-6"
      aria-label="Informacja o plikach cookies"
      role="dialog"
      aria-live="polite"
    >
      <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">Używamy plików cookies</h2>
      <p className="mt-2 text-sm leading-6 text-black/60">
        Cookies pomagają zapewnić prawidłowe działanie NuvoRate, bezpieczeństwo oraz poprawić działanie serwisu.
      </p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/cookies" className="button-secondary min-h-10 px-4 py-2 text-sm">
          Polityka cookies
        </Link>
        <button type="button" onClick={acceptCookies} className="button-primary min-h-10 px-4 py-2 text-sm">
          Akceptuję
        </button>
      </div>
    </aside>
  );
}
