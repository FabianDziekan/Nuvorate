+# Dashboard MVP

Dashboard MVP jest głównym widokiem produktu NuvoRate dla planów Starter i Business. Ma w kilka sekund odpowiadać na pytania właściciela firmy: ile nowych opinii pozyskano, jak zmienia się reputacja, co mówią klienci i które sytuacje wymagają reakcji.

Dashboard powinien również pełnić rolę najważniejszego obrazu produktu prezentowanego na stronie internetowej. Musi jasno komunikować główną wartość NuvoRate: więcej opinii = większe zaufanie = więcej klientów. Plakietki NFC są w nim widoczne jako źródło pozyskiwania opinii, ale nie dominują nad abonamentem i zarządzaniem reputacją.

## Założenia produktowe

- Najważniejsze dane i działania są widoczne bez przechodzenia przez wiele ekranów.
- Użytkownik najpierw widzi stan reputacji, następnie trendy, a potem konkretne opinie i rekomendowane działania.
- Interfejs używa prostego języka biznesowego zamiast terminologii analitycznej.
- Każdy wskaźnik pokazuje wartość bieżącą oraz zmianę względem poprzedniego, porównywalnego okresu.
- Domyślnym zakresem danych jest ostatnie 30 dni, z możliwością zmiany okresu.
- Funkcje niedostępne w Starter mogą być pokazane w ograniczonej formie jako czytelna zapowiedź Business, bez blokowania podstawowej pracy.
- Dashboard powinien dobrze prezentować się zarówno jako działające narzędzie, jak i jako mockup używany w komunikacji produktu.

## Układ dashboardu

### Sidebar

Sidebar stanowi główną nawigację i powinien pozostać prosty w pierwszej wersji.

- Logo NuvoRate i nazwa aktualnie wybranej firmy.
- Pozycja „Pulpit” prowadząca do głównego dashboardu.
- Pozycja „Opinie” prowadząca do pełnej listy opinii.
- Pozycja „Analiza” prowadząca do inteligentnej analizy w planie Business.
- Pozycja „NFC” prowadząca do plakietek, liczby skanów i konfiguracji przekierowań.
- Pozycja „Powiadomienia” prowadząca do historii alertów i ich ustawień.
- Pozycja „Ustawienia” obejmująca profil firmy, konto, plan i integracje.
- Informacja o aktywnym planie: Starter lub Business.
- Dla Starter: dyskretny przycisk „Przejdź na Business” przy funkcjach premium.

Na desktopie sidebar jest stale widoczny. Może mieć wersję pełną z etykietami oraz zwiniętą z samymi ikonami. Aktywna pozycja jest oznaczona fioletem `#5B5CF6`.

### Górny pasek

Górny pasek zapewnia kontekst i dostęp do najczęstszych działań.

- Tytuł widoku, np. „Dzień dobry, Anno” oraz nazwa firmy.
- Selektor okresu: 7 dni, 30 dni, 90 dni lub zakres własny.
- W planie Business: wybór lokalizacji, gdy obsługa wielu lokalizacji zostanie wdrożona.
- Ikona powiadomień z liczbą nieprzeczytanych alertów.
- Przycisk szybkiego działania „Poproś o opinię” lub „Skopiuj link do opinii”.
- Menu profilu użytkownika.

Zmiana okresu powinna aktualizować kafelki, wykresy oraz listę opinii na całym dashboardzie.

### Główna zawartość

Główna zawartość ma prowadzić użytkownika od szybkiego podsumowania do konkretnych działań.

1. Kafelki najważniejszych statystyk.
2. Główny wykres trendu nowych opinii.
3. Mniejsze wykresy ocen i skanów NFC.
4. Sekcja ostatnich opinii z szybkim generowaniem odpowiedzi.
5. Sekcja inteligentnej analizy w planie Business.
6. Lista najważniejszych powiadomień i zdarzeń wymagających reakcji.

Najpilniejsze informacje, takie jak nowa negatywna opinia lub spadek średniej oceny, powinny być widoczne przed treściami informacyjnymi.

### Widok desktop

