---
tags:
  - hub
  - moc
  - nuvorate
---

# NuvoRate Hub

Centralny punkt bazy wiedzy NuvoRate. Dokumentacja opisuje aktualny stan projektu wynikający z kodu źródłowego po ostatnich zmianach: landing page, autoryzację, onboarding, dashboard, opinie, odpowiedzi, analizę reputacji, ustawienia, NFC, Stripe, Supabase, OpenAI oraz deployment GitHub + Vercel.

NuvoRate to platforma SaaS do zarządzania opiniami i reputacją online. Główna wartość produktu: więcej opinii = większe zaufanie = więcej klientów.

## Start tutaj

1. [[Architektura]]
2. [[Autoryzacja]]
3. [[Supabase]]
4. [[Stripe]]
5. [[OpenAI]]
6. [[Dashboard MVP]]
7. [[Opinie]]
8. [[Odpowiedzi]]
9. [[Analiza]]
10. [[NFC]]
11. [[Settings]]
12. [[Deployment]]
13. [[Roadmap]]

## Aktualny stan produktu

- Głównym produktem jest płatny abonament Starter albo Business.
- Nowy użytkownik ma plan `unpaid` do czasu potwierdzenia płatności przez webhook Stripe.
- Dostęp do pełnych modułów wymaga logowania, onboardingu firmy i aktywnego planu.
- Landing page obsługuje przełącznik miesięcznie/rocznie i kieruje do Stripe Checkout.
- Dashboard pokazuje statystyki opinii, limity planu, wykres nowych opinii w czasie, Business Insights, analizę reputacji i najnowsze opinie.
- Opinie są przechowywane w `public.reviews`; `/reviews` ma filtrowanie po ocenie i paginację.
- Odpowiedzi są zarządzane w `/responses`; można generować, edytować, kopiować i oznaczać odpowiedzi jako użyte.
- Automatyczne odpowiedzi zapisują ustawienia i generują odpowiedzi dla pasujących ocen po zapisie ustawień.
- Analizy reputacji są generowane przez OpenAI i zapisywane w `public.ai_business_analyses`.
- Limity odpowiedzi i analiz są liczone miesięcznie w `public.ai_usage`.
- Ustawienia `/settings` pozwalają edytować nazwę firmy, branżę i styl odpowiedzi `response_tone`.
- Moduł NFC pokazuje Google review URL i instrukcję konfiguracji; tracking skanów jest jeszcze planowany.
- Stripe jest źródłem prawdy dla aktywacji, zmiany, anulowania i wygaszenia planu.
- Deployment odbywa się przez GitHub i Vercel; projekt używa `pnpm-lock.yaml`.

## Mapy wiedzy

- [[Vision MOC]]: misja, wizja i cele.
- [[Brand MOC]]: język, kolory, logo i hasła.
- [[Product MOC]]: plany, NFC, analiza, powiadomienia.
- [[Dashboard MOC]]: dashboard, opinie, odpowiedzi, analiza, statystyki.
- [[Website MOC]]: landing page, CTA, FAQ, cennik i blueprint.
- [[Development MOC]]: architektura, backend, frontend, Supabase, Stripe, OpenAI, deployment i server actions.
- [[Sales MOC]]: argumenty, obiekcje i skrypt rozmowy.
- [[Customers MOC]]: segmenty klientów.

## Zasady interpretacji dokumentacji

- Funkcja oznaczona jako plan nie istnieje jeszcze w kodzie produkcyjnym.
- NuvoRate nie ma własnego publicznego formularza opinii; kieruje do Google review URL.
- Nie ma jeszcze Google Reviews API, wielu lokalizacji ani ról pracowników.
- Dokumentacja techniczna ma pierwszeństwo przed starszymi notatkami koncepcyjnymi.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Odpowiedzi]]
- [[Settings]]
- [[Supabase]]
- [[Server Actions]]
- [[Stripe]]
- [[Deployment]]
- [[Roadmap]]
