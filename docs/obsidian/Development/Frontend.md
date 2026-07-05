---
tags:
  - development
  - frontend
  - nextjs
  - tailwind
---

# Frontend

Frontend NuvoRate jest zbudowany w Next.js App Router, TypeScript i Tailwind CSS.

## Trasy

- `/`: landing page.
- `/register`, `/login`, `/forgot-password`, `/update-password`: auth.
- `/onboarding`: konfiguracja firmy.
- `/dashboard`: pulpit.
- `/reviews`: opinie z filtrem i paginacją.
- `/responses`: zarządzanie odpowiedziami.
- `/analysis`: analiza reputacji.
- `/nfc`: link opinii i instrukcja NFC.
- `/settings`: ustawienia firmy, styl odpowiedzi, konto.
- `/checkout`: Stripe Checkout.
- `/billing/portal`: Stripe Customer Portal.

## Komponenty

- `components/brand/logo.tsx`
- `components/auth/*`
- `components/billing/*`
- `components/dashboard/*`
- `components/responses/*`
- `components/settings/settings-form.tsx`
- `components/nfc/copy-link-button.tsx`
- `components/ui/ai-generation-progress.tsx`
- `components/ui/pagination.tsx`

## Style

- `app/globals.css`
- Tailwind config
- białe tła, fiolet `#5B5CF6`, czerń `#0F0F10`
- dashboardowy shell powielony w kilku stronach

## Obecne ograniczenia

- Brak wspólnego dashboard layoutu.
- Powiadomienia są pozycją UI bez strony.
- NFC statystyki są zerowe, bo brak tabeli skanów.

## Powiązane notatki

- [[Architektura]]
- [[Backend]]
- [[Dashboard MVP]]
- [[Website Blueprint]]