- Sidebar zajmuje stałą kolumnę po lewej stronie.
- Górny pasek pozostaje czytelny podczas przewijania.
- Cztery kafelki statystyk są ułożone w jednym rzędzie.
- Główny wykres nowych opinii zajmuje większą część szerokości.
- Wykres ocen i wykres skanów NFC znajdują się obok siebie lub w prawej kolumnie.
- Ostatnie opinie zajmują szeroką sekcję z miejscem na pełną treść i działania.
- Inteligentna analiza może być przedstawiona jako trzy lub cztery karty w jednym rzędzie.
- Układ powinien być przestronny i wykorzystywać białe tło, czarny tekst `#0F0F10` oraz fioletowe akcenty `#5B5CF6`.

### Widok mobile

- Sidebar zmienia się w menu otwierane ikoną lub dolną nawigację dla najważniejszych sekcji.
- Górny pasek pokazuje nazwę firmy, powiadomienia i skrócone menu profilu.
- Selektor okresu znajduje się pod nagłówkiem i zajmuje pełną szerokość.
- Kafelki statystyk są ułożone po dwa w rzędzie, a na bardzo małych ekranach pojedynczo.
- Wykresy przewijają się pionowo i nie wymagają przesuwania całego ekranu w poziomie.
- Lista opinii używa kart zamiast szerokiej tabeli.
- Najważniejsze działania, takie jak „Odpowiedz” i „Wygeneruj odpowiedź”, są dostępne bez otwierania dodatkowego widoku.
- Filtry opinii otwierają się w wysuwanym panelu.
- Funkcja „Poproś o opinię” może być dostępna jako stały przycisk w dolnej części ekranu.

## Kafelki statystyk

Każdy kafelek powinien zawierać nazwę wskaźnika, aktualną wartość, zmianę względem poprzedniego okresu oraz krótką interpretację.

### Liczba nowych opinii

- Pokazuje liczbę opinii pozyskanych w wybranym okresie.
- Zawiera zmianę liczbową i procentową względem poprzedniego okresu.
- Przykład: „24 nowe opinie, +20% vs poprzednie 30 dni”.
- Kliknięcie otwiera listę opinii z ustawionym odpowiednim okresem.

### Średnia ocena

- Pokazuje aktualną średnią ocenę, np. `4,7 / 5`.
- Zawiera zmianę względem poprzedniego okresu, np. `+0,2`.
- Powinna korzystać z czytelnej skali gwiazdkowej, ale nie opierać znaczenia wyłącznie na kolorze.
- Kliknięcie otwiera szczegółowy trend ocen.

### Pozytywne vs negatywne opinie

- Pokazuje procentowy udział opinii pozytywnych i negatywnych.
- Dla MVP opinie pozytywne to oceny 4-5, neutralne 3, a negatywne 1-2.
- Główny kafelek może pokazywać np. „86% pozytywnych” oraz „8% negatywnych”.
- Opinie neutralne powinny być dostępne w szczegółach, aby suma danych była zrozumiała.
- Definicja kategorii musi być widoczna w podpowiedzi.

### Liczba skanów NFC

- Pokazuje liczbę skanów aktywnych plakietek NFC w wybranym okresie.
- Zawiera zmianę względem poprzedniego okresu.
- Może dodatkowo pokazywać, ile skanów zakończyło się przejściem do wystawienia opinii, gdy takie dane będą dostępne.
- Kliknięcie otwiera sekcję NFC z podziałem na plakietki lub lokalizacje.
- Brak plakietki powinien wyświetlać prosty komunikat o możliwości dodania NFC, bez sugerowania, że jest ono wymagane.

## Wykresy

Wykresy powinny przedstawiać trend i pomagać zauważać zmianę. Nie powinny powtarzać samych wartości z kafelków bez dodatkowego kontekstu.

### Wykres nowych opinii

- Podstawowa forma: wykres liniowy lub kolumnowy pokazujący liczbę nowych opinii dziennie, tygodniowo albo miesięcznie.
- Użytkownik może zmienić agregację zależnie od wybranego okresu.
- Druga, delikatniejsza linia lub seria pokazuje poprzedni okres.
- Po wskazaniu punktu widoczna jest data, liczba opinii i zmiana.
- W planie Business możliwy jest podział na lokalizacje lub źródła.

### Wykres ocen

- Podstawowa forma: wykres liniowy średniej oceny w czasie.
- Dodatkowy widok może pokazywać rozkład ocen 1-5 w formie poziomych słupków.
- Należy wyróżniać momenty istotnego spadku lub wzrostu średniej.
- W planie Business wykres może być zestawiony ze zmianą sentymentu i najczęstszymi tematami.

