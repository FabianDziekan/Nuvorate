---
tags:
  - pricing
  - stripe
  - website
---

# Cennik

Cennik jest widoczny na landing page oraz na ekranie aktywacji planu dla użytkownika `unpaid`.

## Billing

Dostępne cykle:

- miesięcznie,
- rocznie.

Konfiguracja cen:

- `lib/pricing.ts`

## Starter

Miesięcznie:

- 49,99 zł / miesiąc.

Rocznie:

- 499,99 zł / rok,
- około 41,67 zł miesięcznie,
- oszczędzasz około 100 zł rocznie.

Limity:

- 50 odpowiedzi na opinie miesięcznie,
- 1 analiza reputacji miesięcznie.

## Business

Miesięcznie:

- 229,99 zł / miesiąc.

Rocznie:

- 2299,99 zł / rok,
- około 191,67 zł miesięcznie,
- oszczędzasz około 460 zł rocznie.

Limity:

- 350 odpowiedzi na opinie miesięcznie,
- 50 analiz reputacji miesięcznie.

## Stripe

Checkout:

- `/checkout?plan=starter&billing=monthly`
- `/checkout?plan=starter&billing=yearly`
- `/checkout?plan=business&billing=monthly`
- `/checkout?plan=business&billing=yearly`

Webhook aktywuje plan dopiero po potwierdzeniu Stripe.

## Powiązane notatki

- [[Starter]]
- [[Business]]
- [[Stripe]]
- [[Website Blueprint]]
