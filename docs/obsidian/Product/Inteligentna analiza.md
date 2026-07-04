---
tags:
  - analysis
  - openai
  - product
---

# Inteligentna analiza

Inteligentna analiza w aktualnym kodzie oznacza analizę reputacji generowaną przez OpenAI na podstawie opinii z ostatnich 30 dni zapisanych w `public.reviews`.

## Co działa

- Użytkownik może wygenerować analizę z `/dashboard` albo `/analysis`.
- Analiza wykorzystuje opinie aktualnej firmy z ostatnich 30 dni.
- Wynik jest zapisywany w `public.ai_business_analyses`.
- UI pokazuje najnowszą analizę.
- Analizy są limitowane przez `public.ai_usage`.

## Dane zwracane przez model

OpenAI zwraca JSON zgodny ze Structured Outputs:

- `score` od 0 do 100,
- `trend`: `up`, `down` albo `stable`,
- `summary`,
- `praised_elements`,
- `reported_problems`,
- `recommendations`.

Schemat i prompt znajdują się w `lib/ai-config.ts`.

## Limity

- Unpaid: 0 analiz miesięcznie.
- Starter: 1 analiza miesięcznie.
- Business: 50 analiz miesięcznie.

## Ważne ograniczenia

- Analiza nie pobiera danych bezpośrednio z Google Reviews API.
- Analiza nie uruchamia się automatycznie w harmonogramie.
- Odświeżenie tworzy nowy rekord, a nie nadpisuje poprzedniego.
- Analiza jest wsparciem decyzyjnym, nie nieomylną oceną firmy.

## Powiązane notatki

- [[Analiza]]
- [[Business]]
- [[Statystyki]]
- [[OpenAI]]
- [[Server Actions]]
- [[Product MOC]]
