---
tags:
  - faq
  - website
---

# FAQ

FAQ powinno odpowiadać na pytania zgodnie z aktualnym stanem aplikacji.

## Czy NuvoRate pobiera opinie z Google automatycznie?

Nie w aktualnym MVP. Opinie są przechowywane w `public.reviews`. Integracja Google Reviews API jest planowana.

## Czy NuvoRate zbiera opinie we własnym formularzu?

Nie. NuvoRate kieruje klienta do Google review URL firmy. Publiczny formularz `/r/[slug]` nie istnieje w aktualnym produkcie.

## Czy NFC jest głównym produktem?

Nie. Głównym produktem jest abonament SaaS. NFC jest dodatkiem ułatwiającym kierowanie klientów do linku opinii.

## Kiedy aktywuje się plan?

Plan aktywuje się po potwierdzonym webhooku Stripe. Sam powrót z Checkout na `/dashboard?checkout=success` nie zmienia planu.

## Co oznacza `unpaid`?

To stan użytkownika bez aktywnej płatności. Ma dostęp do onboardingu i wyboru planu, ale nie do pełnych funkcji.

## Czy są plany roczne?

Tak. Starter i Business mają wariant miesięczny oraz roczny.

## Czy odpowiedzi i analizy mają limity?

Tak.

- Starter: 50 odpowiedzi i 1 analiza miesięcznie.
- Business: 350 odpowiedzi i 50 analiz miesięcznie.

## Powiązane notatki

- [[Cennik]]
- [[Stripe]]
- [[NFC]]
- [[Website Blueprint]]
