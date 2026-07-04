---
tags:
  - backend
  - changelog
  - development
---

# Changelog

Changelog opisuje aktualne większe zmiany w projekcie NuvoRate.

## 2026-07-02

- Uporządkowano dokumentację Obsidian pod aktualny stan kodu.
- Doprecyzowano, że nowy użytkownik ma plan `unpaid` do momentu płatności.
- Udokumentowano Stripe Checkout, webhook i Customer Portal.
- Udokumentowano limity odpowiedzi i analiz w `ai_usage`.
- Udokumentowano rozdzielenie server action odpowiedzi przez `review-response-actions.ts` i `review-response-service.ts`.
- Udokumentowano, że NFC nie ma jeszcze realnego trackingu skanów.
- Udokumentowano, że powiadomienia są planowane, a nie gotowe.

## Ostatni stan funkcjonalny

- Starter: 49,99 zł miesięcznie, 50 odpowiedzi na opinie i 1 analiza reputacji miesięcznie.
- Business: 229,99 zł miesięcznie, 350 odpowiedzi na opinie i 50 analiz reputacji miesięcznie.
- Stripe webhook synchronizuje `profiles.plan`.
- Dashboard pokazuje statystyki opinii, limity planu, analizę i ostatnie opinie.
- `/reviews` pokazuje pełną listę opinii z filtrem oceny.
- `/analysis` pokazuje ostatnią analizę reputacji.
- `/nfc` pokazuje Google review URL i instrukcję NFC.

## Powiązane notatki

- [[Roadmap]]
- [[MVP]]
- [[Architektura]]
- [[Development MOC]]
