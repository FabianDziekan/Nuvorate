---
tags:
  - faq
  - frontend
  - marketing
  - sales
  - website
---

# FAQ

FAQ powinien odpowiadać zgodnie z aktualnym stanem produktu, bez obiecywania funkcji, których jeszcze nie ma w kodzie.

## Pytania i odpowiedzi

### Czym różni się Starter od Business?

Oba plany dają dostęp do dashboardu, opinii, modułu NFC i funkcji reputacyjnych. Różnica w aktualnym kodzie dotyczy głównie limitów: Starter ma 50 odpowiedzi na opinie i 1 analizę reputacji miesięcznie, Business ma 350 odpowiedzi i 50 analiz miesięcznie.

### Czy do korzystania z NuvoRate potrzebna jest plakietka NFC?

Nie. NFC jest dodatkiem. NuvoRate może pokazywać link Google review URL zapisany przy firmie, a plakietka NFC może ten link ułatwiać klientom.

### Czy NuvoRate zbiera opinie we własnym formularzu?

Nie w aktualnym kodzie. NuvoRate kieruje klientów do Google review URL firmy i analizuje opinie zapisane w bazie aplikacji. Nie istnieje publiczny formularz `/r/[slug]`.

### Jak działa płatność?

Użytkownik wybiera plan, trafia do Stripe Checkout, a plan w Supabase zmienia dopiero Stripe webhook po potwierdzeniu subskrypcji.

### Co widzi użytkownik bez płatności?

Użytkownik z planem `unpaid` może przejść onboarding firmy i widzi ekran zachęcający do wyboru planu. Pełny dashboard, opinie, NFC i analiza wymagają Startera albo Business.

### Czy działa integracja Google Reviews API?

Nie. To funkcja planowana.

### Czy działają powiadomienia?

Nie jako pełny moduł. Ikony i pozycje nawigacji istnieją w UI, ale nie ma jeszcze tabeli ani logiki powiadomień.

## Powiązane notatki

- [[Cennik]]
- [[Jak działa]]
- [[Starter]]
- [[Business]]
- [[Stripe]]
- [[Website MOC]]
