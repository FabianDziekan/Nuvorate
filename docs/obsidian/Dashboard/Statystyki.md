---
tags:
  - dashboard
  - product
  - supabase
---

# Statystyki

Widok statystyk w aktualnym dashboardzie pokazuje podstawowy stan reputacji firmy na podstawie danych z tabeli `public.reviews` oraz liczników planu z `public.ai_usage`.

## Aktualne widgety statystyk

- **Nowe opinie**: pokazuje `count(*)` opinii aktualnej firmy w wybranym zakresie dat.
- **Średnia ocena**: pokazuje średnią ocenę z pola `reviews.rating` w wybranym zakresie, zaokrągloną do jednego miejsca po przecinku.
- **Pozytywne opinie**: pokazuje procent opinii z oceną `rating >= 4` w wybranym zakresie.
- **Skany NFC**: obecnie pokazuje `0` i tekst „Śledzenie NFC”; prawdziwe śledzenie skanów nie ma jeszcze tabeli ani eventów.

## Limity planu

Dashboard pokazuje kartę „Limity planu”, która pobiera:

- plan z `public.profiles.plan`,
- użycie odpowiedzi i analiz z `public.ai_usage`,
- limity z `lib/plans.ts`.

Aktualne limity:

- `unpaid`: 0 odpowiedzi na opinie, 0 analiz reputacji,
- `starter`: 50 odpowiedzi na opinie miesięcznie, 1 analiza reputacji miesięcznie,
- `business`: 350 odpowiedzi na opinie miesięcznie, 50 analiz reputacji miesięcznie.

Karta pokazuje:

- ile odpowiedzi na opinie pozostało,
- ile analiz reputacji pozostało,
- procent wykorzystania,
- tekst „Wykorzystano X z Y”.

## Nowe opinie w czasie

Sekcja „Nowe opinie w czasie” jest podłączona do realnych danych z `public.reviews`.

- Zakres „Ostatnie 30 dni” grupuje opinie po dniach.
- Zakres „Ostatnie 3 miesiące” grupuje opinie po tygodniach.
- Zakres „Ostatnie 12 miesięcy” grupuje opinie po miesiącach.
- Zakres niestandardowy używa parametrów `from` i `to` w URL.
- Aktualny kod buduje okresy wykresu w `app/dashboard/page.tsx` na podstawie `reviews.created_at` i `reviews.rating`, aby obsłużyć także zakres niestandardowy.
- Dni lub okresy z `0` opinii są renderowane jako neutralne minimalne słupki, ale tooltip pokazuje prawdziwą wartość `0`.
- Tooltip pokazuje okres, liczbę nowych opinii i średnią ocenę dla danego okresu.

## Business Insights

Dla planu Business dashboard pokazuje:

- **Najlepszy dzień**: najczęstszy dzień tygodnia w wybranym zakresie.
- **Ten miesiąc**: liczba opinii w bieżącym miesiącu kalendarzowym i różnica względem poprzedniego miesiąca.
- **Cel miesiąca**: postęp względem `businesses.monthly_review_goal`, edytowany inline bez modala.

## Ograniczenia obecnego stanu

- Brak porównania z poprzednim okresem.
- Brak realnych danych skanów NFC.
- Brak osobnych statusów opinii typu „przeczytana” albo „obsłużona”.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Opinie]]
- [[Analiza]]
- [[Supabase]]
- [[Server Actions]]
- [[Dashboard MOC]]
