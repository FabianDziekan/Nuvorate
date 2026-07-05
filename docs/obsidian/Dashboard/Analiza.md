---
tags:
  - analysis
  - dashboard
  - openai
  - product
  - supabase
---

# Analiza

Analiza reputacji pokazuje ostatni zapisany raport OpenAI dla aktualnej firmy.

## Strona `/analysis`

Wymaga:

- sesji Supabase,
- firmy,
- profilu,
- płatnego planu.

Dla `unpaid` pokazuje ekran wyboru planu.

## Tworzenie i odświeżanie

Akcja:

- `generateBusinessAnalysis` w `app/dashboard/actions.ts`

Formularz:

- `components/dashboard/analysis-action-form.tsx`

Ten sam komponent działa na dashboardzie i w `/analysis`.

Przepływ:

1. Sprawdzenie użytkownika.
2. Pobranie firmy i planu.
3. Sprawdzenie limitu analiz w `ai_usage`.
4. Pobranie opinii z ostatnich 30 dni.
5. OpenAI Structured Output.
6. Zapis do `ai_business_analyses`.
7. Zwiększenie `ai_usage.ai_analyses_used`.
8. Rewalidacja `/dashboard` i `/analysis`.

## Wyświetlane dane

- Reputation Score 0-100,
- trend: `up`, `down`, `stable`,
- executive summary,
- najczęściej chwalone elementy,
- najczęściej zgłaszane problemy,
- rekomendacje,
- liczba opinii,
- data ostatniej aktualizacji.

Dashboard pokazuje skróconą kartę z przewijaną treścią i przyciskiem odświeżenia.

## Limity

- unpaid: 0 analiz,
- starter: 1 analiza miesięcznie,
- business: 50 analiz miesięcznie.

## Obecne ograniczenia

- Brak harmonogramu automatycznego.
- Brak eksportu raportu.
- Brak wielu lokalizacji.
- Analiza bazuje tylko na danych w `reviews`, bez Google Reviews API.

## Powiązane notatki

- [[Inteligentna analiza]]
- [[Dashboard MVP]]
- [[OpenAI]]
- [[Server Actions]]
- [[Supabase]]
