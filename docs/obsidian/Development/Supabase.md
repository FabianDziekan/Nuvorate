---
tags:
  - backend
  - database
  - development
  - supabase
---

# Supabase

Supabase obsługuje autoryzację, sesje i bazę danych NuvoRate.

## Klienci Supabase

- `lib/supabase/server.ts`: SSR, server components, actions i route handlers.
- `lib/supabase/client.ts`: klient browserowy auth.
- `lib/supabase/admin.ts`: service role, tylko server-side.
- `lib/supabase/middleware.ts`: odświeżanie sesji i ochrona tras.

## Tabele i funkcje

### `profiles`

Profil ownera powiązany z `auth.users`.

Kolumny: `user_id`, `full_name`, `first_name`, `plan`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `current_period_end`, `created_at`, `updated_at`.

Wykorzystanie: auth flow, dashboard, Settings, topbar, Stripe webhook, checkout, portal billingowy, limity planów.

### `businesses`

Jedna firma przypisana do ownera.

Kolumny: `id`, `owner_id`, `name`, `industry`, `city`, `google_review_url`, `setup_status`, `monthly_review_goal`, `created_at`, `updated_at`.

Wykorzystanie: onboarding, dashboard, reviews, responses, analysis, nfc, settings. `monthly_review_goal` zasila kartę „Cel miesiąca” na Dashboardzie.

### `reviews`

Opinie klientów.

Kolumny: `id`, `business_id`, `author_name`, `rating`, `content`, `source`, `created_at`, `response_text`, `response_status`, `response_generated_at`.

Wykorzystanie: dashboard, `/reviews`, `/responses`, odpowiedzi OpenAI, analiza reputacji, wykres aktywności opinii.

### `ai_review_responses`

Wygenerowane odpowiedzi na opinie.

Kolumny: `id`, `business_id`, `review_id`, `response_text`, `model`, `created_at`, `updated_at`.

Wykorzystanie: dashboard i generator odpowiedzi. Aktualny kod synchronizuje także pola odpowiedzi bezpośrednio do `reviews`.

### `ai_business_analyses`

Analizy reputacji firmy.

Kolumny: `id`, `business_id`, `period_start`, `period_end`, `review_count`, `score`, `trend`, `summary`, `praised_elements`, `reported_problems`, `recommendations`, `model`, `created_at`, `updated_at`.

Wykorzystanie: `/dashboard`, `/analysis`, OpenAI.

### `ai_usage`

Miesięczne liczniki limitów.

Kolumny: `id`, `user_id`, `period_month`, `ai_replies_used`, `ai_analyses_used`, `created_at`, `updated_at`.

Unikalność: `user_id + period_month`.

### `business_response_settings`

Ustawienia odpowiedzi dla firmy.

Kolumny: `id`, `business_id`, `auto_generate`, `enabled_ratings`, `response_tone`, `created_at`, `updated_at`.

Wykorzystanie: `/responses` automatyczne odpowiedzi, `/settings` styl odpowiedzi, generator odpowiedzi OpenAI.

### `notifications`

Historia powiadomień aplikacyjnych.

Kolumny: `id`, `business_id`, `type`, `title`, `message`, `is_read`, `created_at`.

Wykorzystanie: dzwonek w topbarze, badge w sidebarze, `/notifications`.

Aktualny MVP pokazuje i liczy tylko `type = 'new_review'`. Inne typy mogą istnieć w constraintach, ale nie są tworzone ani wyświetlane przez aplikację.

### `get_review_activity_trend(p_business_id, p_range)`

RPC z migracji `007_review_activity_trend.sql`.

Zwraca agregację opinii:

- `30d`: po dniach,
- `3m`: po tygodniach,
- `12m`: po miesiącach.

Historyczna funkcja agregująca. Aktualny dashboard buduje bucketowanie wykresu w kodzie `app/dashboard/page.tsx`, aby obsłużyć również zakres niestandardowy.

## Migracje

- `001_initial_schema.sql`: `profiles`, `businesses`.
- `002_reviews.sql`: `reviews`.
- `003_ai_features.sql`: `ai_review_responses`, `ai_business_analyses`.
- `004_business_analysis_score_trend.sql`: `score`, `trend`.
- `005_stripe_subscriptions.sql`: pola Stripe w `profiles`.
- `006_unpaid_plan_ai_usage.sql`: plan `unpaid`, `ai_usage`.
- `007_review_activity_trend.sql`: RPC trendu aktywności opinii.
- `008_review_responses.sql`: pola odpowiedzi w `reviews`, `business_response_settings`.
- `009_settings_fields.sql`: `business_response_settings.response_tone`.
- `010_notifications.sql`: tabela `notifications` i trigger pierwszej wersji powiadomień.
- `011_new_review_notification_preview.sql`: preview treści opinii w powiadomieniu.
- `012_fix_new_review_notification_payload.sql`: poprawiony JSON payload dla `new_review`.
- `013_monthly_review_goal.sql`: `businesses.monthly_review_goal`.
- `014_profile_first_name.sql`: `profiles.first_name` i zapis imienia z rejestracji.

## RLS

Owner może czytać i edytować własne dane. Operacje krytyczne, takie jak webhook Stripe i liczniki AI, używają service role po stronie server.

## Diagram danych

```mermaid
erDiagram
  auth_users ||--|| profiles : "user_id"
  profiles ||--|| businesses : "owner_id"
  businesses ||--o{ reviews : "business_id"
  businesses ||--o{ ai_review_responses : "business_id"
  reviews ||--|| ai_review_responses : "review_id"
  businesses ||--o{ ai_business_analyses : "business_id"
  profiles ||--o{ ai_usage : "user_id"
  businesses ||--|| business_response_settings : "business_id"
  businesses ||--o{ notifications : "business_id"
```

## Powiązane notatki

- [[Backend]]
- [[Server Actions]]
- [[Autoryzacja]]
- [[Stripe]]
- [[OpenAI]]
- [[Settings]]
