---
tags:
  - dashboard
  - nfc
  - product
---

# NFC

NFC w NuvoRate jest dodatkiem wspierającym kierowanie klientów do miejsca wystawienia opinii. NuvoRate nie zbiera opinii we własnym publicznym formularzu. Link z NFC powinien prowadzić do Google review URL firmy.

## Co działa w aktualnym kodzie

Strona `/nfc`:

- wymaga zalogowanego użytkownika,
- wymaga istniejącej firmy,
- blokuje dostęp dla planu `unpaid`,
- pobiera `businesses.google_review_url`,
- pokazuje kartę „Twój link do opinii”,
- pozwala skopiować link przez `CopyLinkButton`,
- pokazuje instrukcję konfiguracji NFC,
- pokazuje statystyki skanów jako `0` lub „Brak danych”.

## Link do opinii

Link pochodzi z pola:

- `public.businesses.google_review_url`

Pole jest uzupełniane w onboardingu firmy.

## Kopiowanie linku

Komponent:

- `components/nfc/copy-link-button.tsx`

Kopiuje link do schowka przez `navigator.clipboard.writeText()`.

## Otwieranie linku

Kod pokazuje link do opinii, ale nie posiada jeszcze osobnej warstwy trackingu kliknięć ani przekierowań. Nie istnieje route typu `/r/[slug]`.

## Statystyki skanów

Aktualnie:

- `scansLast30Days = 0`,
- `scansTotal = 0`,
- konwersja: „Brak danych”, jeżeli nie ma skanów.

Nie istnieje jeszcze tabela skanów NFC.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/nfc/page.tsx`, `components/nfc/copy-link-button.tsx`.
- **Komponenty**: `CopyLinkButton`.
- **Używane tabele**: `businesses`, `profiles`.
- **Server actions**: brak.
- **Route handlers**: brak dedykowanego route handlera dla NFC.
- **Zależności**: [[Supabase]], [[Dashboard MVP]], [[Starter]], [[Business]].

## Plan dalszego rozwoju

- Dodać tabelę skanów NFC.
- Dodać przekierowania śledzące kliknięcia/skany.
- Rozróżnić plakietki albo karty NFC.
- Dodać statystyki per okres.
- Powiązać skan z przejściem do Google review URL, o ile da się to mierzyć bez własnego formularza opinii.

## Powiązane notatki

- [[Jak działa]]
- [[Starter]]
- [[Business]]
- [[Supabase]]
- [[Roadmap]]
- [[Product MOC]]
