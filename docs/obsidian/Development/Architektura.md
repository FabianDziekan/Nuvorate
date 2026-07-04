---
tags:
  - architecture
  - backend
  - development
  - frontend
  - moc
---

# Architektura

NuvoRate jest aplikacją Next.js App Router z backendem Supabase, billingiem Stripe i integracją OpenAI.

## Główne warstwy

- **Next.js App Router**: strony, route handlers i server actions.
- **Supabase Auth**: sesje użytkowników.
- **Supabase Database**: dane aplikacyjne.
- **Stripe**: subskrypcje i portal klienta.
- **OpenAI**: generowanie odpowiedzi i analiz reputacji.
- **Tailwind CSS**: warstwa UI.

## Diagram przepływu aplikacji

```mermaid
flowchart TD
  Visitor["Gość"] --> Landing["Landing page /"]
  Landing --> Register["/register"]
  Landing --> Login["/login"]
  Register --> SupabaseAuth["Supabase Auth"]
  Login --> SupabaseAuth
  SupabaseAuth --> Onboarding["/onboarding"]
  Onboarding --> Businesses["businesses"]
  Businesses --> Dashboard["/dashboard"]
  Dashboard --> Reviews["reviews"]
  Dashboard --> Analysis["ai_business_analyses"]
  Dashboard --> Usage["ai_usage"]
  Dashboard --> StripeCheckout["/checkout"]
  StripeCheckout --> Stripe["Stripe"]
  Stripe --> Webhook["/api/stripe/webhook"]
  Webhook --> Profiles["profiles"]
```

## Diagram modułów

```mermaid
flowchart LR
  Auth["Auth"] --> Profiles["profiles"]
  Profiles --> Plans["lib/plans.ts"]
  Profiles --> StripeModule["Stripe"]
  Profiles --> Dashboard["Dashboard"]
  Businesses["businesses"] --> Dashboard
  Businesses --> ReviewsPage["Opinie"]
  Businesses --> Nfc["NFC"]
  Reviews["reviews"] --> Dashboard
  Reviews --> ReviewsPage
  Reviews --> OpenAIActions["Server Actions + OpenAI"]
  OpenAIActions --> ReviewResponses["ai_review_responses"]
  OpenAIActions --> BusinessAnalyses["ai_business_analyses"]
  OpenAIActions --> Usage["ai_usage"]
  StripeModule --> Webhook["Webhook"]
  Webhook --> Profiles
```

## Server/client boundary

Szczególnie ważne jest rozdzielenie server actions od client components.

- Client component `ReviewResponseForm` importuje action-browser wrapper `app/dashboard/review-response-actions.ts`.
- Wrapper wywołuje server-only implementację `app/dashboard/review-response-service.ts`.
- Nie należy przekazywać server action jako prop do client componentu.
- Nie należy importować głównego `app/dashboard/actions.ts` bezpośrednio do client componentów.

## Powiązane notatki

- [[Frontend]]
- [[Backend]]
- [[Server Actions]]
- [[Supabase]]
- [[Stripe]]
- [[OpenAI]]
- [[Development MOC]]
