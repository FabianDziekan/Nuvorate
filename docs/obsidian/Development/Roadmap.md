---
tags:
  - backend
  - development
  - roadmap
---

# Roadmap

Roadmap opisuje aktualny stan kodu i najbliższe kierunki rozwoju.

## ✅ Gotowe

- Landing page NuvoRate.
- Cennik miesięczny i roczny.
- Rejestracja, logowanie, wylogowanie, reset hasła.
- Supabase Auth.
- Onboarding jednej firmy ownera.
- Plan `unpaid` dla nowych użytkowników.
- Stripe Checkout dla Starter/Business monthly/yearly.
- Stripe webhook jako źródło prawdy planów.
- Stripe Customer Portal.
- Dashboard dla płatnych planów.
- Ekran aktywacji planu dla `unpaid`.
- Statystyki opinii z `reviews`.
- Wykres „Nowe opinie w czasie” z RPC `get_review_activity_trend`.
- Business Insights dla planu Business.
- Lista opinii `/reviews` z filtrem i paginacją.
- Zakładka `/responses` z generowaniem, edycją, kopiowaniem i statusami odpowiedzi.
- Automatyczne generowanie odpowiedzi po zapisie ustawień.
- OpenAI Structured Outputs.
- Analiza reputacji z ostatnich 30 dni.
- Limity AI w `ai_usage`.
- Ustawienia `/settings` dla nazwy firmy, branży i stylu odpowiedzi.
- Moduł `/nfc` z Google review URL i kopiowaniem linku.
- Dokumentacja Obsidian z mapami MOC.
- Deployment GitHub + Vercel z aktualnym `pnpm-lock.yaml`.

## 🚧 W trakcie

- Dashboard shell jest powielony w kilku stronach, bez wspólnego layoutu.
- NFC bez realnego trackingu skanów.
- Powiadomienia widoczne w UI, ale bez działającej logiki.
- Google review URL jest zapisywany ręcznie, bez Google Reviews API.
- Automatyczne odpowiedzi działają po zapisie ustawień, ale nie jako background job.
- Ustawienie `response_tone` wpływa na payload OpenAI, ale prompt można jeszcze dopracować semantycznie.

## 📌 Następne

- Wydzielić wspólny dashboard layout.
- Dodać tracking NFC i redirect do Google review URL.
- Dodać moduł powiadomień.
- Dodać wyszukiwanie opinii.
- Dodać Google Reviews API albo import opinii.
- Dodać automatyczne harmonogramy analiz.
- Dodać historię billingową/status planu w UI.
- Uporządkować `package-lock.json` vs `pnpm-lock.yaml` w repo.

## 💡 Pomysły

- Wiele lokalizacji.
- Role pracowników.
- Szablony odpowiedzi.
- Eksport raportów reputacji.
- Raporty e-mail.
- Segmentacja opinii po tematach.

## Powiązane notatki

- [[MVP]]
- [[Changelog]]
- [[Deployment]]
- [[Architektura]]
- [[Dashboard MVP]]