### Wykres skanów NFC

- Podstawowa forma: wykres kolumnowy liczby skanów w czasie.
- W planie Starter pokazuje łączną liczbę skanów.
- W planie Business może porównywać plakietki, lokalizacje lub okresy.
- Docelowo powinien pokazywać prostą ścieżkę: skan NFC → otwarcie formularza → wystawienie opinii.
- Jeżeli nie ma danych, dashboard wyświetla instrukcję aktywacji plakietki zamiast pustego wykresu.

## Sekcja opinii

### Ostatnie opinie

Sekcja pokazuje od pięciu do dziesięciu najnowszych opinii, zależnie od wielkości ekranu.

Każda pozycja zawiera:

- ocenę i źródło opinii,
- datę publikacji,
- imię autora, jeśli jest dostępne,
- fragment treści,
- status: nowa, przeczytana, wymagająca reakcji lub obsłużona,
- przycisk „Odpowiedz”,
- przycisk „Wygeneruj odpowiedź”, jeśli funkcja jest dostępna w planie.

Negatywne i nieobsłużone opinie powinny być łatwe do zauważenia, ale interfejs nie może używać alarmującego tonu bez potrzeby.

### Filtrowanie opinii

Użytkownik powinien móc filtrować opinie według:

- okresu,
- oceny od 1 do 5,
- kategorii: pozytywne, neutralne, negatywne,
- statusu obsługi,
- źródła opinii,
- lokalizacji w planie Business,
- obecności odpowiedzi.

Aktywne filtry powinny być widoczne i możliwe do usunięcia jednym kliknięciem.

### Wyszukiwanie opinii

- Wyszukiwarka obejmuje treść opinii i nazwę autora.
- Wyniki aktualizują się bez opuszczania widoku.
- Wpisana fraza może działać razem z filtrami.
- Brak wyników powinien zawierać prostą informację oraz opcję wyczyszczenia filtrów.
- W planie Business wyszukiwanie może obejmować także tematy rozpoznane przez inteligentną analizę.

## Inteligentna analiza

Inteligentna analiza jest kluczowym wyróżnikiem planu Business. Powinna przekładać wiele opinii na krótkie, zrozumiałe wnioski, ale zawsze jasno wskazywać analizowany okres i liczbę opinii.

### Najczęściej chwalone elementy

- Lista trzech do pięciu najczęściej chwalonych tematów.
- Każdy temat zawiera liczbę lub procent opinii, w których wystąpił.
- Przykłady: „miła obsługa”, „krótki czas oczekiwania”, „czystość”.
- Kliknięcie tematu pokazuje powiązane opinie.

### Najczęściej zgłaszane problemy

- Lista powtarzających się problemów wymagających uwagi.
- Każdy problem zawiera skalę występowania i trend względem poprzedniego okresu.
- Przykłady: „długi czas oczekiwania”, „trudność z rezerwacją”, „hałas”.
- Dashboard powinien odróżniać pojedynczy komentarz od powtarzalnego sygnału.

### Automatyczne podsumowanie tygodnia

- Krótkie podsumowanie nowych opinii, średniej oceny i najważniejszych tematów z ostatnich siedmiu dni.
- Wskazuje największą pozytywną zmianę oraz najważniejszy obszar do sprawdzenia.
- Jest dostępne w dashboardzie i może być wysyłane e-mailem.
- Przykład: „W tym tygodniu otrzymano 8 opinii. Klienci najczęściej chwalili obsługę, a trzy osoby wspomniały o czasie oczekiwania.”

### Automatyczne podsumowanie miesiąca

- Szersze zestawienie trendów z całego miesiąca.
- Porównuje wyniki z poprzednim miesiącem.
- Pokazuje liczbę opinii, średnią ocenę, udział opinii pozytywnych i najważniejsze tematy.
- Zawiera maksymalnie trzy konkretne rekomendacje działań.
- Może być podstawą miesięcznego raportu dla właściciela lub zespołu.

Wnioski generowane automatycznie powinny być opisane jako wsparcie decyzyjne, a nie jako nieomylna diagnoza firmy.

## Generowanie odpowiedzi

Funkcja generowania odpowiedzi jednym kliknięciem pomaga szybko przygotować spójną i uprzejmą reakcję na opinię.

