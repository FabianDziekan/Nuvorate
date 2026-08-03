---
tags:
  - briefing
  - nuvorate
  - handoff
  - product
  - mvp
---

# NuvoRate - pełny brief projektu

Ten dokument jest skondensowanym opisem projektu NuvoRate przygotowanym do przekazania w nowym czacie ChatGPT lub nowemu współpracownikowi. Zawiera aktualny stan produktu, funkcje, MVP, styl, ceny, technologię, moduły aplikacji i najważniejsze ograniczenia.

## Jednozdaniowy opis

NuvoRate to platforma SaaS do zarządzania opiniami i reputacją online, pomagająca właścicielom firm szybciej monitorować opinie, odpowiadać klientom, analizować reputację i zwiększać zaufanie do marki.

## Główna wartość produktu

Podstawowa obietnica NuvoRate:

> Więcej opinii = większe zaufanie = więcej klientów.

NuvoRate nie jest narzędziem do tworzenia własnego publicznego formularza opinii. Filozofia produktu jest taka, że firma zbiera i kontroluje opinie z Google, a aplikacja pomaga je monitorować, analizować i obsługiwać.

## Dla kogo jest NuvoRate

NuvoRate jest tworzone dla małych i średnich firm lokalnych, które żyją z zaufania klientów i opinii online.

Główne segmenty:

- restauracje,
- salony beauty,
- barberzy,
- hotele,
- firmy usługowe,
- lokalne biznesy z profilem Google Business.

Typowy użytkownik to owner firmy, który chce widzieć najważniejsze informacje o reputacji w jednym miejscu i nie tracić czasu na ręczne przeglądanie opinii.

## Pozycjonowanie

NuvoRate powinno być komunikowane jako profesjonalna, nowoczesna platforma SaaS do zarządzania reputacją online.

Głównym produktem jest abonament. Plakietki/karty NFC są dodatkiem wspierającym pozyskiwanie opinii, ale nie są produktem głównym.

Nie należy przedstawiać NuvoRate jako:

- samego produktu NFC,
- narzędzia do kupowania opinii,
- publicznego formularza opinii,
- systemu gwarantującego konkretną liczbę nowych klientów.

## Aktualny stan MVP

MVP obejmuje:

- landing page,
- rejestrację, logowanie i reset hasła,
- onboarding jednej firmy,
- płatne plany Starter i Business przez Stripe,
- plan `unpaid` dla użytkownika przed płatnością,
- dashboard z danymi opinii,
- listę opinii,
- generowanie odpowiedzi na opinie,
- osobną zakładkę do zarządzania odpowiedziami,
- analizę reputacji przez OpenAI,
- miesięczne limity odpowiedzi i analiz,
- powiadomienia in-app tylko dla nowych opinii,
- zakładkę Weryfikacja autora jako funkcję Business przygotowaną pod Google,
- moduł NFC z linkiem Google review URL,
- ustawienia firmy, właściciela, stylu odpowiedzi i motywu,
- light/dark mode,
- Stripe Checkout, webhook i Customer Portal,
- dokumentację Obsidian.

## Plany i ceny

### Starter

Cena:

- 49,99 zł / miesiąc,
- 499,99 zł / rok.

Limity:

- 50 odpowiedzi na opinie miesięcznie,
- 1 analiza reputacji miesięcznie.

Funkcje:

- dashboard reputacji,
- statystyki opinii,
- lista opinii,
- generowanie odpowiedzi,
- jedna analiza reputacji miesięcznie,
- panel NFC z Google review URL.

### Business

Cena:

- 229,99 zł / miesiąc,
- 2299,99 zł / rok.

Limity:

- 350 odpowiedzi na opinie miesięcznie,
- 50 analiz reputacji miesięcznie.

Funkcje:

- wszystko z planu Starter,
- Business Insights na dashboardzie,
- więcej analiz reputacji,
- więcej odpowiedzi na opinie,
- rekomendacje i analiza problemów w raporcie reputacji,
- Weryfikacja autora jako Business Feature.

