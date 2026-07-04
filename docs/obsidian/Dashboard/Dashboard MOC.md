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
- [[Statystyki]]: widgety, limity planu i trend reputacji.
- [[Opinie]]: lista opinii, odpowiedzi na opinie i limity odpowiedzi.
- [[Analiza]]: analiza reputacji, odświeżanie i limity analiz.
- [[Mockup panelu]]: tekstowy obraz aktualnego layoutu.

## Zależności techniczne

- [[Supabase]]: `profiles`, `businesses`, `reviews`, `ai_usage`, `ai_review_responses`, `ai_business_analyses`.
- [[Server Actions]]: `signOut`, `generateBusinessAnalysis`, `generateReviewResponse`.
- [[OpenAI]]: odpowiedzi na opinie i analiza reputacji.
- [[Stripe]]: aktywny plan i Customer Portal.
- [[Frontend]]: layout, Tailwind i komponenty klientowe.

## Powiązane notatki

- [[NuvoRate Hub]]
- [[Product MOC]]
- [[Development MOC]]

