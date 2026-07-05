---
tags:
  - dashboard
  - settings
  - supabase
---

# Settings

Zakładka `/settings` zawiera tylko ustawienia, które realnie wpływają na działanie aplikacji.

## Sekcje

### Profil firmy

Pola:

- nazwa firmy,
- branża.

Zapis:

- `businesses.name`,
- `businesses.industry`.

### Styl odpowiedzi

Pole:

- `business_response_settings.response_tone`

Opcje:

- `professional`: Profesjonalny,
- `friendly`: Przyjazny,
- `short`: Krótki,
- `premium`: Premium.

Wybrany styl jest przekazywany do generatora odpowiedzi OpenAI jako `preferred_response_style`.

### Konto i plan

Pokazuje:

- aktualny plan,
- status subskrypcji,
- email użytkownika,
- link „Zarządzaj subskrypcją”,
- „Zmień hasło” jako stan Wkrótce,
- wylogowanie.

## Mapa techniczna

- **Strona**: `app/settings/page.tsx`
- **Server action**: `app/settings/actions.ts`
- **Komponent**: `components/settings/settings-form.tsx`
- **Tabele**: `businesses`, `profiles`, `business_response_settings`
- **Powiązane moduły**: `review-response-service` używa `response_tone`.

## Powiązane notatki

- [[Odpowiedzi]]
- [[OpenAI]]
- [[Supabase]]
- [[Dashboard MVP]]
