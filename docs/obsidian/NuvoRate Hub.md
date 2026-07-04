---
tags:
  - hub
  - moc
  - nuvorate
---

# NuvoRate Hub

Centralny punkt bazy wiedzy NuvoRate. Dokumentacja opisuje aktualny stan projektu wynikający z kodu źródłowego: landing page, autoryzację, onboarding firmy, dashboard, opinie, analizę reputacji, moduł NFC, Stripe Subscriptions, Supabase i integrację OpenAI.

NuvoRate to platforma SaaS do zarządzania opiniami i reputacją online. Główna wartość produktu pozostaje taka sama: więcej opinii = większe zaufanie = więcej klientów.

## Start tutaj

Jeżeli jesteś nowym programistą, przejdź dokumentację w tej kolejności:

1. [[Architektura]]
2. [[Autoryzacja]]
3. [[Supabase]]
4. [[Stripe]]
5. [[Dashboard MVP]]
6. [[Opinie]]
7. [[Analiza]]
8. [[NFC]]
9. [[Server Actions]]
10. [[Roadmap]]

## Aktualny stan produktu

- Głównym produktem jest płatny abonament: Starter albo Business.
- Nowy użytkownik po rejestracji ma plan `unpaid` do momentu potwierdzenia płatności przez webhook Stripe.
- Dashboard jest dostępny po zalogowaniu, onboardingu firmy i aktywacji płatnego planu.
- Opinie są pobierane z tabeli `public.reviews`.
- Odpowiedzi na opinie są generowane przez OpenAI i zapisywane w `public.ai_review_responses`.
- Analizy reputacji są generowane przez OpenAI i zapisywane w `public.ai_business_analyses`.
- Limity odpowiedzi i analiz są liczone miesięcznie w `public.ai_usage`.
- Moduł NFC pokazuje Google review URL zapisany przy firmie, ale nie ma jeszcze prawdziwego trackingu skanów.
- Stripe jest źródłem prawdy dla aktywacji, zmiany, anulowania i wygaszenia planu.

## Najważniejsze obszary dokumentacji

- Strategia i marka: [[Vision MOC]], [[Brand MOC]]
- Produkt i plany: [[Product MOC]]
- Dashboard: [[Dashboard MOC]]
- Strona i sprzedaż: [[Website MOC]], [[Sales MOC]], [[Customers MOC]]
- Technologia: [[Development MOC]]
- Rozwój: [[MVP]], [[Roadmap]], [[Changelog]]

## Mapy wiedzy

- [[Vision MOC]]: misja, wizja i cele.
- [[Brand MOC]]: język, kolory, logo i hasła.
- [[Product MOC]]: plany, NFC, analiza i powiadomienia.
- [[Dashboard MOC]]: pulpit, opinie, analiza, statystyki i mockup.
- [[Website MOC]]: landing page, CTA, FAQ, cennik i blueprint.
- [[Development MOC]]: architektura, backend, frontend, Supabase, Stripe, OpenAI i server actions.
- [[Sales MOC]]: argumenty, obiekcje i skrypt rozmowy.
- [[Customers MOC]]: segmenty klientów.

## Zasady interpretacji dokumentacji

- Jeżeli funkcja jest oznaczona jako plan, nie istnieje jeszcze w kodzie produkcyjnym.
- Dokumentacja techniczna opisuje obecny stan aplikacji Next.js, Supabase, Stripe i OpenAI.
- Dokumentacja produktowa rozróżnia funkcje gotowe, częściowe i planowane.
- Nie zakładamy wielu lokalizacji, pracowników ani własnego formularza zbierania opinii NuvoRate. NuvoRate kieruje użytkowników do Google review URL.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Supabase]]
- [[Server Actions]]
- [[Stripe]]
- [[Autoryzacja]]
- [[Development MOC]]
- [[Roadmap]]
