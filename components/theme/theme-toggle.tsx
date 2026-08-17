"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const themeStorageKey = "nuvorate-theme";

function applyTheme(theme: ThemeMode) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const nextTheme = storedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function updateTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card min-[769px]:p-5 sm:p-6">
      <button type="button" className="flex w-full items-center gap-3 px-4 py-4 text-left min-[769px]:hidden" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-sm font-semibold text-brand" aria-hidden="true">M</span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">Motyw interfejsu</span><span className="mt-0.5 block text-xs text-black/45">{theme === "dark" ? "Ciemny" : "Jasny"}</span></span>
        <span className={`text-brand transition-transform duration-200 ${mobileOpen ? "rotate-90" : ""}`} aria-hidden="true">›</span>
      </button>
      <div className={`overflow-hidden min-[769px]:block ${mobileOpen ? "max-[768px]:block" : "max-[768px]:hidden"}`}>
      <div className="border-t border-black/[0.06] p-4 min-[769px]:border-0 min-[769px]:p-0">
      <div className="hidden flex-col gap-2 min-[769px]:flex">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
          Wygląd aplikacji
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          Motyw interfejsu
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-black/45">
          Wybierz jasny albo ciemny tryb. Ustawienie zapisuje się lokalnie w
          tej przeglądarce.
        </p>
      </div>

      <div className="inline-flex rounded-2xl border border-black/[0.08] bg-[#FAFAFC] p-1 min-[769px]:mt-5">
        {[
          { label: "Jasny", value: "light" as const },
          { label: "Ciemny", value: "dark" as const },
        ].map((option) => {
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-brand text-white shadow-sm"
                  : "text-black/50 hover:text-brand"
              }`}
              onClick={() => updateTheme(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      </div>
      </div>
    </section>
  );
}