### Unpaid

Nowy użytkownik po rejestracji ma plan `unpaid`, dopóki Stripe webhook nie potwierdzi płatności.

Użytkownik `unpaid` widzi ekran aktywacji planu z mini-cennikiem i może wybrać Starter albo Business w rozliczeniu miesięcznym lub rocznym.

## Landing page

Landing page sprzedaje abonament NuvoRate.

Główny przekaz:

> Więcej opinii. Większe zaufanie. Więcej klientów.

Sekcje landing page:

- navbar z logo, linkami, przełącznikiem PL/EN, logowaniem i CTA,
- hero z mockupem dashboardu,
- korzyści,
- jak działa NuvoRate,
- dashboard preview,
- NFC jako dodatek,
- cennik monthly/yearly,
- FAQ,
- końcowe CTA.

Landing page nie powinien robić z NFC głównego produktu. NFC jest narzędziem wspierającym zbieranie opinii.

## Aktualne zakładki aplikacji

Sidebar po zalogowaniu zawiera:

- Pulpit,
- Opinie,
- Analiza,
- Odpowiedzi,
- Weryfikacja autora,
- NFC,
- Powiadomienia,
- Ustawienia.

## Dashboard / Pulpit

Dashboard jest głównym widokiem produktu i najważniejszym ekranem aplikacji.

Wymagania dostępu:

- zalogowany użytkownik,
- rekord profilu w `profiles`,
- firma w `businesses`,
- aktywny plan Starter albo Business.

Jeśli użytkownik nie ma firmy, trafia do onboardingu. Jeśli ma plan `unpaid`, widzi ekran wyboru planu.

Dashboard zawiera:

- powitanie właściciela po imieniu,
- dane firmy w sidebarze,
- date range picker w topbarze,
- statystyki opinii,
- kartę limitów planu,
- wykres „Nowe opinie w czasie”,
- Business Insights dla planu Business,
- kartę „Analiza ostatnich 30 dni”,
- sekcję „Najnowsze opinie klientów”,
- przycisk „Synchronizuj z Google” jako mock pod przyszłe API.

### Date range picker

Dashboard obsługuje:

- Ostatnie 30 dni,
- Ostatnie 3 miesiące,
- Ostatnie 12 miesięcy,
- zakres niestandardowy `from` / `to` w URL.

Zakres wpływa na:

- liczbę nowych opinii,
- średnią ocenę,
- procent pozytywnych opinii,
- wykres,
- Business Insights,
- najnowsze opinie, jeśli są zależne od zakresu.

### Karty statystyk

Dashboard pokazuje:

- Nowe opinie: liczba opinii w wybranym zakresie,
- Średnia ocena: średnia z `reviews.rating`,
- Pozytywne opinie: procent opinii z oceną `rating >= 4`,
- Skany NFC: obecnie `0`, bez realnego trackingu.

### Wykres „Nowe opinie w czasie”

Wykres pokazuje wolumen opinii w czasie, nie średnią ocenę.

Logika:

- 30 dni: grupowanie po dniach,
- 3 miesiące: grupowanie po tygodniach,
- 12 miesięcy: grupowanie po miesiącach,
- zakres custom: okres liczony według wybranego przedziału.

Każdy dzień lub okres jest renderowany jako słupek. Okresy z `0` opinii są pokazywane jako neutralne minimalne słupki, aby zachować ciągłość osi czasu. Tooltip pokazuje prawdziwą liczbę opinii oraz średnią ocenę.

### Business Insights

Widoczne tylko dla planu Business.

Aktualne karty:

- Najlepszy dzień: najczęstszy dzień tygodnia w wybranym zakresie.
- Ten miesiąc: liczba opinii w bieżącym miesiącu i różnica względem poprzedniego miesiąca.
- Cel miesiąca: postęp względem miesięcznego celu opinii.

Miesięczny cel opinii jest zapisany w `businesses.monthly_review_goal`. Domyślnie wynosi 30, ale owner może edytować go inline bezpośrednio na Dashboardzie. Walidacja: od 1 do 1000 opinii.

