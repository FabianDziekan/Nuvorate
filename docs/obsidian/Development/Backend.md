---
tags:
  - backend
  - development
  - openai
  - stripe
  - supabase
---

# Backend

Backend NuvoRate działa w architekturze Next.js App Router z Supabase jako backendem danych i auth, Stripe jako billingiem oraz OpenAI jako silnikiem generowania odpowiedzi i analiz.

## Główne elementy

- Supabase Auth: logowanie, rejestracja, reset hasła i sesje.
- Supabase Database: profile, firmy, opinie, odpowiedzi, analizy, użycie limitów.
- Server Actions: onboarding, wylogowanie, generowanie analiz, generowanie odpowiedzi.
- Route handlers: Stripe Checkout, Stripe webhook, Stripe Customer Portal, callback auth.
- OpenAI Responses API: Structured Outputs dla odpowiedzi i analiz.
- Stripe: subskrypcje Starter i Business.

## Źródła prawdy

- `auth.users`: konto użytkownika.
- `public.profiles`: plan, Stripe customer, subskrypcja, status.
- `public.businesses`: jedna firma ownera.
- Stripe webhook: źródło prawdy dla aktywacji i anulowania planu.
- `public.ai_usage`: miesięczne zużycie limitów odpowiedzi i analiz.

## Ważne ograniczenia

- Jeden owner = jedna firma.
- Brak pracowników.
- Brak wielu lokalizacji.
- Brak Google Reviews API.
- Brak realnego trackingu skanów NFC.
- Brak modułu powiadomień.

## Mapa techniczna

- **Odpowiedzialne pliki**: `lib/supabase/*`, `lib/stripe.ts`, `lib/openai.ts`, `lib/plans.ts`, `middleware.ts`, `app/**/actions.ts`, `app/**/route.ts`.
- **Używane tabele**: `profiles`, `businesses`, `reviews`, `ai_review_responses`, `ai_business_analyses`, `ai_usage`.
- **Server actions**: opisane szczegółowo w [[Server Actions]].
- **Route handlers**: `/auth/callback`, `/checkout`, `/billing/portal`, `/api/stripe/webhook`.
- **Zależności**: [[Supabase]], [[Stripe]], [[OpenAI]], [[Autoryzacja]].

## Powiązane notatki

- [[Frontend]]
- [[Supabase]]
- [[Server Actions]]
- [[Stripe]]
- [[Autoryzacja]]
- [[OpenAI]]
- [[Development MOC]]
