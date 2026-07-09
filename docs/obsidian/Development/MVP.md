---
tags:
  - backend
  - development
  - mvp
---

# MVP

MVP NuvoRate obejmuje konto ownera, firmę, płatny plan, dashboard, opinie, odpowiedzi, analizę reputacji, powiadomienia o nowych opiniach, weryfikację autora, ustawienia, NFC i Stripe Subscriptions.

## Gotowe

- Landing page z cennikiem monthly/yearly.
- Auth przez Supabase.
- Onboarding firmy.
- Stripe Checkout, webhook i Customer Portal.
- Plan `unpaid` przed płatnością.
- Dashboard z danymi opinii.
- Wykres nowych opinii w czasie.
- Business Insights.
- Date range picker na Dashboardzie.
- Inline edycja miesięcznego celu opinii.
- `/reviews` z paginacją.
- `/responses` z generowaniem i edycją odpowiedzi.
- Kopiowanie odpowiedzi na Dashboardzie.
- `/author-verification` z filtrami, wyszukiwarką, sortowaniem, paginacją i drawerem.
- Automatyczne odpowiedzi po zapisie ustawień.
- `/analysis` z raportem reputacji.
- `/settings` z profilem firmy i stylem odpowiedzi.
- Light/dark mode.
- `/notifications` tylko dla nowych opinii.
- `/nfc` z Google review URL.
- Limity AI w `ai_usage`.

## Częściowe

- NFC bez realnych skanów.
- Weryfikacja autora bez Google Business Profile API.
- Automatyczne odpowiedzi bez background joba.
- Layout dashboardowy jest nadal powielany w kilku stronach zamiast wydzielonego wspólnego shell komponentu.

## Poza MVP

- Google Reviews API.
- Własny publiczny formularz opinii.
- Wiele lokalizacji.
- Role pracowników.
- Eksport raportów.

## Powiązane notatki

- [[Roadmap]]
- [[Dashboard MVP]]
- [[Odpowiedzi]]
- [[Settings]]
