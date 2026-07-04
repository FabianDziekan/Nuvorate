---
tags:
  - dashboard
  - openai
  - opinie
  - product
  - supabase
---

# Opinie

Moduł opinii pokazuje opinie przypisane do aktualnej firmy ownera. Dane pochodzą z tabeli `public.reviews`.

## Widok dashboardu

Na `/dashboard` sekcja „Najnowsze opinie klientów” pobiera 3 najnowsze opinie:

- `id`,
- `author_name`,
- `rating`,
- `content`,
- `created_at`.

Opinie są sortowane po `created_at desc` i filtrowane po `business.id` aktualnej firmy.

## Strona `/reviews`

Strona `/reviews` pokazuje pełną listę opinii aktualnej firmy.

Aktualnie obsługuje:

- pobranie zalogowanego użytkownika z Supabase Auth,
- pobranie firmy z `public.businesses`,
- pobranie wszystkich opinii z `public.reviews`,
- sortowanie po `created_at desc`,
- filtr po ocenie: Wszystkie, 5, 4, 3, 2, 1,
- pusty stan, gdy firma nie ma opinii,
- blokadę dostępu dla planu `unpaid`.

Wyświetlane pola:

- autor,
- ocena,
- treść,
- źródło,
- data utworzenia.

## Generowanie odpowiedzi

Odpowiedzi przy opiniach są generowane z poziomu dashboardu.

Komponent UI:

- `components/dashboard/review-response-form.tsx`

Server action dla klientowego formularza:

- `app/dashboard/review-response-actions.ts`

Implementacja serwerowa:

- `app/dashboard/review-response-service.ts`

Przepływ:

1. Użytkownik klika „Wygeneruj odpowiedź” albo „Wygeneruj ponownie”.
2. Formularz wywołuje server action `generateReviewResponse`.
3. Serwer sprawdza zalogowanego użytkownika.
4. Serwer pobiera `profiles.plan`.
5. Serwer sprawdza limit odpowiedzi z `ai_usage`.
6. Serwer pobiera firmę ownera i opinię należącą do tej firmy.
7. OpenAI generuje odpowiedź według schematu z `lib/ai-config.ts`.
8. Wynik jest zapisywany lub nadpisywany w `public.ai_review_responses`.
9. Licznik `ai_replies_used` jest zwiększany w `public.ai_usage`.
10. Dashboard jest odświeżany przez `revalidatePath("/dashboard")`.

## Limity odpowiedzi

Limity są egzekwowane po stronie backendu i dodatkowo pokazywane w UI.

- Starter: 50 odpowiedzi na opinie miesięcznie.
- Business: 350 odpowiedzi na opinie miesięcznie.
- Unpaid: brak dostępu do odpowiedzi.

Jeżeli `remainingReplies <= 0`, karta opinii nie pokazuje aktywnego przycisku generowania. Zamiast niego pokazuje tekst:

> Limit odpowiedzi wykorzystany

Backend nadal niezależnie blokuje wywołanie po przekroczeniu limitu.

## Obecne ograniczenia

- Brak integracji Google Reviews API.
- Brak własnego publicznego formularza opinii NuvoRate.
- Brak statusów opinii typu „przeczytana”, „obsłużona”, „wymaga reakcji”.
- Brak wyszukiwarki tekstowej w `/reviews`.
- Brak paginacji.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/reviews/page.tsx`, `app/dashboard/page.tsx`, `app/dashboard/review-response-actions.ts`, `app/dashboard/review-response-service.ts`.
- **Komponenty**: `components/dashboard/review-response-form.tsx`, `components/dashboard/review-response-state.ts`.
- **Używane tabele**: `businesses`, `profiles`, `reviews`, `ai_review_responses`, `ai_usage`.
- **Server actions**: `generateReviewResponse`.
- **Route handlers**: brak dedykowanego route handlera dla opinii; widoki pobierają dane server-side przez Supabase.
- **Zależności**: [[Supabase]], [[OpenAI]], [[Server Actions]], [[Dashboard MVP]].

## Powiązane notatki

- [[Dashboard MVP]]
- [[Analiza]]
- [[Statystyki]]
- [[Server Actions]]
- [[Supabase]]
- [[OpenAI]]
- [[Dashboard MOC]]