### Limity planu

Karta „Limity planu” pokazuje:

- pozostałe odpowiedzi na opinie,
- pozostałe analizy reputacji,
- procent wykorzystania,
- tekst „Wykorzystano X z Y”.

Limity są liczone miesięcznie przez `ai_usage`.

### Najnowsze opinie klientów

Dashboard pokazuje 3 najnowsze opinie aktualnej firmy, sortowane po `created_at desc`.

Na karcie opinii można:

- zobaczyć autora, ocenę, datę i treść,
- wygenerować odpowiedź,
- wygenerować odpowiedź ponownie,
- skopiować istniejącą odpowiedź,
- przejść do pełnej listy opinii przez „Zobacz wszystkie”.

Przycisk „Filtry” został usunięty z tej sekcji, bo dashboard pokazuje tylko skrót.

### Synchronizuj z Google

Na Dashboardzie jest przycisk „Synchronizuj z Google”.

Aktualnie to mock:

- pokazuje stan ładowania,
- zwraca sukces,
- informuje „Brak nowych opinii”.

Docelowo w tym miejscu należy podpiąć Google Business Profile API.

## Opinie

Zakładka `/reviews` pokazuje pełną listę opinii aktualnej firmy.

Funkcje:

- pobieranie opinii z `public.reviews`,
- sortowanie od najnowszych,
- filtr ocen,
- paginacja po 10 opinii na stronę,
- pusty stan, jeśli nie ma opinii,
- highlight konkretnej opinii po wejściu z powiadomienia.

Wyświetlane dane:

- autor,
- ocena,
- treść,
- źródło,
- data.

## Odpowiedzi

Zakładka `/responses` służy do zarządzania odpowiedziami na opinie.

Funkcje:

- lista opinii z odpowiedziami,
- filtry: wszystkie, bez odpowiedzi, z odpowiedzią, oceny 5-1,
- paginacja po 10 rekordów,
- generowanie odpowiedzi przez OpenAI,
- ponowne generowanie,
- ręczne wpisanie odpowiedzi,
- edycja odpowiedzi,
- zapis odpowiedzi,
- kopiowanie do schowka,
- oznaczenie jako odpowiedziano,
- statusy: `pending`, `ready`, `responded`.

Automatyczne odpowiedzi:

- owner może włączyć automatyczne generowanie,
- wybiera oceny, dla których generować odpowiedzi,
- po zapisaniu ustawień system generuje odpowiedzi dla pasujących opinii bez odpowiedzi,
- nie ma jeszcze background joba ani automatycznego harmonogramu.

Odpowiedzi zapisują się w `reviews.response_text`, `reviews.response_status`, `reviews.response_generated_at` oraz historycznie w `ai_review_responses`.

## Analiza reputacji

Zakładka `/analysis` pokazuje pełną analizę reputacji firmy.

Analiza jest generowana przez OpenAI na podstawie opinii z ostatnich 30 dni i zapisywana w `ai_business_analyses`.

Zwracane dane:

- reputation score 0-100,
- trend: `up`, `down`, `stable`,
- executive summary,
- najczęściej chwalone elementy,
- najczęściej zgłaszane problemy,
- rekomendacje działań.

Analiza korzysta z limitów planu:

- Starter: 1 analiza miesięcznie,
- Business: 50 analiz miesięcznie,
- Unpaid: brak dostępu.

Podczas generowania używany jest wspólny komponent progresu `AiGenerationProgress`.

## Weryfikacja autora

Zakładka `/author-verification` to funkcja planu Business przygotowana pod przyszłą integrację z Google.

Cel: właściciel firmy może szybko sprawdzić autora opinii i docelowo przejść do jego publicznego profilu Google.

Aktualnie działa:

