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
- Wykres „Nowe opinie w czasie” z realnych danych `public.reviews`, presetami i zakresem niestandardowym.
- Business Insights dla planu Business.
- Date range picker na Dashboardzie z presetami i zakresem niestandardowym.
- Inline edycja miesięcznego celu opinii na Dashboardzie.
- Statystyka Business Insights „Ten miesiąc”.
- Mock „Synchronizuj z Google” przygotowany pod Google Business Profile API.
- Lista opinii `/reviews` z filtrem i paginacją.
- Kopiowanie wygenerowanej odpowiedzi z karty opinii na Dashboardzie.
- Zakładka `/responses` z generowaniem, edycją, kopiowaniem i statusami odpowiedzi.
- Automatyczne generowanie odpowiedzi po zapisie ustawień.
- Zakładka `/author-verification` jako Business Feature, z wyszukiwarką, filtrem ocen, filtrem statusu, sortowaniem, paginacją i drawerem autora.
- Powiadomienia in-app wyłącznie dla nowych opinii.
- Czyszczenie historii powiadomień.
- OpenAI Structured Outputs.
- Analiza reputacji z ostatnich 30 dni.
- Limity AI w `ai_usage`.
- Ustawienia `/settings` dla imienia właściciela, nazwy firmy, branży, stylu odpowiedzi i light/dark mode.
- Moduł `/nfc` z Google review URL i kopiowaniem linku.
- Dokumentacja Obsidian z mapami MOC.
- Deployment GitHub + Vercel z aktualnym `pnpm-lock.yaml`.

## 🚧 W trakcie

- Dashboard shell jest powielony w kilku stronach, bez wspólnego layoutu.
- NFC bez realnego trackingu skanów.
- Google review URL jest zapisywany ręcznie, bez Google Reviews API.
- Weryfikacja autora ma UI i drawer, ale nie pobiera jeszcze publicznych profili Google.
- Automatyczne odpowiedzi działają po zapisie ustawień, ale nie jako background job.
- Ustawienie `response_tone` wpływa na payload OpenAI, ale prompt można jeszcze dopracować semantycznie.

## 📌 Następne

- Wydzielić wspólny dashboard layout.
- Dodać tracking NFC i redirect do Google review URL.
- Dodać wyszukiwanie opinii.
- Dodać Google Reviews API albo import opinii.
- Podpiąć Google Business Profile API do synchronizacji opinii.
- Podpiąć `authorProfileUrl` do Weryfikacji autora.
- Dodać automatyczne harmonogramy analiz.
- Dodać historię billingową/status planu w UI.
- Przygotować dokumenty prawne przed publicznym SaaS: regulamin, politykę prywatności, politykę cookies i dane kontaktowe.
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
