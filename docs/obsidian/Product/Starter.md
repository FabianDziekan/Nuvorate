---
tags:
  - plans
  - pricing
  - product
  - stripe
---

# NuvoRate Starter

Starter to płatny abonament wejściowy NuvoRate dla małych firm, które chcą zarządzać opiniami i reputacją online bez rozbudowanej konfiguracji.

## Cena

- 49,99 zł miesięcznie.
- Plan aktywuje Stripe webhook po opłaceniu subskrypcji.
- Nowy użytkownik nie otrzymuje Startera automatycznie. Do czasu płatności ma plan `unpaid`.

Komunikacja cenowa jest utrzymywana razem z [[Cennik]], a techniczna aktywacja planu z [[Stripe]].

## Zakres w aktualnym kodzie

Starter daje dostęp do:

- dashboardu po onboardingu firmy,
- listy opinii,
- podstawowych statystyk opinii,
- modułu NFC z linkiem Google review URL,
- generowania odpowiedzi na opinie,
- generowania analizy reputacji w ograniczonym limicie,
- Stripe Customer Portal, jeżeli profil ma `stripe_customer_id`.

## Limity

- 50 odpowiedzi na opinie miesięcznie.
- 1 analiza reputacji miesięcznie.

Limity są sprawdzane backendowo w server actions i zapisywane w `public.ai_usage`.

## Ograniczenia Startera

- Mniej odpowiedzi i analiz niż w Business.
- Brak zaawansowanych raportów.
- Brak obsługi wielu lokalizacji.
- Brak integracji Google Reviews API.

## Powiązane notatki

- [[Business]]
- [[NFC]]
- [[Cennik]]
- [[MVP]]
- [[Supabase]]
- [[Product MOC]]