- lista opinii podobna do modułu Opinie,
- wyszukiwarka po autorze i treści opinii,
- filtr ocen korzystający ze wspólnego komponentu `RatingFilter`,
- filtr statusu: wszystkie, niezweryfikowane, zweryfikowane,
- sortowanie: najnowsze, najstarsze, najniższa ocena, najwyższa ocena,
- paginacja po 10 rekordów,
- drawer po prawej stronie z detalami opinii i autora.

W drawerze widoczne są:

- imię autora,
- ocena,
- data opinii,
- treść,
- sekcja „Weryfikacja autora”,
- informacja, że funkcja będzie dostępna po integracji z Google Business,
- przycisk „Otwórz profil autora w Google” przygotowany pod `authorProfileUrl`,
- wskazówki, na co zwrócić uwagę przy weryfikacji autora.

Na tym etapie nie ma jeszcze pobierania publicznego profilu Google.

## NFC

Zakładka `/nfc` pokazuje ownerowi link do opinii Google i instrukcję konfiguracji plakietki/karty NFC.

Funkcje:

- pokazuje Google review URL aktualnej firmy,
- przycisk kopiowania linku,
- instrukcja konfiguracji NFC,
- statystyki skanów jako `0` lub bezpieczne wartości, bo realny tracking nie istnieje.

NFC jest dodatkiem do abonamentu. Nie jest głównym produktem.

Docelowo moduł NFC powinien dostać:

- tracking skanów,
- redirect przez NuvoRate,
- statystyki konwersji do opinii.

## Powiadomienia

Powiadomienia są uproszczone i dotyczą wyłącznie nowych opinii.

Aktualny typ:

- `new_review`.

Nie tworzymy i nie pokazujemy obecnie powiadomień o:

- analizie gotowej,
- odpowiedzi wygenerowanej,
- limitach,
- subskrypcji,
- innych eventach.

Funkcje:

- dzwonek w topbarze,
- dropdown z ostatnimi powiadomieniami,
- badge z liczbą nieprzeczytanych,
- badge w sidebarze przy pozycji „Powiadomienia”,
- strona `/notifications`,
- filtry: wszystkie, nieprzeczytane,
- paginacja po 10 powiadomień,
- oznaczanie pojedynczego powiadomienia jako przeczytane,
- oznaczanie wszystkich jako przeczytane,
- czyszczenie historii powiadomień,
- kliknięcie powiadomienia prowadzi do `/reviews` i podświetla konkretną opinię, jeśli payload ma `reviewId`.

Powiadomienie o nowej opinii powinno zawierać:

- autora,
- ocenę,
- fragment treści opinii.

## Ustawienia

Zakładka `/settings` jest minimalistyczna i zawiera tylko ustawienia wpływające na działanie aplikacji.

Sekcje:

- Konto: imię ownera, email, wylogowanie, zmiana hasła jako przyszła funkcja.
- Profil firmy: nazwa firmy, branża.
- Styl odpowiedzi: Profesjonalny, Przyjazny, Krótki, Premium.
- Wygląd aplikacji: Tryb jasny / Tryb ciemny.
- Konto i plan: aktualny plan, status subskrypcji, przycisk „Zarządzaj subskrypcją”.

`response_tone` jest zapisywany w `business_response_settings` i używany przy generowaniu odpowiedzi OpenAI jako preferowany styl odpowiedzi.

Motyw light/dark jest zapisywany lokalnie w `localStorage`, bez migracji bazy.

## Auth i onboarding

Auth używa Supabase Auth.

Strony:

- `/register`,
- `/login`,
- `/forgot-password`,
- `/update-password`.

Rejestracja zawiera:

- imię,
- email,
- hasło,
- powtórzenie hasła,
- wybór planu.

Imię zapisuje się w `profiles.first_name`. Dashboard używa go w powitaniu, np. „Dzień dobry, Fabian”.

Onboarding `/onboarding` zbiera dane firmy:

- nazwa firmy,
- branża,
- miasto,
- Google review URL.

Jeden owner = jedna firma. Nie ma jeszcze pracowników ani wielu lokalizacji.

## Stripe i subskrypcje

