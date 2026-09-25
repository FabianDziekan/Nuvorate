"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const cookieConsentKey = "nuvorate-cookie-consent";
type CookieDecision = "accepted" | "declined" | null;

function CookieOutlineIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M20.8 13.1A9 9 0 1 1 10.9 3.2a2.8 2.8 0 0 0 3.4 3.4 2.8 2.8 0 0 0 3.4 3.4 2.8 2.8 0 0 0 3.1 3.1Z" />
      <circle cx="8.5" cy="9" r=".7" fill="currentColor" stroke="none" />
      <circle cx="13" cy="13" r=".7" fill="currentColor" stroke="none" />
      <circle cx="9" cy="16" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CookieBanner() {
  const [decision, setDecision] = useState<CookieDecision | "loading">("loading");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(cookieConsentKey);
    setDecision(stored === "accepted" || stored === "declined" ? stored : null);
  }, []);

  function acceptCookies() {
    window.localStorage.setItem(cookieConsentKey, "accepted");
    setDecision("accepted");
    setSettingsOpen(false);
  }

  function withdrawConsent() {
    window.localStorage.setItem(cookieConsentKey, "declined");
    setDecision("declined");
    setSettingsOpen(false);
  }

  if (decision === "loading") return null;

  if (decision !== null && !settingsOpen) {
    return (
      <div className="group fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[100] lg:bottom-[max(1.5rem,env(safe-area-inset-bottom))] lg:right-6">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Ustawienia cookies"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.1] bg-white text-[#5B5CF6] shadow-[0_6px_20px_rgba(20,20,40,0.12)] transition-colors duration-200 hover:bg-[#F1F1FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CF6] focus-visible:ring-offset-2"
        >
          <CookieOutlineIcon />
        </button>
        <span role="tooltip" className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          Ustawienia cookies
        </span>
      </div>
    );
  }

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-md rounded-[24px] border border-black/[0.08] bg-white p-5 shadow-soft sm:bottom-6 sm:p-6"
      aria-label="Informacja o plikach cookies"
      role="dialog"
      aria-live="polite"
    >
      {settingsOpen ? (
        <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Zamknij ustawienia cookies" className="absolute right-4 top-4 rounded-lg p-1 text-black/45 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5"><path d="M5 5 19 19M19 5 5 19" /></svg>
        </button>
      ) : null}
      <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">Używamy plików cookies</h2>
      <p className="mt-2 text-sm leading-6 text-black/60">
        Cookies pomagają zapewnić prawidłowe działanie NuvoRate, bezpieczeństwo oraz poprawić działanie serwisu.
      </p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {settingsOpen && decision === "accepted" ? (
          <button type="button" onClick={withdrawConsent} className="button-secondary min-h-10 px-4 py-2 text-sm">
            Wycofaj zgodę
          </button>
        ) : null}
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
