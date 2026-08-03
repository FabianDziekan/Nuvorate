---
tags:
  - changelog
  - development
---

# Changelog

## 2026-08-03

### NFC: tracking, redirect i wiele plakietek

- Dodano trwały model NFC: `nfc_tags`, `nfc_scans`, publiczną trasę `/r/[token]` oraz serwerowe przekierowanie `307` do Google Reviews.
- Każdy skan jest przypisany do konkretnej plakietki i firmy, a jego dane zasilają zakładkę NFC oraz Dashboard.
- Dodano obsługę wielu plakietek NFC na firmę — z osobnym tokenem, linkiem, statystykami, testem oraz możliwością włączenia i wyłączenia.
- Dodano panel „Dodaj plakietkę”, szczegóły plakietki, kopiowanie linku i instrukcję zapisu na NFC.
- Przebudowano ekran NFC: cztery czytelne statystyki, lista plakietek oraz pięciokrokowy onboarding.
- Ujednolicono ikonografię NFC na symbol fal radiowych.
- Dodano migrację `017_multiple_nfc_tags.sql`; należy ją uruchomić po `016_nfc_tags_and_scans.sql`.

## 2026-07-09

- Dodano `profiles.first_name`, pole imienia w rejestracji i edycję imienia w `/settings`.
- Dashboard używa imienia właściciela w powitaniu.
- Dodano `businesses.monthly_review_goal` i inline edycję celu miesiąca na Dashboardzie.
- Dodano date range picker na Dashboardzie.
- Zmieniono Business Insights: usunięto „Powtarzalność”, dodano „Ten miesiąc”.
- Dodano mock „Synchronizuj z Google”.
- Dodano kopiowanie wygenerowanej odpowiedzi z karty opinii na Dashboardzie.
- Uproszczono powiadomienia do `new_review` i dodano czyszczenie historii.
- Dodano zakładkę `/author-verification` z wyszukiwarką, filtrem ocen, filtrem statusu, sortowaniem, paginacją i drawerem.
- Wydzielono wspólny `RatingFilter` dla `/reviews` i `/author-verification`.
- Dopracowano wykres „Nowe opinie w czasie” oraz widoczność zerowych słupków w light/dark mode.
- Dopracowano progress bar generowania AI.

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