Stripe jest źródłem prawdy dla aktywacji planów.

Elementy:

- Stripe Checkout,
- Stripe webhook,
- Stripe Customer Portal,
- plany miesięczne i roczne,
- zapis `stripe_customer_id`,
- zapis `stripe_subscription_id`,
- zapis `subscription_status`,
- zapis `current_period_end`,
- aktualizacja `profiles.plan`.

Plan nie powinien zmieniać się tylko dlatego, że użytkownik wrócił z `success_url`. Plan zmienia się dopiero po webhooku Stripe.

Checkout:

- `/checkout?plan=starter&billing=monthly`,
- `/checkout?plan=starter&billing=yearly`,
- `/checkout?plan=business&billing=monthly`,
- `/checkout?plan=business&billing=yearly`.

Webhook mapuje Price ID na plan:

- Starter monthly/yearly -> `starter`,
- Business monthly/yearly -> `business`.

Anulowanie, `unpaid` i `incomplete_expired` ustawiają plan na `unpaid`.

## Limity

Limity są egzekwowane backendowo, nie tylko w UI.

Tabela: `ai_usage`.

Limity:

- `unpaid`: 0 odpowiedzi, 0 analiz,
- `starter`: 50 odpowiedzi, 1 analiza,
- `business`: 350 odpowiedzi, 50 analiz.

Po udanym wywołaniu OpenAI licznik jest zwiększany.

Jeśli limit odpowiedzi został wykorzystany, UI nie pokazuje aktywnego przycisku generowania i wyświetla „Limit odpowiedzi wykorzystany”.

## Baza danych Supabase

Najważniejsze tabele:

- `profiles`: profil ownera, plan, dane Stripe, `first_name`.
- `businesses`: firma ownera, Google review URL, `monthly_review_goal`.
- `reviews`: opinie, ocena, treść, odpowiedź, status odpowiedzi.
- `ai_review_responses`: historia wygenerowanych odpowiedzi.
- `ai_business_analyses`: analizy reputacji.
- `ai_usage`: miesięczne liczniki odpowiedzi i analiz.
- `business_response_settings`: ustawienia automatycznych odpowiedzi i `response_tone`.
- `notifications`: historia powiadomień, obecnie tylko `new_review`.

Ważne migracje:

- `013_monthly_review_goal.sql`: dodaje miesięczny cel opinii.
- `014_profile_first_name.sql`: dodaje imię ownera.

RLS: owner może czytać i edytować tylko swoje dane. Operacje krytyczne, webhook Stripe i liczniki używają service role po stronie server.

## Technologia

Stack:

- Next.js 15 App Router,
- TypeScript,
- React 19,
- Tailwind CSS,
- Supabase Auth,
- Supabase Database,
- Stripe Subscriptions,
- OpenAI,
- Vercel deployment,
- GitHub jako repozytorium.

Główne foldery:

- `app/`: strony, route handlers i server actions,
- `components/`: komponenty UI,
- `lib/`: integracje, konfiguracje, helpery,
- `docs/database/`: migracje SQL,
- `docs/obsidian/`: dokumentacja projektu.

## Styl wizualny

NuvoRate ma wyglądać jak nowoczesny, premium SaaS.

Założenia:

- minimalistyczny interfejs,
- dużo białej przestrzeni,
- subtelne cienie,
- duże zaokrąglenia,
- czytelne karty,
- delikatne animacje,
- profesjonalny, spokojny charakter,
- light i dark mode.

Kolory marki:

- biały `#FFFFFF`,
- fiolet `#5B5CF6`,
- czarny/grafit `#0F0F10`.

Kolory w kodzie:

- `ink`: `#0F0F10`,
- `brand`: `#5B5CF6`,
- `brand.dark`: `#4849D8`,
- `brand.soft`: `#F1F1FF`.

Dark mode:

- tło aplikacji jest najciemniejsze,
- sekcje i karty mają warstwową hierarchię grafitów,
- fiolet pozostaje akcentem,
- nie używać czystej czerni jako jedynego koloru powierzchni.

