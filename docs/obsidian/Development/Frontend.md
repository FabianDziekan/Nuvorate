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
- `/author-verification`: Weryfikacja autora jako Business Feature.
- `/analysis`: analiza reputacji.
- `/notifications`: centrum nowych opinii.
- `/nfc`: link opinii i instrukcja NFC.
- `/settings`: ustawienia firmy, styl odpowiedzi, konto.
- `/checkout`: Stripe Checkout.
- `/billing/portal`: Stripe Customer Portal.

## Komponenty

- `components/brand/logo.tsx`
- `components/auth/*`
- `components/billing/*`
- `components/dashboard/*`
- `components/author-verification/*`
- `components/notifications/*`
- `components/responses/*`
- `components/settings/settings-form.tsx`
- `components/nfc/copy-link-button.tsx`
- `components/ui/ai-generation-progress.tsx`
- `components/ui/pagination.tsx`
- `components/ui/rating-filter.tsx`

## Style

- `app/globals.css`
- Tailwind config
- białe tła, fiolet `#5B5CF6`, czerń `#0F0F10`
- light/dark mode sterowany lokalnie z poziomu `/settings`
- dashboardowy shell powielony w kilku stronach

## Obecne ograniczenia

- Brak wspólnego dashboard layoutu.
- NFC statystyki są zerowe, bo brak tabeli skanów.
- Weryfikacja autora nie ma jeszcze danych z publicznego profilu Google.

## Powiązane notatki

- [[Architektura]]
- [[Backend]]
- [[Dashboard MVP]]
- [[Website Blueprint]]
