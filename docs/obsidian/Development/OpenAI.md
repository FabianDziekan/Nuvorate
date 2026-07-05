---
tags:
  - analysis
  - backend
  - development
  - openai
  - opinie
---

# OpenAI

OpenAI jest używane do generowania odpowiedzi na opinie i analiz reputacji.

## Helper

Plik:

- `lib/openai.ts`

Funkcja:

- `generateStructuredOutput<T>()`

Korzysta z:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` albo domyślnego modelu z kodu
- Responses API
- Structured Outputs przez `text.format.json_schema`

## Konfiguracja

Plik:

- `lib/ai-config.ts`

Zawiera:

- `reviewResponseSchema`
- `businessAnalysisSchema`
- `reviewResponseSystemPrompt`
- `businessAnalysisSystemPrompt`

## Odpowiedzi na opinie

Implementacja:

- `app/dashboard/review-response-service.ts`

Wejście do OpenAI:

- nazwa firmy,
- preferowany styl odpowiedzi z `business_response_settings.response_tone`,
- autor opinii,
- ocena,
- treść opinii.

Wyjście:

- `{ "response": "..." }`

Zapis:

- `ai_review_responses`
- synchronizacja `reviews.response_text`, `reviews.response_status`, `reviews.response_generated_at`

## Analiza reputacji

Server action:

- `generateBusinessAnalysis` w `app/dashboard/actions.ts`

Wejście:

- dane firmy,
- zakres ostatnich 30 dni,
- opinie z `reviews`.

Wyjście:

- `score`
- `trend`
- `summary`
- `praised_elements`
- `reported_problems`
- `recommendations`

Zapis:

- `ai_business_analyses`

## Progress UI

Komponent:

- `components/ui/ai-generation-progress.tsx`

Używany przy:

- generowaniu/odświeżaniu analizy na dashboardzie,
- generowaniu/odświeżaniu analizy w `/analysis`,
- generowaniu odpowiedzi na dashboardzie,
- generowaniu odpowiedzi w `/responses`,
- automatycznym generowaniu odpowiedzi.

## Limity

OpenAI nie jest wywoływane przed sprawdzeniem limitu planu.

Limity:

- unpaid: 0 odpowiedzi, 0 analiz,
- starter: 50 odpowiedzi, 1 analiza,
- business: 350 odpowiedzi, 50 analiz.

Źródło konfiguracji:

- `lib/plans.ts`

Liczniki:

- `ai_usage`

## Powiązane notatki

- [[Inteligentna analiza]]
- [[Odpowiedzi]]
- [[Opinie]]
- [[Analiza]]
- [[Server Actions]]
- [[Supabase]]
