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
│ NFC                                     │ [Limity planu]                 │
│ Powiadomienia                           │                                │
│ Ustawienia                              │ [Trend reputacji] [Analiza]    │
│                                         │                                │
│ Zarządzaj subskrypcją / Upgrade         │ [Najnowsze opinie klientów]    │
│ Wyloguj się                             │                                │
└─────────────────────────────────────────┴────────────────────────────────┘
```

## Elementy aktualnie działające

- Dane firmy w sidebarze.
- Plan użytkownika.
- Linki do `/dashboard`, `/reviews`, `/analysis`, `/nfc`.
- Statystyki opinii z `public.reviews`.
- Karta limitów planu z `public.ai_usage`.
- Generowanie i ponowne generowanie odpowiedzi na opinie.
- Blokada generowania odpowiedzi po wykorzystaniu limitu.
- Generowanie i odświeżanie analizy reputacji.
- Stripe Customer Portal dla profilu z `stripe_customer_id`.

## Elementy częściowe

- Trend reputacji jest statycznym wykresem.
- Skany NFC są widoczne jako `0`, bez realnego trackingu.
- Powiadomienia i ustawienia są widoczne w nawigacji, ale nie mają osobnych działających widoków.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Statystyki]]
- [[Opinie]]
- [[Analiza]]
- [[Frontend]]
- [[Dashboard MOC]]