- Przycisk „Wygeneruj odpowiedź” znajduje się bezpośrednio przy opinii.
- System uwzględnia ocenę, treść opinii, nazwę firmy i ustalony Tone of Voice.
- Wygenerowana treść trafia najpierw do pola edycji i nigdy nie jest publikowana automatycznie.
- Użytkownik może zaakceptować, poprawić, skrócić lub wygenerować inną wersję.
- Dla pozytywnej opinii odpowiedź dziękuje i odnosi się do konkretnego elementu wypowiedzi.
- Dla negatywnej opinii odpowiedź zachowuje spokojny ton, okazuje zrozumienie i proponuje dalszy kontakt bez składania niepotwierdzonych obietnic.
- System powinien unikać powtarzalnych, identycznych odpowiedzi.
- Przed publikacją użytkownik zawsze widzi podgląd i potwierdza działanie.

W Starter funkcja może mieć miesięczny limit wygenerowanych odpowiedzi. W Business powinna oferować wyższy limit lub dostęp bez typowych ograniczeń operacyjnych, zależnie od ostatecznej polityki cenowej.

## Powiadomienia

Powiadomienia powinny pojawiać się w dashboardzie oraz, po włączeniu przez użytkownika, w wybranym kanale zewnętrznym. Każde powiadomienie prowadzi bezpośrednio do odpowiedniej opinii lub statystyki.

### Nowa opinia

- Informuje o nowej opinii, jej ocenie, źródle i czasie publikacji.
- Pozwala od razu przejść do treści i przygotować odpowiedź.
- Użytkownik może ustawić powiadomienie natychmiastowe lub zbiorcze.

### Negatywna opinia

- Jest uruchamiane dla opinii z oceną 1-2.
- Ma wyższy priorytet niż standardowe powiadomienie o nowej opinii.
- Zawiera szybkie działania: „Zobacz opinię” i „Wygeneruj odpowiedź”.
- Próg negatywnej opinii może być konfigurowalny w planie Business.

### Spadek średniej oceny

- Informuje o istotnym spadku średniej względem poprzedniego porównywalnego okresu.
- Powiadomienie powinno być wysyłane dopiero po przekroczeniu ustalonego progu, aby uniknąć szumu.
- Zawiera skalę zmiany i link do opinii, które mogły na nią wpłynąć.
- W Business próg i analizowany okres mogą być konfigurowalne.

## Plan Starter

Starter za 49,99 zł miesięcznie zapewnia podstawowy, kompletny dashboard dla małej firmy rozpoczynającej systematyczne zarządzanie reputacją.

Funkcje dostępne w Starter:

- dashboard dla jednej firmy lub lokalizacji,
- cztery podstawowe kafelki statystyk,
- podstawowe wykresy nowych opinii, ocen i łącznych skanów NFC,
- wybór podstawowego zakresu czasu,
- lista ostatnich opinii,
- wyszukiwanie opinii,
- podstawowe filtrowanie według okresu, oceny i statusu,
- oznaczanie opinii jako przeczytanych lub obsłużonych,
- standardowe powiadomienia o nowej i negatywnej opinii,
- podstawowy alert o spadku średniej oceny,
- obsługa i podgląd danych z plakietek NFC,
- ograniczona liczba odpowiedzi generowanych jednym kliknięciem, jeśli funkcja zostanie włączona w MVP.

Starter nie zawiera pełnej inteligentnej analizy, zaawansowanych porównań ani automatycznych raportów tygodniowych i miesięcznych.

## Plan Business

Business za 199,99 zł miesięcznie obejmuje wszystkie funkcje Starter oraz bardziej zaawansowane zarządzanie reputacją.

Funkcje dostępne w Business:

- pełna inteligentna analiza opinii,
- najczęściej chwalone elementy,
- najczęściej zgłaszane problemy,
- automatyczne podsumowanie tygodnia,
- automatyczne podsumowanie miesiąca,
- zaawansowane porównania okresów,
- rozbudowane filtrowanie i wyszukiwanie po tematach,
- większy limit lub rozszerzony dostęp do generowania odpowiedzi,
- konfigurowalne alerty i progi powiadomień,
- zaawansowane dane o skuteczności skanów NFC,
- porównanie plakietek, źródeł oraz docelowo lokalizacji,
- priorytetowy widok opinii wymagających reakcji,
- przyszła obsługa wielu użytkowników i lokalizacji.

