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
- Wykres „Nowe opinie w czasie” z agregacji RPC `get_review_activity_trend`.
- Business Insights dla planu Business.
- Karta limitów planu z `public.ai_usage`.
- Generowanie i ponowne generowanie odpowiedzi na opinie.
- Blokada generowania odpowiedzi po wykorzystaniu limitu.
- Generowanie i odświeżanie analizy reputacji.
- Ustawienia firmy i stylu odpowiedzi w `/settings`.
- Stripe Customer Portal dla profilu z `stripe_customer_id`.

## Elementy częściowe

- Skany NFC są widoczne jako `0`, bez realnego trackingu.
- Powiadomienia są widoczne w nawigacji, ale nie mają osobnego działającego widoku.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Statystyki]]
- [[Opinie]]
- [[Odpowiedzi]]
- [[Analiza]]
- [[Settings]]
- [[Frontend]]
- [[Dashboard MOC]]
