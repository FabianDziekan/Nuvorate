---
tags:
  - analysis
  - backend
  - development
  - openai
  - opinie
---

# OpenAI

OpenAI jest używane do dwóch funkcji: odpowiedzi na pojedyncze opinie oraz analizy reputacji firmy.

## Helper

Plik:

- `lib/openai.ts`

Funkcja:

- `generateStructuredOutput<T>()`

Korzysta z:

- `OPENAI_API_KEY`,
- `OPENAI_MODEL` albo domyślnego `gpt-5.5`,
- OpenAI Responses API,
- Structured Outputs przez `text.format.json_schema`.

## Konfiguracja promptów i schematów

Plik:

- `lib/ai-config.ts`

Zawiera:

- `reviewResponseSchema`,
- `businessAnalysisSchema`,
- `reviewResponseSystemPrompt`,
- `businessAnalysisSystemPrompt`.

## Odpowiedzi na opinie

Wejście:

- nazwa firmy,
- autor opinii,
- ocena,
- treść opinii.

Wyjście:

- `{ "response": "..." }`

Zapis:

- `public.ai_review_responses`.

## Analiza reputacji

Wejście:

- dane firmy,
- zakres ostatnich 30 dni,
- opinie z `public.reviews`.

Wyjście:

- `score`,
- `trend`,
- `summary`,
- `praised_elements`,
- `reported_problems`,
- `recommendations`.

Zapis:

- `public.ai_business_analyses`.

## Limity

OpenAI nie jest wywoływane przed sprawdzeniem limitu planu. Limity są kontrolowane przez `public.ai_usage`.

## Mapa techniczna

- **Odpowiedzialne pliki**: `lib/openai.ts`, `lib/ai-config.ts`, `app/dashboard/actions.ts`, `app/dashboard/review-response-service.ts`.
- **Używane tabele**: `reviews`, `ai_review_responses`, `ai_business_analyses`, `ai_usage`, `profiles`, `businesses`.
- **Server actions**: `generateBusinessAnalysis`, `generateReviewResponse`.
- **Route handlers**: brak; OpenAI jest wywoływane przez server actions.
- **Zależności**: `OPENAI_API_KEY`, `OPENAI_MODEL`, [[Server Actions]], [[Supabase]], [[Starter]], [[Business]].

## Powiązane notatki

- [[Inteligentna analiza]]
- [[Opinie]]
- [[Analiza]]
- [[Server Actions]]
- [[Supabase]]
- [[Development MOC]]
