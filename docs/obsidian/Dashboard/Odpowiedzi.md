---
tags:
  - dashboard
  - openai
  - odpowiedzi
  - product
  - supabase
---

# Odpowiedzi

Zakładka `/responses` służy do zarządzania odpowiedziami na opinie klientów.

## Widok

Strona używa dashboardowego shell layoutu i wymaga płatnego planu.

Pokazuje:

- kartę „Ustawienia generowania”,
- listę opinii,
- filtry,
- paginację po 10 opinii,
- karty opinii z edytowalną odpowiedzią.

## Filtry

- Wszystkie,
- Bez odpowiedzi,
- Z odpowiedzią,
- 5★,
- 4★,
- 3★,
- 2★,
- 1★.

## Statusy odpowiedzi

Pole:

- `reviews.response_status`

Statusy:

- `pending`: bez odpowiedzi,
- `ready`: odpowiedź gotowa,
- `responded`: oznaczono jako odpowiedziano.

Treść odpowiedzi:

- `reviews.response_text`

## Akcje użytkownika

Na karcie opinii można:

- wygenerować odpowiedź,
- wygenerować ponownie,
- napisać ręcznie,
- zapisać,
- skopiować do schowka,
- oznaczyć jako odpowiedziano.

UI aktualizuje lokalny stan React bez pełnego odświeżania strony.

## Automatyczne odpowiedzi

Ustawienia są zapisywane w `business_response_settings`:

- `auto_generate`,
- `enabled_ratings`.

Po kliknięciu „Zapisz ustawienia” system:

1. zapisuje ustawienia,
2. znajduje opinie z pasującymi ocenami,
3. pomija opinie, które mają już `response_text`,
4. generuje odpowiedzi,
5. ustawia `response_status = ready`,
6. pokazuje toast z liczbą wygenerowanych odpowiedzi.

Nie istnieje jeszcze background job ani automatyczne generowanie poza kliknięciem zapisu.

## Styl odpowiedzi

Domyślny styl odpowiedzi zapisuje `/settings` w:

- `business_response_settings.response_tone`

Generator odpowiedzi przekazuje go do OpenAI jako `preferred_response_style`.

## Mapa techniczna

- **Strona**: `app/responses/page.tsx`
- **Komponenty**: `components/responses/response-card.tsx`, `components/responses/response-settings-card.tsx`, `components/ui/pagination.tsx`, `components/ui/ai-generation-progress.tsx`
- **Route handlers**: `app/api/responses/*`
- **Tabele**: `reviews`, `business_response_settings`, `ai_review_responses`, `ai_usage`
- **OpenAI**: `app/dashboard/review-response-service.ts`

## Powiązane notatki

- [[Opinie]]
- [[OpenAI]]
- [[Server Actions]]
- [[Settings]]
- [[Supabase]]
