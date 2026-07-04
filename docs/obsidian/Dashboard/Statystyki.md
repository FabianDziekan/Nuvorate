---
tags:
  - dashboard
  - product
  - supabase
---

# Statystyki

Widok statystyk w aktualnym dashboardzie pokazuje podstawowy stan reputacji firmy na podstawie danych z tabeli `public.reviews` oraz liczników planu z `public.ai_usage`.

## Aktualne widgety statystyk

- **Nowe opinie**: pokazuje `count(*)` wszystkich opinii aktualnej firmy z `public.reviews`.
- **Średnia ocena**: pokazuje średnią ocenę z pola `reviews.rating`, zaokrągloną do jednego miejsca po przecinku.
- **Pozytywne opinie**: pokazuje procent opinii z oceną `rating >= 4`.
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

## Trend opinii

Sekcja „Trend reputacji” w dashboardzie jest obecnie statycznym wykresem SVG. Nie jest jeszcze oparta o agregację danych z Supabase.

## Ograniczenia obecnego stanu

- Brak selektora zakresu dat działającego na zapytaniach.
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
