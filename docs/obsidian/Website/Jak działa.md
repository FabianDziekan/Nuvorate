---
tags:
  - frontend
  - marketing
  - product
  - website
  - workflow
---

# Jak działa

Aktualny przepływ NuvoRate prowadzi ownera od konta do płatnego planu, onboardingu firmy i pracy z opiniami w dashboardzie.

## Aktualny przepływ ownera

1. Użytkownik zakłada konto.
2. Wybiera plan Starter albo Business.
3. Stripe Checkout obsługuje płatność.
4. Stripe webhook ustawia plan w `public.profiles`.
5. Użytkownik uzupełnia firmę w `/onboarding`.
6. Dashboard pokazuje opinie, statystyki, limity, analizę i link NFC.

## Aktualny przepływ opinii

1. Firma ma zapisany Google review URL.
2. Moduł NFC pokazuje i kopiuje ten link.
3. Opinie widoczne w aplikacji pochodzą z tabeli `public.reviews`.
4. Dashboard i `/reviews` pokazują opinie aktualnej firmy.
5. Użytkownik może wygenerować odpowiedź na opinię.
6. Użytkownik może wygenerować analizę reputacji z ostatnich 30 dni.
7. Nowa opinia tworzy powiadomienie in-app typu `new_review`.

## Czego nie należy komunikować jako gotowe

- Automatyczne pobieranie opinii z Google Reviews API.
- Publiczny formularz zbierania opinii NuvoRate.
- Realne śledzenie skanów NFC.
- Powiadomienia o negatywnych opiniach, limitach, subskrypcji lub analizach.

## Powiązane notatki

- [[Hero]]
- [[NFC]]
- [[Powiadomienia]]
- [[Mockup panelu]]
- [[Architektura]]
- [[Website MOC]]
