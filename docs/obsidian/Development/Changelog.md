---
tags:
  - changelog
  - development
---

# Changelog

## 2026-07-05

- Zsynchronizowano `pnpm-lock.yaml` po błędzie Vercel `ERR_PNPM_OUTDATED_LOCKFILE`.
- Potwierdzono workflow GitHub -> Vercel dla aktualnego repo.
- Zaktualizowano dokumentację Obsidian do aktualnego stanu projektu.

## 2026-07-04

- Dodano `/settings`.
- Uproszczono ustawienia do nazwy firmy, branży i stylu odpowiedzi.
- Dodano `business_response_settings.response_tone`.
- Generator odpowiedzi przekazuje `preferred_response_style` do OpenAI.
- Dodano zakładkę `/responses`.
- Dodano statusy odpowiedzi: `pending`, `ready`, `responded`.
- Dodano automatyczne generowanie odpowiedzi po zapisie ustawień.
- Dodano wspólny progress bar generowania AI.
- Dodano paginację w `/reviews` i `/responses`.
- Dodano `/nfc`.
- Dodano Stripe monthly/yearly checkout.
- Dodano Customer Portal.
- Dodano Business Insights i wykres aktywności opinii.
- Dodano nowe logo z pliku `public/brand/nuvorate-logo.png`.

## Powiązane notatki

- [[Roadmap]]
- [[Deployment]]
- [[Server Actions]]
- [[Stripe]]
