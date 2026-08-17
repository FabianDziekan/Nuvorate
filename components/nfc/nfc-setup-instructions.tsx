"use client";

import { useState } from "react";

const steps = [
  ["Dodaj plakietkę", "Kliknij „Dodaj plakietkę” i nadaj jej nazwę, np. „Przy kasie”."],
  ["Dodaj link do opinii Google", "Wklej bezpośredni link, pod którym klienci mogą wystawić opinię Twojej firmie w Google."],
  ["Skopiuj link NuvoRate", "Po zapisaniu skopiuj wygenerowany link NuvoRate przypisany do tej plakietki."],
  ["Zapisz link na plakietce", "W aplikacji do zapisu NFC wybierz pojedynczy rekord URL i wklej link NuvoRate."],
  ["Przetestuj skan", "Zbliż telefon do plakietki. Klient powinien trafić do Google Reviews, a NuvoRate zapisze skan."],
] as const;

export function NfcSetupInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mt-4 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6" aria-labelledby="nfc-setup-title">
      <div className="hidden min-[769px]:block">
        <h2 id="nfc-setup-title" className="text-lg font-semibold tracking-tight">Jak uruchomić nową plakietkę?</h2>
        <p className="mt-2 text-sm leading-6 text-black/45">Wykonaj te kroki tylko raz po dodaniu każdej nowej plakietki.</p>
        <ol className="mt-6 grid gap-5 md:grid-cols-5">
          {steps.map(([title, description], index) => (
            <li key={title} className="flex gap-3 md:block">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">{index + 1}</span>
              <div className="md:mt-3">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1.5 text-xs leading-5 text-black/45">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="min-[769px]:hidden">
        <button type="button" className="flex w-full items-center justify-between gap-4 text-left" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} aria-controls="nfc-setup-steps">
          <span>
            <span id="nfc-setup-title" className="block text-base font-semibold tracking-tight">Jak uruchomić nową plakietkę?</span>
            <span className="mt-1 block text-xs leading-5 text-black/45">Instrukcja konfiguracji krok po kroku</span>
          </span>
          <span className={`text-brand transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
        </button>
        <div id="nfc-setup-steps" className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <ol className="min-h-0 space-y-3 border-t border-black/[0.06] pt-4">
            {steps.map(([title, description], index) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-black/45">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
