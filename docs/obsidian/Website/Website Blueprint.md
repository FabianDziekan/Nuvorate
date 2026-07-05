---
tags:
  - blueprint
  - frontend
  - landing
  - website
---

# Website Blueprint

Blueprint opisuje aktualną stronę główną NuvoRate. Strona promuje abonament SaaS, a NFC jest dodatkiem.

## Cel

- Wyjaśnić w kilka sekund, czym jest NuvoRate.
- Sprzedać Starter albo Business.
- Pokazać dashboard jako główne centrum produktu.
- Kierować do rejestracji, logowania i checkoutu.

## Nawigacja

- Logo NuvoRate.
- Funkcje.
- Jak działa.
- Cennik.
- FAQ.
- PL / EN jako element UI.
- Zaloguj się.
- Załóż konto.

## Hero

Nagłówek:

> Więcej opinii. Większe zaufanie. Więcej klientów.

Hero pokazuje mockup dashboardu z:

- statystykami opinii,
- średnią oceną,
- pozytywnymi opiniami,
- skanami NFC,
- analizą reputacji,
- generowaniem odpowiedzi.

## Cennik

Strona używa `lib/pricing.ts`.

Przełącznik:

- Miesięcznie,
- Rocznie.

Starter:

- 49,99 zł / miesiąc,
- 499,99 zł / rok,
- około 41,67 zł miesięcznie,
- oszczędność około 100 zł rocznie.

Business:

- 229,99 zł / miesiąc,
- 2299,99 zł / rok,
- około 191,67 zł miesięcznie,
- oszczędność około 460 zł rocznie,
- oznaczenie „Najczęściej wybierany”.

Jeżeli roczne Price ID nie są ustawione, checkout roczny jest blokowany kontrolowanym błędem.

## Sekcje

- Hero.
- Korzyści.
- Jak działa.
- Dashboard preview.
- NFC.
- Cennik.
- FAQ.
- CTA końcowe.

## Ważne ograniczenia komunikacji

Nie sugerować jako gotowych:

- Google Reviews API,
- własnego formularza opinii NuvoRate,
- prawdziwego trackingu NFC,
- wielu lokalizacji,
- powiadomień.

## Powiązane notatki

- [[Hero]]
- [[Funkcje]]
- [[Jak działa]]
- [[Cennik]]
- [[FAQ]]
- [[Dashboard MVP]]
