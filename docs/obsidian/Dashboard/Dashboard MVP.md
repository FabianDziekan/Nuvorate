---
tags:
  - dashboard
  - mvp
  - openai
  - product
  - stripe
  - supabase
---

# Dashboard MVP

Dashboard jest głównym widokiem produktu po zalogowaniu. Kod znajduje się w `app/dashboard/page.tsx`.

## Dostęp

Dashboard wymaga:

- sesji Supabase Auth,
- profilu w `profiles`,
- firmy w `businesses`.

Jeżeli owner nie ma firmy, trafia do `/onboarding`.

Jeżeli plan to `unpaid`, dashboard pokazuje ekran aktywacji planu z przełącznikiem miesięcznie/rocznie i kartami Starter/Business.

## Layout

Desktop:

- sidebar po lewej,
- topbar,
- karty statystyk,
- karta „Limity planu”,
- wykres „Nowe opinie w czasie”,
- Business Insights dla planu Business,
- karta „Analiza ostatnich 30 dni”,
- sekcja „Najnowsze opinie klientów”.

Mobile:

- topbar z logo,
- pozioma nawigacja,
- sekcje układane pionowo.

## Sidebar

Linki:

- Pulpit,
- Opinie,
- Analiza,
- Odpowiedzi,
- NFC,
- Powiadomienia jako nieaktywna pozycja,
- Ustawienia.

Sidebar pokazuje nazwę firmy, branżę, miasto i plan.

## Statystyki

Źródło danych: `reviews`.

- **Nowe opinie**: aktualnie liczba wszystkich opinii firmy.
- **Średnia ocena**: `AVG(rating)` z dokładnością do 1 miejsca.
- **Pozytywne opinie**: procent opinii `rating >= 4`.
- **Skany NFC**: obecnie `0`, bez tabeli trackingowej.

## Limity planu

Źródła:

- `profiles.plan`,
- `ai_usage`,
- `lib/plans.ts`.

Karta pokazuje:

- pozostałe odpowiedzi na opinie,
- pozostałe analizy reputacji,
- procent wykorzystania,
- tekst „Wykorzystano X z Y”.

## Wykres „Nowe opinie w czasie”

Źródło:

- RPC `get_review_activity_trend` z migracji `007_review_activity_trend.sql`.

Zakresy:

- ostatnie 30 dni: grupowanie po dniach,
- ostatnie 3 miesiące: grupowanie po tygodniach,
- ostatnie 12 miesięcy: grupowanie po miesiącach.

Wykres jest słupkowy i pokazuje liczbę opinii w okresie. Tooltip pokazuje okres, liczbę opinii i średnią ocenę.

## Business Insights

Widoczne tylko dla planu Business.

Liczone z `reviews.created_at`:

- najlepszy dzień z ostatnich 7 dni,
- powtarzalność względem poprzednich 7 dni,
- tempo opinii tydzień do tygodnia,
- cel miesiąca: domyślnie 30 opinii.

## Analiza reputacji

Karta `components/dashboard/analysis-preview-card.tsx` pokazuje najnowszą analizę z `ai_business_analyses`.

Przycisk generowania/odświeżania korzysta z:

- `components/dashboard/analysis-action-form.tsx`,
- `generateBusinessAnalysis` w `app/dashboard/actions.ts`,
- `AiGenerationProgress`.

## Najnowsze opinie

Dashboard pobiera 3 najnowsze opinie firmy.

Karta opinii pokazuje:

- autora,
- datę relatywną,
- ocenę,
- treść,
- wygenerowaną odpowiedź, jeśli istnieje,
- przycisk generowania odpowiedzi, jeśli limit nie jest wykorzystany.

Generowanie odpowiedzi używa `components/dashboard/review-response-form.tsx`.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/dashboard/page.tsx`, `app/dashboard/actions.ts`, `app/dashboard/review-response-actions.ts`, `app/dashboard/review-response-service.ts`.
- **Komponenty**: `analysis-action-form`, `analysis-preview-card`, `review-response-form`, `trend-range-select`, `ai-generation-progress`.
- **Tabele**: `profiles`, `businesses`, `reviews`, `ai_usage`, `ai_review_responses`, `ai_business_analyses`, `business_response_settings`.
- **RPC**: `get_review_activity_trend`.

## Diagram

```mermaid
flowchart TD
  Dashboard["/dashboard"] --> Profiles["profiles"]
  Dashboard --> Businesses["businesses"]
  Dashboard --> Reviews["reviews"]
  Dashboard --> Usage["ai_usage"]
  Dashboard --> TrendRpc["get_review_activity_trend"]
  Dashboard --> Analyses["ai_business_analyses"]
  Dashboard --> ResponseForm["ReviewResponseForm"]
  ResponseForm --> ResponseService["review-response-service"]
  AnalysisForm["AnalysisActionForm"] --> GenerateAnalysis["generateBusinessAnalysis"]
  ResponseService --> OpenAI["OpenAI"]
  GenerateAnalysis --> OpenAI
```

## Powiązane notatki

- [[Statystyki]]
- [[Opinie]]
- [[Odpowiedzi]]
- [[Analiza]]
- [[NFC]]
- [[Settings]]
- [[Server Actions]]
- [[Supabase]]
