---
tags:
  - backend
  - development
  - roadmap
---

# Roadmap

Roadmap opisuje rozwój NuvoRate na podstawie aktualnego stanu kodu. Funkcje nie są przenoszone do „Gotowe”, jeśli nie istnieją w repozytorium.

## ✅ Gotowe

- Landing page NuvoRate.
- Rejestracja, logowanie, wylogowanie, reset hasła.
- Supabase Auth i middleware dla `/dashboard` oraz `/onboarding`.
- Onboarding jednej firmy ownera.
- Tabele `profiles`, `businesses`, `reviews`.
- Plan `unpaid` dla nowych użytkowników.
- Stripe Checkout dla Starter i Business.
- Stripe webhook dla checkout, subskrypcji i faktur.
- Stripe Customer Portal.
- Synchronizacja `profiles.plan` z webhooka Stripe.
- Dashboard dla płatnych planów.
- Ekran wyboru planu dla `unpaid`.
- Statystyki opinii z `public.reviews`.
- Lista opinii `/reviews` z filtrem oceny.
- OpenAI Structured Outputs.
- Generowanie odpowiedzi na opinie.
- Zapisywanie odpowiedzi w `ai_review_responses`.
- Analiza reputacji z ostatnich 30 dni.
- Zapisywanie analiz w `ai_business_analyses`.
- Miesięczne limity w `ai_usage`.
- Blokada generowania odpowiedzi po wykorzystaniu limitu.
- Moduł `/nfc` z Google review URL i kopiowaniem linku.

## 🚧 W trakcie

- Dashboard shell powielony w kilku stronach, jeszcze bez wspólnego layoutu.
- NFC bez realnego trackingu skanów.
- Trend reputacji jako statyczny wykres.
- Analiza reputacji bez harmonogramu automatycznego.
- Powiadomienia widoczne w UI, ale bez działającej logiki.
- Upgrade/downgrade obsługiwany przez Stripe, ale UI aplikacji ma tylko podstawowe wejścia.

## 📌 Następne

- Wydzielić wspólny dashboard layout dla `/dashboard`, `/reviews`, `/analysis`, `/nfc`.
- Dodać tracking kliknięć/skanów NFC bez własnego formularza opinii.
- Dodać route przekierowujący do Google review URL z możliwością zliczania wejść.
- Dodać tabelę i widok powiadomień.
- Dodać realny wykres trendu opinii z agregacją po datach.
- Dodać paginację i wyszukiwanie opinii.
- Uporządkować duplikację logiki limitów odpowiedzi między `actions.ts` i `review-response-service.ts`.
- Doprecyzować politykę downgrade po anulowaniu subskrypcji.

## 💡 Pomysły

- Integracja Google Reviews API.
- Automatyczne raporty tygodniowe i miesięczne.
- Eksport raportów reputacji.
- Wiele lokalizacji.
- Role pracowników.
- Szablony odpowiedzi.
- Historia zmian planów.
- Panel ustawień firmy.

## Powiązane notatki

- [[MVP]]
- [[Frontend]]
- [[Backend]]
- [[Wizja]]
- [[Changelog]]
- [[Development MOC]]