Ostateczne limity, liczba lokalizacji i zasady generowania odpowiedzi wymagają osobnej decyzji produktowej przed publikacją cennika.

## Zakres pierwszej wersji

Pierwsza wersja powinna przede wszystkim zapewniać wiarygodne dane, prostą nawigację i szybki dostęp do opinii. Zakres można wdrażać etapami:

- rdzeń MVP: kafelki, podstawowe wykresy, ostatnie opinie, filtry i podstawowe powiadomienia,
- rozszerzenie Business: inteligentna analiza i automatyczne podsumowania,
- dalszy rozwój: wiele lokalizacji, rozbudowane raporty i analiza pełnej ścieżki NFC.

Takie podejście pozostaje zgodne z roadmapą NuvoRate, w której podstawowy monitoring poprzedza pełne funkcje analityczne.

## Mockup

Poniższy mockup przedstawia przykładowy desktopowy układ dashboardu. Dane są demonstracyjne.

```text
┌──────────────────────┬──────────────────────────────────────────────────────────────┐
│ NUVORATE             │ Dzień dobry, Anno        [Ostatnie 30 dni ▼] [Alerty: 3]   │
│ Restauracja Nova     │ Twoja reputacja rośnie. Otrzymano 24 nowe opinie.            │
├──────────────────────┼──────────────────────────────────────────────────────────────┤
│ ● Pulpit             │ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│   Opinie             │ │ NOWE OPINIE    │ │ ŚREDNIA OCENA │ │ POZYTYWNE      │     │
│   Analiza            │ │ 24             │ │ 4,7 / 5       │ │ 86%            │     │
│   NFC                │ │ +20%           │ │ +0,2           │ │ negatywne: 8%  │     │
│   Powiadomienia      │ └────────────────┘ └────────────────┘ └────────────────┘     │
│   Ustawienia         │ ┌────────────────┐                                           │
│                      │ │ SKANY NFC      │                                           │
│ Plan: Business       │ │ 148            │                                           │
│                      │ │ +32%           │                                           │
│                      │ └────────────────┘                                           │
│                      │                                                              │
│                      │ NOWE OPINIE                                                   │
│                      │  8 ┤                         ●                                │
│                      │  6 ┤            ●      ●─────╯                                │
│                      │  4 ┤      ●─────╯──────╯                                      │
│                      │  2 ┤ ●────╯                                                   │
│                      │    └────────────────────────────────────────────────────      │
│                      │      Tydzień 1   Tydzień 2   Tydzień 3   Tydzień 4           │
│                      │                                                              │
│                      │ ┌────────────────────────┐ ┌───────────────────────────────┐  │
│                      │ │ ŚREDNIA OCENA         │ │ SKANY NFC                    │  │
│                      │ │ 4,5 → 4,7             │ │ 31  29  40  48              │  │
│                      │ └────────────────────────┘ └───────────────────────────────┘  │
│                      │                                                              │
│                      │ OSTATNIE OPINIE                         [Szukaj...] [Filtry]  │
│                      │ Ocena 5/5  „Świetna obsługa i szybki serwis.”                │
│                      │ Anna K. · dzisiaj          [Wygeneruj odpowiedź] [Odpowiedz] │
│                      │ Ocena 2/5  „Zbyt długi czas oczekiwania.”                    │
│                      │ Marek P. · wczoraj         [Wygeneruj odpowiedź] [Odpowiedz] │
│                      │                                                              │
│                      │ INTELIGENTNA ANALIZA                                          │
│                      │ Chwalone: obsługa, jakość, atmosfera                          │
│                      │ Problemy: czas oczekiwania rośnie                             │
│                      │ Podsumowanie: „Ocena wzrosła o 0,2. Sprawdź czas obsługi.”    │
└──────────────────────┴──────────────────────────────────────────────────────────────┘
```

## Powiązane

- [[Mockup panelu]]
- [[Statystyki]]
- [[Opinie]]
- [[Analiza]]
- [[Powiadomienia]]
- [[Inteligentna analiza]]
- [[Starter]]
- [[Business]]
- [[NFC]]
- [[MVP]]
- [[Roadmap]]
- [[Frontend]]
