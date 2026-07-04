---
tags:
  - blueprint
  - frontend
  - marketing
  - website
---

# Website Blueprint

Website Blueprint opisuje strukturę strony głównej NuvoRate zgodną z aktualnym stanem produktu. Strona promuje abonament SaaS jako główny produkt. NFC jest dodatkiem wspierającym kierowanie klientów do Google review URL.

## Cel strony

Strona główna ma:

- wyjaśnić, że NuvoRate to platforma do zarządzania opiniami i reputacją online,
- sprzedać abonament Starter albo Business,
- pokazać dashboard jako centrum produktu,
- jasno rozdzielić gotowe funkcje od planowanych,
- nie sugerować, że NuvoRate ma własny publiczny formularz opinii albo Google Reviews API, dopóki te funkcje nie istnieją.

## Nawigacja

- Logo NuvoRate.
- Funkcje.
- Jak działa.
- Cennik.
- FAQ.
- Przełącznik PL / EN jako element UI.
- Zaloguj się.
- Załóż konto.

## Hero

Nagłówek:

> Więcej opinii. Większe zaufanie. Więcej klientów.

Opis:

> NuvoRate pomaga monitorować opinie, analizować reputację i szybciej reagować na głos klientów. Dashboard pokazuje najważniejsze statystyki, opinie, limity planu i analizę reputacji w jednym miejscu.

CTA:

- „Załóż konto”
- „Zobacz cennik”

## Dashboard Preview

Preview powinien pokazywać aktualne elementy:

- nowe opinie,
- średnia ocena,
- pozytywne opinie,
- skany NFC jako `0` albo „Śledzenie NFC”,
- limity planu,
- najnowsze opinie,
- generowanie odpowiedzi,
- analizę reputacji.

Nie należy pokazywać jako gotowych:

- realnych skanów NFC,
- powiadomień,
- Google Reviews API,
- wielu lokalizacji.

## Korzyści

- Wszystkie opinie w jednym panelu.
- Szybsze przygotowanie odpowiedzi.
- Lepsze zrozumienie mocnych stron i problemów.
- Jasne limity i plany.
- Link Google review URL gotowy do użycia na NFC lub QR.

## Jak działa NuvoRate

1. Zakładasz konto.
2. Wybierasz plan i opłacasz subskrypcję przez Stripe.
3. Uzupełniasz dane firmy i Google review URL.
4. Pracujesz z opiniami w dashboardzie.
5. Generujesz odpowiedzi i analizy w ramach limitów planu.

## NFC

Sekcja NFC powinna mówić:

- NFC jest dodatkiem,
- link prowadzi do Google review URL firmy,
- aktualny panel pokazuje link i instrukcję,
- tracking skanów jest funkcją planowaną.

## Cennik

Starter:

- 49,99 zł miesięcznie,
- 50 odpowiedzi na opinie,
- 1 analiza reputacji.

Business:

- 229,99 zł miesięcznie,
- 350 odpowiedzi na opinie,
- 50 analiz reputacji,
- oznaczenie „Najczęściej wybierany”.

## FAQ

FAQ powinno obejmować:

- różnice Starter/Business,
- zasady płatności Stripe,
- status `unpaid`,
- NFC jako dodatek,
- brak Google Reviews API w aktualnym MVP,
- brak publicznego formularza opinii NuvoRate.

## Styl wizualny

- Tło: białe.
- Akcent: fiolet `#5B5CF6`.
- Tekst: czerń `#0F0F10`.
- Styl: nowoczesny SaaS, premium, przejrzysty.
- Język główny: polski.

## Powiązane notatki

- [[Hero]]
- [[Funkcje]]
- [[Jak działa]]
- [[Cennik]]
- [[FAQ]]
- [[Dashboard MVP]]
- [[Website MOC]]
