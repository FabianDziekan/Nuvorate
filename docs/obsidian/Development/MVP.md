---
tags:
  - backend
  - development
  - mvp
---

# MVP

MVP NuvoRate obejmuje aktualnie działający rdzeń aplikacji SaaS: konto ownera, firmę, płatny plan, dashboard, opinie, odpowiedzi na opinie, analizę reputacji, podstawowy moduł NFC i Stripe Subscriptions.

## Gotowe w kodzie

- Landing page.
- Rejestracja i logowanie przez Supabase Auth.
- Reset hasła.
- Onboarding firmy.
- Jeden owner = jedna firma.
- Plan `unpaid` przed płatnością.
- Stripe Checkout dla Starter i Business.
- Stripe webhook synchronizujący plan w `profiles`.
- Stripe Customer Portal.
- Dashboard z podstawowymi statystykami opinii.
- Lista opinii `/reviews`.
- Generowanie odpowiedzi na opinie.
- Miesięczne limity odpowiedzi i analiz.
- Analiza reputacji przez OpenAI.
- Moduł `/nfc` z Google review URL.

## Częściowe

- NFC: działa link i instrukcja, ale nie tracking skanów.
- Trend reputacji: statyczny wykres SVG.
- Powiadomienia: widoczne w UI, ale bez logiki i bazy.
- Cennik: widoczny na landing page, ale pełna obsługa upgrade/downgrade zależy od Stripe Customer Portal.

## Poza MVP / niegotowe

- Google Reviews API.
- Własny formularz opinii NuvoRate.
- Wielu pracowników.
- Wiele lokalizacji.
- Raporty PDF/e-mail.
- Automatyczne harmonogramy analiz.

## Powiązane notatki

- [[Roadmap]]
- [[Starter]]
- [[Business]]
- [[Frontend]]
- [[Backend]]
- [[Development MOC]]
