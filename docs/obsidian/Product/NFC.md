---
tags:
  - nfc
  - product
  - supabase
---

# NFC

NFC jest dodatkiem wspierającym kierowanie klientów do Google review URL firmy. NuvoRate nie zbiera opinii we własnym formularzu publicznym.

## Co działa

Strona `/nfc`:

- wymaga sesji,
- wymaga firmy,
- blokuje `unpaid`,
- pobiera `businesses.google_review_url`,
- pokazuje link do opinii,
- umożliwia kopiowanie linku,
- pokazuje instrukcję konfiguracji plakietki/karty NFC,
- pokazuje statystyki skanów jako 0 lub „Brak danych”.

## Czego jeszcze nie ma

- brak tabeli skanów,
- brak route śledzącego kliknięcia,
- brak rozróżniania plakietek,
- brak integracji Google Reviews API.

## Mapa techniczna

- `app/nfc/page.tsx`
- `components/nfc/copy-link-button.tsx`
- tabele: `businesses`, `profiles`

## Plan

- Dodać tracking kliknięć/skanów.
- Dodać redirect do Google review URL z możliwością liczenia wejść.
- Dodać statystyki per okres.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Supabase]]
- [[Roadmap]]
