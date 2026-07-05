---
tags:
  - backend
  - development
  - openai
  - stripe
  - supabase
---

# Backend

Backend NuvoRate działa w Next.js App Router z Supabase, Stripe i OpenAI.

## Główne elementy

- Supabase Auth: konto, sesje, reset hasła.
- Supabase Database: profile, firmy, opinie, odpowiedzi, analizy, ustawienia i limity.
- Server Actions: onboarding, wylogowanie, analiza, odpowiedzi, ustawienia.
- Route handlers: Stripe, auth callback, API odpowiedzi.
- OpenAI Responses API: Structured Outputs.
- Stripe Subscriptions: checkout, webhook, portal klienta.

## Źródła prawdy

- `auth.users`: konto.
- `profiles`: plan, status subskrypcji, identyfikatory Stripe.
- `businesses`: firma ownera.
- `reviews`: opinie i statusy odpowiedzi.
- `business_response_settings`: automatyczne odpowiedzi i styl odpowiedzi.
- `ai_usage`: limity miesięczne.
- Stripe webhook: aktywacja i dezaktywacja planu.

## Route handlers

- `/checkout`
- `/billing/portal`
- `/api/stripe/webhook`
- `/api/responses/generate`
- `/api/responses/auto-generate`
- `/api/responses/settings`
- `/api/responses/[id]`
- `/api/responses/[id]/responded`
- `/auth/callback`

## Ograniczenia

- Jeden owner = jedna firma.
- Brak pracowników.
- Brak wielu lokalizacji.
- Brak Google Reviews API.
- Brak realnego trackingu NFC.
- Powiadomienia nie mają jeszcze backendu.

## Powiązane notatki

- [[Frontend]]
- [[Supabase]]
- [[Server Actions]]
- [[Stripe]]
- [[OpenAI]]
- [[Deployment]]
