---
tags:
  - plans
  - pricing
  - product
  - stripe
---

# NuvoRate Business

Business to płatny abonament dla firm, które potrzebują większych limitów odpowiedzi i analiz reputacji.

## Cena

- 229,99 zł miesięcznie.
- Plan aktywuje Stripe webhook po potwierdzeniu subskrypcji.

Komunikacja cenowa jest utrzymywana razem z [[Cennik]], a techniczna aktywacja planu z [[Stripe]].

## Zakres w aktualnym kodzie

Business daje dostęp do tych samych głównych modułów co Starter:

- dashboard,
- opinie,
- moduł NFC,
- generowanie odpowiedzi,
- analiza reputacji,
- Stripe Customer Portal.

Różnica w aktualnym kodzie polega przede wszystkim na limitach planu.

## Limity

- 350 odpowiedzi na opinie miesięcznie.
- 50 analiz reputacji miesięcznie.

Limity są zdefiniowane w `lib/plans.ts` i egzekwowane po stronie backendu.

## Komunikacja w UI

Business jest oznaczany w landing page jako „Najczęściej wybierany”.

## Funkcje planowane

Te elementy są kierunkiem rozwoju Business, ale nie są jeszcze gotowe w kodzie:

- zaawansowane raporty,
- wiele lokalizacji,
- automatyczne raporty okresowe,
- rozbudowane powiadomienia,
- integracja Google Reviews API.

## Powiązane notatki

- [[Starter]]
- [[Inteligentna analiza]]
- [[Statystyki]]
- [[Cennik]]
- [[Stripe]]
- [[Product MOC]]
