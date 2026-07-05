---
tags:
  - dashboard
  - openai
  - opinie
  - product
  - supabase
---

# Opinie

Moduł opinii pokazuje opinie przypisane do aktualnej firmy ownera. Dane pochodzą z `public.reviews`.

## Dashboard

Na `/dashboard` sekcja „Najnowsze opinie klientów” pobiera 3 najnowsze opinie po `created_at desc`.

Wyświetla:

- autora,
- relatywną datę,
- ocenę,
- treść,
- wygenerowaną odpowiedź,
- akcję generowania odpowiedzi, jeśli limit nie jest wykorzystany.

## Strona `/reviews`

Strona pokazuje pełną listę opinii aktualnej firmy.

Funkcje:

- filtrowanie po ocenie: Wszystkie, 5, 4, 3, 2, 1,
- paginacja po 10 opinii na stronę,
- tekst „Wyświetlanie X–Y z Z opinii”,
- przyciski Poprzednia/Następna i numery stron,
- reset strony do 1 po zmianie filtra,
- pusty stan dla braku opinii.

Wspólny komponent paginacji:

- `components/ui/pagination.tsx`

## Odpowiedzi na opinie

Odpowiedzi na dashboardzie generuje:

- `components/dashboard/review-response-form.tsx`
- `app/dashboard/review-response-actions.ts`
- `app/dashboard/review-response-service.ts`

Odpowiedzi w pełnym module są opisane w [[Odpowiedzi]].

## Limity

Jeżeli `remainingReplies <= 0`, UI nie pokazuje aktywnego przycisku generowania. Widoczny jest tekst:

> Limit odpowiedzi wykorzystany

Backend nadal sprawdza limit w `review-response-service`.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/reviews/page.tsx`, `app/dashboard/page.tsx`, `components/ui/pagination.tsx`.
- **Tabele**: `businesses`, `profiles`, `reviews`, `ai_review_responses`, `ai_usage`.
- **Server actions**: `generateReviewResponse`.
- **Route handlers**: brak dla samej listy `/reviews`.

## Powiązane notatki

- [[Dashboard MVP]]
- [[Odpowiedzi]]
- [[Analiza]]
- [[Supabase]]
- [[OpenAI]]