Font:

- Inter jako główna czcionka,
- fallback: `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.

## Logo

Logo NuvoRate jest zapisane jako plik graficzny i używane w aplikacji przez komponent brandingu.

Favicon/app icon używa:

- `/brand/nuvorate-logo.png`.

Nie należy tworzyć własnej interpretacji logo. Jeśli trzeba zmienić logo, używać jednego źródła prawdy w assetach.

## Tone of Voice

NuvoRate mówi jasno, konkretnie i partnersko.

Zasady:

- prosty język,
- korzyści biznesowe przed technikaliami,
- profesjonalnie, ale nie korporacyjnie,
- nie obiecywać nierealnych wyników,
- podkreślać związek opinii z zaufaniem i klientami.

Przykładowe komunikaty:

- „Więcej opinii. Większe zaufanie. Więcej klientów.”
- „Zarządzaj reputacją online z jednego miejsca.”
- „Szybciej reaguj na głos klientów.”

## Czego jeszcze nie ma

Nie należy opisywać tych rzeczy jako gotowe:

- Google Reviews API,
- automatyczna synchronizacja z Google Business Profile,
- realny tracking skanów NFC,
- publiczny formularz opinii NuvoRate,
- wiele lokalizacji,
- role pracowników,
- integracja odpowiedzi z Google,
- wysyłka odpowiedzi do Google,
- pełna weryfikacja publicznego profilu autora,
- background job dla automatycznych odpowiedzi,
- harmonogramy cyklicznych analiz,
- raporty e-mail,
- eksport raportów.

## Najbliższe kierunki rozwoju

Najważniejsze następne kroki:

- podpięcie Google Business Profile API,
- synchronizacja opinii Google,
- podpięcie `authorProfileUrl` w Weryfikacji autora,
- tracking NFC i redirect przez NuvoRate,
- wydzielenie wspólnego dashboard shell,
- wyszukiwarka opinii,
- automatyczne harmonogramy analiz,
- historia billingowa/status planu w UI,
- dokumenty prawne przed publicznym SaaS.

## Dokumenty prawne przed wypuszczeniem SaaS

Przed publicznym uruchomieniem płatnej wersji SaaS trzeba przygotować:

- regulamin usługi,
- politykę prywatności,
- politykę cookies,
- dane kontaktowe operatora,
- informacje o przetwarzaniu danych przez Supabase, Stripe i OpenAI.

Nie należy publicznie uruchamiać płatnej wersji bez tych dokumentów i linków w aplikacji/landing page.

## Najważniejszy kontekst dla nowego czatu

Jeśli przekazujesz projekt nowemu czatowi ChatGPT, najkrótszy kontekst brzmi:

> Pracujemy nad NuvoRate, polską aplikacją SaaS do zarządzania opiniami i reputacją online dla lokalnych firm. Główny produkt to abonament Starter/Business, a NFC jest dodatkiem prowadzącym klientów do Google review URL. Aplikacja ma Next.js 15, TypeScript, Tailwind, Supabase Auth/DB, Stripe Subscriptions i OpenAI. Aktualne MVP ma auth, onboarding, dashboard, opinie, odpowiedzi AI, analizę reputacji, limity planów, powiadomienia tylko o nowych opiniach, Weryfikację autora jako Business Feature, NFC, settings i light/dark mode. Nie ma jeszcze Google Business Profile API, realnego trackingu NFC ani wysyłania odpowiedzi do Google. Styl ma być premium SaaS: biały/fiolet/czarny, dużo przestrzeni, Inter, minimalistyczny UI.

## Powiązane notatki

- [[NuvoRate Hub]]
- [[Dashboard MVP]]
- [[MVP]]
- [[Roadmap]]
- [[Architektura]]
- [[Supabase]]
- [[Stripe]]
- [[Odpowiedzi]]
- [[Weryfikacja autora]]
- [[Powiadomienia]]
- [[Dokumenty prawne SaaS]]
