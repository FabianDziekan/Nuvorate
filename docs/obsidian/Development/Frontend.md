---
tags:
  - backend
  - development
  - frontend
  - nextjs
  - tailwind
---

# Frontend

Frontend NuvoRate jest zbudowany w Next.js App Router, TypeScript i Tailwind CSS. Styl opiera się na białym tle, fiolecie `#5B5CF6` i czerni `#0F0F10`.

## Struktura aplikacji

Najważniejsze trasy:

- `/` landing page,
- `/register` rejestracja,
- `/login` logowanie,
- `/forgot-password` reset hasła,
- `/update-password` ustawienie nowego hasła,
- `/onboarding` konfiguracja firmy,
- `/dashboard` główny dashboard,
- `/reviews` lista opinii,
- `/analysis` analiza reputacji,
- `/nfc` link do opinii i panel NFC,
- `/checkout` Stripe Checkout,
- `/billing/portal` Stripe Customer Portal,
- `/api/stripe/webhook` webhook Stripe.

## Komponenty

- `components/brand/logo.tsx`: logo NuvoRate.
- `components/auth/*`: formularze auth i wspólny shell.
- `components/onboarding/business-form.tsx`: formularz firmy.
- `components/dashboard/review-response-form.tsx`: klientowy formularz generowania odpowiedzi.
- `components/nfc/copy-link-button.tsx`: kopiowanie Google review URL.

## Style

- Globalny CSS: `app/globals.css`.
- Tailwind: `tailwind.config.ts`.
- PostCSS: `postcss.config.mjs`.
- Klasy komponentowe: `container-page`, `section-space`, `eyebrow`, `button-primary`, `button-secondary`.

## Aktualne ograniczenia frontendowe

- Dashboard shell jest powielony w kilku stronach zamiast wydzielonego wspólnego layoutu.
- Brak aktywnych stron dla Powiadomień i Ustawień.
- Wykres trendu na dashboardzie jest statyczny.
- Część elementów topbara jest wizualna, bez pełnej interakcji.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`, strony w `app/*/page.tsx`.
- **Komponenty**: `components/brand/logo.tsx`, `components/auth/*`, `components/onboarding/business-form.tsx`, `components/dashboard/review-response-form.tsx`, `components/nfc/copy-link-button.tsx`.
- **Używane tabele**: frontend czyta dane przez server components i actions z tabel opisanych w [[Supabase]].
- **Server actions**: wywoływane przez formularze dashboardu, analizy, odpowiedzi i onboardingu.
- **Route handlers**: trasy billingowe i auth są linkowane z UI, ale logika sekretów pozostaje server-side.
- **Zależności**: Next.js App Router, TypeScript, Tailwind CSS, [[Backend]].

## Powiązane notatki

- [[Kolory]]
- [[Mockup panelu]]
- [[MVP]]
- [[Backend]]
- [[Architektura]]
- [[Development MOC]]
