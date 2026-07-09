---
tags:
  - dashboard
  - google
  - opinie
  - product
  - verification
---

# Weryfikacja autora

Weryfikacja autora to moduł Business Feature dostępny pod `/author-verification`.

Cel modułu: właściciel firmy może przejrzeć autorów opinii i przygotować się do szybkiej weryfikacji ich publicznej aktywności w Google. Na tym etapie nie ma jeszcze integracji z Google Business Profile API.

## Aktualny stan

Moduł jest kompletnym interfejsem przygotowanym pod przyszłą integrację:

- lista opinii z `public.reviews`,
- wyszukiwarka po autorze i treści opinii,
- filtr ocen używający wspólnego komponentu `RatingFilter`,
- filtr statusu: Wszystkie, Niezweryfikowane, Zweryfikowane,
- sortowanie: Najnowsze, Najstarsze, Najniższa ocena, Najwyższa ocena,
- paginacja po 10 rekordów,
- drawer po kliknięciu opinii lub „Sprawdź autora”.

## Drawer

Drawer pokazuje:

- imię autora,
- ocenę,
- datę opinii,
- treść opinii,
- sekcję „Weryfikacja autora”,
- disabled przycisk „Otwórz profil autora w Google”,
- kartę „Na co zwrócić uwagę?”.

## Przygotowanie pod Google

Struktura komponentu obsługuje pole:

- `authorProfileUrl`

Po wdrożeniu Google Business Profile API należy uzupełnić `authorProfileUrl` w mapowaniu recenzji w `app/author-verification/page.tsx`. Wtedy przycisk „Otwórz profil autora w Google” automatycznie stanie się aktywnym linkiem.

## Odpowiedzialne pliki

- `app/author-verification/page.tsx`
- `components/author-verification/author-verification-list.tsx`
- `components/ui/rating-filter.tsx`

## Używane tabele

- `reviews`
- `businesses`
- `profiles`

## Ograniczenia

- Brak pobierania publicznego profilu autora z Google.
- Status weryfikacji jest obecnie mockowany jako `unverified`.
- Brak trwałego zapisu statusu weryfikacji w bazie.
- Brak filtra źródła w UI. Pole `source` może zostać wykorzystane w przyszłości po dodaniu innych serwisów, np. Facebook, Booking lub Yelp.

## Powiązane notatki

- [[Opinie]]
- [[Dashboard MVP]]
- [[Business]]
- [[Supabase]]
- [[Roadmap]]
