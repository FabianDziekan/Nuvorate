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
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-2">
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

      <div className="mt-5 inline-flex rounded-2xl border border-black/[0.08] bg-[#FAFAFC] p-1">
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
    </section>
  );
}
