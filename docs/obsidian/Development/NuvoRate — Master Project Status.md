---
tags: [nuvorate, status, architecture, checkpoint]
---

# NuvoRate — Master Project Status

> Checkpoint z 2026-09-08. Stan oparty na repozytorium i historii Git; stan usług zewnętrznych oznaczono jako `UNKNOWN`, jeżeli nie wynika wprost z kodu lub commita.

## Launch scope

- Produkcyjna domena: https://www.nuvorate.pl.
- Hosting: Vercel. Ostatni lokalny `HEAD`: `8dca808` — poprawa prezentacji zerowych słupków wykresu.
- Produkt obsługuje polski rynek; landing jest po polsku.
- **Author Profiles / Weryfikacja autora jest ukryta przed użytkownikami na launch.** Trasa i część implementacji technicznej są zachowane, lecz nie należą do launch scope.

## Current architecture

- Next.js 15 App Router, React 19, Supabase Auth/Postgres, Stripe i OpenAI.
- Dostęp do firmy ustalany jest wyłącznie po stronie serwera na podstawie membership oraz `profiles.active_business_id`; identyfikator z klienta nie jest dowodem uprawnień.
- Billing jest przypisany do właściciela rozliczeń firmy, a nie do bieżącego operatora.
- Zmiany planów i Billing Portal są obsługiwane serwerowo przez Stripe. `GET /billing/portal` wyłącznie przekierowuje; sesję Portalu tworzy wyłącznie chroniony `POST`.
- Produkcyjny `NEXT_PUBLIC_APP_URL` powinien wskazywać kanoniczne `https://www.nuvorate.pl`; adres Vercel jest wyłącznie technicznym fallbackiem.

## Feature status

| Obszar | Status | Aktualne zachowanie |
|---|---|---|
| Dashboard / Reviews / Analysis / Responses | DONE | Dane opinii, statystyki, analiza i zarządzanie odpowiedziami korzystają z danych Supabase. |
| Google Business Profile | DONE | OAuth, sync opinii, paginacja, upsert, publikacja/edycja/usunięcie odpowiedzi i synchronizacja owner reply. |
| Automatic review responses | DONE | Durable jobs, leases, limity AI, retry, cross-month billing oraz osobna faza publikacji. |
| Automatic Google publication | DONE | Foundation, worker i opt-out cancellation. Domyślnie `auto_publish=false`; wyłączenie zatrzymuje stare pending/retryable publikacje jako `cancelled`. |
| Google Places / Author Profiles | HIDDEN / EXPERIMENTAL | Places może zwrócić `authorAttribution.uri`; GBP ↔ Places matching jest fail-closed / best-effort. Places zwraca ograniczony zestaw opinii. |
| NFC | DONE | Wiele tagów, publiczny redirect `/r/[token]`, tracking skanów i panel zarządzania. |
| Support / Contact | DONE | Zalogowany formularz, dozwolone PNG/JPEG/PDF do 5 MB, rate limit, bezpieczny kontekst firmy i Reply-To użytkownika. |
| Legal / cookies | PARTIAL | Regulamin, prywatność i cookies istnieją. Cookie consent należy traktować jako konfigurację do osobnego audytu compliance. |
| Performance / navigation | PARTIAL | Zredukowano odczyty powiadomień i dublowanie billing contextu, dodano skeletony. Route group `app/(dashboard)` rozpoczęty; trwały shared shell nie jest ukończony. |

## Database / migrations

- Baza migracji znajduje się w `docs/database/`.
- 026–028: Google review sync i scheduler; 027: ręczna publikacja odpowiedzi.
- 029–031: kolejka automatycznych odpowiedzi, specific-claim i rozliczanie cross-month.
- 032–034: automatic Google publication i trwałe anulowanie po opt-out.
- 035–036: foundation author verification i manual match method. **Stan ręcznego zastosowania 035/036 na produkcji: UNKNOWN.**
- Istotne tabele: `reviews`, `google_business_connections`, `business_response_settings`, `automatic_review_response_jobs`, `ai_usage`, `ai_usage_reservations`, `ai_review_responses`, `nfc_tags`, `nfc_scans`, `notifications`.

## Security / compliance notes

- Nie logować ani nie dokumentować tokenów Google, Stripe, OpenAI, Supabase service role ani internal worker secretów.
- Google nie dostarcza pewnego e-maila, telefonu ani customer ID autora opinii. Funkcja autora może wskazywać jedynie dopasowanie, nie potwierdzenie tożsamości.
- Dane klientów i dopasowania autora muszą być izolowane per `business_id`, z RLS i serwerową autoryzacją.
- Automatyczne workery są server-to-server i muszą działać niezależnie: sync nie generuje AI, generation nie publikuje Google, publication nie nalicza AI.

## Known issues / roadmap

1. Dokończyć persistent dashboard shell: wydzielić obecny sidebar/topbar/mobile nav z page-specific stron bez podwójnego UI.
2. Przed launch ponownie zweryfikować canonical URL, Stripe return URLs, Google OAuth redirect URI i Supabase redirect allowlist.
3. Utrzymać Author Profiles poza launch scope do czasu jasnego UX, privacy review oraz produktu customer database.
4. Następna optymalizacja performance: paginacja/aggregacje po stronie bazy i usunięcie pozostałych waterfalls dashboardu.

## Recent changelog

- **2026-09-08 — `8dca808`**: minimalna wysokość słupka dla dni z 0 opinii; tooltip i dane pozostają bez zmian.
- **2026-09-07 — `54f9ee7`**: bezpieczny flow Stripe Billing Portal, POST-only dla mutacji.
- **2026-09-07 — `aaca333`**: ukrycie Author Profiles na launch.
- **2026-09-06 — `db0c65f`**: diagnostyczne, fail-closed porównanie GBP i Google Places.
- **2026-09-03 — `fa17071`, `3aa2ab0`**: automatic Google publication oraz anulowanie po opt-out.
- **2026-08-30 — `9c5d7c4`**: endpoint specific-job dla automatic AI response.

### UNCOMMITTED LOCAL WORK

- Rozpoczęto Phase 1 / 1B performance navigation: snapshot powiadomień, przekazanie billing contextu do switcherów, loading skeletons i route group `app/(dashboard)`.
- Trwała wspólna powłoka dashboardu nie jest ukończona; aktualny working tree nie jest gotowy do commita bez dokończenia albo uporządkowania tej pracy.
