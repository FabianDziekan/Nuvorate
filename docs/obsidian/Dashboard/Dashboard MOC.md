---
tags:
  - dashboard
  - moc
  - product
---

# Dashboard MOC

Mapa wiedzy dla części produktowej związanej z panelem po zalogowaniu.

## Główne notatki

- [[Dashboard MVP]]: pełny opis aktualnego panelu.
- [[Statystyki]]: widgety, limity planu i wykres nowych opinii.
- [[Opinie]]: lista opinii, filtrowanie i paginacja.
- [[Odpowiedzi]]: generowanie, edycja, statusy i automatyczne odpowiedzi.
- [[Analiza]]: analiza reputacji, odświeżanie i limity analiz.
- [[Settings]]: nazwa firmy, branża, styl odpowiedzi i konto.
- [[Mockup panelu]]: tekstowy obraz aktualnego layoutu.

## Zależności techniczne

- [[Supabase]]: `profiles`, `businesses`, `reviews`, `ai_usage`, `ai_review_responses`, `ai_business_analyses`.
- [[Server Actions]]: `signOut`, `generateBusinessAnalysis`, `generateReviewResponse`, `saveSettings`.
- [[OpenAI]]: odpowiedzi na opinie i analiza reputacji.
- [[Stripe]]: aktywny plan i Customer Portal.
- [[Frontend]]: layout, Tailwind i komponenty klientowe.

## Powiązane notatki

- [[NuvoRate Hub]]
- [[Product MOC]]
- [[Development MOC]]
