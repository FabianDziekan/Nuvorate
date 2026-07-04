---
tags:
  - analysis
  - dashboard
  - openai
  - product
  - supabase
---

# Analiza

Widok analizy reputacji pokazuje ostatni zapisany raport wygenerowany przez OpenAI dla aktualnej firmy. Dane są przechowywane w `public.ai_business_analyses`.

## Strona `/analysis`

Strona:

- wymaga zalogowanego użytkownika,
- pobiera firmę ownera z `public.businesses`,
- pobiera plan z `public.profiles`,
- dla planów płatnych pobiera najnowszą analizę z `public.ai_business_analyses`,
- pokazuje pusty stan, gdy analiza jeszcze nie istnieje,
- pokazuje ekran wyboru planu dla `unpaid`.

## Tworzenie i odświeżanie analizy

Analiza jest tworzona przez server action:

- `generateBusinessAnalysis` w `app/dashboard/actions.ts`

Wywołania:

- formularz na `/dashboard`,
- formularz na `/analysis`.

Przepływ:

1. Server action pobiera aktualnego użytkownika.
2. Pobiera firmę z `public.businesses`.
3. Pobiera plan z `public.profiles`.
4. Sprawdza limit analiz w `public.ai_usage`.
5. Pobiera opinie z ostatnich 30 dni z `public.reviews`.
6. Wysyła dane do OpenAI przez `lib/openai.ts`.
7. Oczekuje wyniku zgodnego ze Structured Outputs:
   - `score`,
   - `trend`,
   - `summary`,
   - `praised_elements`,
   - `reported_problems`,
   - `recommendations`.
8. Zapisuje nowy rekord w `public.ai_business_analyses`.
9. Zwiększa `ai_analyses_used` w `public.ai_usage`.
10. Odświeża `/dashboard` i `/analysis`.

Odświeżenie analizy nie nadpisuje starego rekordu. Tworzy nowy wpis, a UI pobiera najnowszy rekord po `created_at desc`.

## Limity analiz

- `unpaid`: 0 analiz reputacji miesięcznie.
- `starter`: 1 analiza reputacji miesięcznie.
- `business`: 50 analiz reputacji miesięcznie.

Komunikaty limitów są generowane przez `getAiLimitMessage()` w `lib/plans.ts`.

## Wyświetlane dane

Gdy analiza zawiera `score` i `trend`, strona pokazuje:

- Reputation Score 0-100,
- trend: `up`, `down` albo `stable`,
- executive summary,
- mocne strony,
- problemy,
- rekomendacje,
- zakres raportu,
- liczbę opinii wykorzystanych w analizie.

Kod obsługuje także starszy schemat bez kolumn `score` i `trend`, pokazując wtedy stan pusty zamiast błędu 500.

## Obecne ograniczenia

- Analiza bazuje tylko na opiniach zapisanych w `public.reviews`.
- Brak automatycznego harmonogramu tygodniowego lub miesięcznego.
- Brak eksportu raportu.
- Brak rozbicia na lokalizacje.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/analysis/page.tsx`, `app/dashboard/page.tsx`, `app/dashboard/actions.ts`.
- **Komponenty**: formularze server action osadzone w widokach `/analysis` i `/dashboard`.
- **Używane tabele**: `businesses`, `profiles`, `reviews`, `ai_business_analyses`, `ai_usage`.
- **Server actions**: `generateBusinessAnalysis`.
- **Route handlers**: brak dedykowanego route handlera; zapis odbywa się przez server action.
- **Zależności**: [[Supabase]], [[OpenAI]], [[Server Actions]], [[Business]].

## Powiązane notatki

- [[Inteligentna analiza]]
- [[Opinie]]
- [[Statystyki]]
- [[Business]]
- [[OpenAI]]
- [[Server Actions]]
- [[Supabase]]
- [[Dashboard MOC]]
