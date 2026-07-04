---
tags:
  - frontend
  - marketing
  - pricing
  - stripe
  - website
---

# Cennik

Cennik w aplikacji pokazuje abonament jako główny produkt NuvoRate. NFC jest dodatkiem wspierającym pozyskiwanie opinii, a nie osobnym głównym produktem.

## Aktualne ceny

- NuvoRate Starter: 49,99 zł miesięcznie.
- NuvoRate Business: 229,99 zł miesięcznie.
- Plakietki NFC: od 10 zł za sztukę.

Ta notatka jest źródłem komunikacji cenowej na stronie. Szczegóły produktowe planów są w [[Starter]] i [[Business]], a techniczna synchronizacja subskrypcji w [[Stripe]].

## Aktualne limity planów

Starter:

- podstawowy dashboard,
- opinie,
- moduł NFC z Google review URL,
- 50 odpowiedzi na opinie miesięcznie,
- 1 analiza reputacji miesięcznie.

Business:

- wszystko z planu Starter,
- 350 odpowiedzi na opinie miesięcznie,
- 50 analiz reputacji miesięcznie,
- wyższe limity dla pracy z reputacją.

## Płatności

- Checkout obsługuje Stripe.
- Stripe webhook jest źródłem prawdy dla aktywacji planu.
- Powrót z Checkout na `/dashboard?checkout=success` nie zmienia planu bez webhooka.
- Customer Portal pozwala zarządzać subskrypcją, jeżeli profil ma `stripe_customer_id`.

## Powiązane notatki

- [[Starter]]
- [[Business]]
- [[NFC]]
- [[FAQ]]
- [[Stripe]]
- [[Website MOC]]
