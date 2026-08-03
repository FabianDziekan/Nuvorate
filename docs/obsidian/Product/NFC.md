---
tags:
  - nfc
  - product
  - supabase
---

# NFC

Moduł NFC daje firmie własne, mierzalne linki do opinii Google. Każda plakietka ma niezależny link NuvoRate, dzięki czemu właściciel widzi, które miejsce w lokalu zbiera skany. NuvoRate nie zbiera opinii we własnym formularzu publicznym.

## Co działa

Strona `/nfc`:

- wymaga sesji,
- wymaga firmy,
- blokuje `unpaid`,
- obsługuje wiele plakietek jednej firmy,
- tworzy niezależny, bezpieczny link NuvoRate dla każdej plakietki,
- pozwala nadać nazwę plakietce i przypisać jej bezpośredni link Google do wystawienia opinii,
- pokazuje cztery zbiorcze statystyki: skany z ostatnich 30 dni, wszystkie skany, aktywne plakietki i ostatni skan,
- pokazuje liczbę skanów dla każdej plakietki oraz czas jej ostatniego skanu,
- pozwala otworzyć szczegóły plakietki, skopiować lub przetestować link, zmienić dane oraz wyłączyć lub włączyć plakietkę,
- prowadzi właściciela przez pięć kroków zapisu linku na fizycznej plakietce NFC.

## Przepływ skanu

1. Właściciel tworzy plakietkę i wpisuje link Google Reviews.
2. NuvoRate generuje dla niej unikalny link `/r/{token}`.
3. Ten link zostaje zapisany na plakietce jako pojedynczy rekord URL.
4. Skan otwiera `/r/{token}`.
5. Serwer zapisuje skan dla konkretnej plakietki i zwraca przekierowanie `307` do Google Reviews.
6. Zakładka NFC i Dashboard pokazują rzeczywiste dane skanów.

Wyłączona plakietka nie rejestruje skanów ani nie przekierowuje klienta do Google.

## Dane i bezpieczeństwo

- `nfc_tags` przechowuje firmę, nazwę plakietki, publiczny token, link docelowy i status.
- `nfc_scans` przechowuje identyfikator plakietki, firmy i czas skanu.
- Token ma 32 losowe znaki generowane kryptograficznie.
- Publiczna trasa akceptuje wyłącznie aktywną plakietkę i zatwierdzony adres Google.
- Zapis skanu odbywa się wyłącznie po stronie serwera.

## Migracje

Przed uruchomieniem NFC na nowej bazie należy wykonać kolejno:

1. `016_nfc_tags_and_scans.sql` — tabele NFC i tracking skanów.
2. `017_multiple_nfc_tags.sql` — uruchamiana po 016, aby umożliwić wiele plakietek dla jednej firmy.

Migracja 017 usuwa wyłącznie ograniczenie jednej plakietki na firmę. Nie usuwa istniejących plakietek, tokenów ani historii skanów.

## Mapa techniczna

- `app/nfc/page.tsx`
- `app/nfc/actions.ts`
- `components/nfc/nfc-tag-manager.tsx`
- `app/r/[token]/route.ts`
- `lib/nfc.ts`
- `lib/nfc-types.ts`
- migracje: `docs/database/016_nfc_tags_and_scans.sql`, `docs/database/017_multiple_nfc_tags.sql`
- tabele: `nfc_tags`, `nfc_scans`, `businesses`, `profiles`

## Powiązane notatki

- [[Dashboard MVP]]
- [[Supabase]]
- [[Roadmap]]
