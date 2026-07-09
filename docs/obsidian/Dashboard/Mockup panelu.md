---
tags:
  - dashboard
  - product
  - ux
---

# Mockup panelu

Mockup panelu powinien odpowiadać aktualnemu dashboardowi NuvoRate, a nie funkcjom planowanym.

## Aktualny układ

```text
┌──────────────── Sidebar ────────────────┬──────────── Topbar ────────────┐
│ NuvoRate                                │ Firma / Pulpit / konto         │
│ Twoja firma                             ├────────────────────────────────┤
│ Branża, miasto, plan                    │ Dzień dobry                    │
│                                         │                                │
│ Pulpit                                  │ [Nowe opinie] [Średnia ocena]  │
│ Opinie                                  │ [Pozytywne]   [Skany NFC]      │
│ Analiza                                 │                                │
│ Odpowiedzi                              │ [Limity planu]                 │
│ Weryfikacja autora                      │                                │
│ NFC                                     │                                │
│ Powiadomienia                           │                                │
│ Ustawienia                              │ [Nowe opinie w czasie] [Analiza]│
│                                         │                                │
│ Zarządzaj subskrypcją / Upgrade         │ [Najnowsze opinie klientów]    │
│ Wyloguj się                             │                                │
└─────────────────────────────────────────┴────────────────────────────────┘
```

## Elementy aktualnie działające

- Dane firmy w sidebarze.
- Plan użytkownika.
- Linki do `/dashboard`, `/reviews`, `/analysis`, `/responses`, `/nfc`, `/settings`.
- Statystyki opinii z `public.reviews`.
- Wykres „Nowe opinie w czasie” z realnych opinii z `public.reviews`, z presetami i zakresem niestandardowym.
- Business Insights dla planu Business.
- Inline edycja miesięcznego celu opinii w karcie „Cel miesiąca”.
- Karta limitów planu z `public.ai_usage`.
- Generowanie i ponowne generowanie odpowiedzi na opinie.
- Kopiowanie istniejącej odpowiedzi bezpośrednio z karty opinii na Dashboardzie.
- Blokada generowania odpowiedzi po wykorzystaniu limitu.
- Generowanie i odświeżanie analizy reputacji.
- Ustawienia firmy i stylu odpowiedzi w `/settings`.
- Light/dark mode zapisywany lokalnie.
- Powiadomienia in-app dla nowych opinii.
- Stripe Customer Portal dla profilu z `stripe_customer_id`.

## Elementy częściowe

- Skany NFC są widoczne jako `0`, bez realnego trackingu.
- Synchronizacja Google na Dashboardzie jest mockiem przygotowanym pod Google Business Profile API.
- Weryfikacja autora ma UI, filtry i drawer, ale nie pobiera jeszcze publicznych profili Google.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Statystyki]]
- [[Opinie]]
- [[Odpowiedzi]]
- [[Weryfikacja autora]]
- [[Analiza]]
- [[Settings]]
- [[Powiadomienia]]
- [[Frontend]]
- [[Dashboard MOC]]
