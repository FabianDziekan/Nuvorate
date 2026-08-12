export type LandingLanguage = "PL" | "EN";

export const landingTranslations = {
  PL: {
    aria: {
      mainNav: "Główna nawigacja",
      mobileMenu: "Menu mobilne",
      languageSelect: "Wybór języka",
      openMenu: "Otwórz menu",
      closeMenu: "Zamknij menu",
      growthChart: "Wykres wzrostu liczby opinii",
    },
    nav: {
      items: [
        { label: "Funkcje", href: "#funkcje" },
        { label: "Jak działa", href: "#jak-dziala" },
        { label: "Cennik", href: "#cennik" },
        { label: "FAQ", href: "#faq" },
      ],
      language: "Język",
      login: "Zaloguj się",
      register: "Załóż konto",
    },
    mockup: {
      appBadge: "BUSINESS",
      company: "Restauracja Nova",
      planBusiness: "Plan Business",
      nav: ["Pulpit", "Opinie", "Analiza", "Odpowiedzi", "NFC", "Powiadomienia"],
      yourPlan: "Twój plan",
      businessActive: "Business aktywny",
      dashboardLabel: "Pulpit główny",
      greeting: "Dzień dobry, Anno",
      subtitle: "Podsumowanie reputacji firmy.",
      range: "Ostatnie 30 dni",
      business: "Business",
      metrics: [
        { label: "Nowe opinie", value: "49", detail: "ostatnie 30 dni" },
        { label: "Średnia ocena", value: "4,6", detail: "z 49 opinii" },
        { label: "Pozytywne", value: "92%", detail: "45 z 49 opinii" },
        { label: "Skany NFC", value: "148", detail: "śledzenie NFC" },
      ],
      planLimits: "Limity planu",
      billingPeriod: "Miesięczne limity planu",
      limitsRenewal: "Limity odnawiają się na początku każdego miesiąca.",
      limits: [
        ["Odpowiedzi na opinie", "306 pozostało", "12%"],
        ["Analizy reputacji", "47 pozostało", "6%"],
      ],
      newReviewsLabel: "NOWE OPINIE",
      chartTitle: "Nowe opinie w czasie",
      currentPeriod: "Bieżący okres",
      chartLabels: ["1 lip", "8 lip", "15 lip", "22 lip", "30 lip"],
      insights: [
        ["Najlepszy dzień", "Sobota"],
        ["Ten miesiąc", "17 opinii"],
        ["Cel miesiąca", "17 / 30"],
      ],
      analysisLabel: "Analiza",
      analysisTitle: "Analiza ostatnich 30 dni",
      analysisText:
        "Reputacja rośnie stabilnie. Klienci najczęściej chwalą obsługę i atmosferę lokalu.",
      analysisPoints: [
        "Mocna obsługa klienta",
        "Warto wzmacniać prośby o opinie",
        "Niski udział ocen negatywnych",
      ],
      latestReviewsLabel: "OSTATNIE OPINIE",
      latestReviewsTitle: "Najnowsze opinie klientów",
      seeAll: "Zobacz wszystkie",
      reviews: [
        ["Anna K.", "Świetna obsługa i bardzo miła atmosfera.", "5,0", "Kopiuj"],
        ["Marek P.", "Dobre miejsce, wrócę ponownie.", "4,0", "Wygeneruj odpowiedź"],
      ],
    },
    hero: {
      eyebrow: "Centrum reputacji dla lokalnych firm",
      titleStart: "Zamień opinie klientów w",
      titleHighlight: "lepsze decyzje.",
      titleEnd: "",
      description:
        "NuvoRate porządkuje opinie, pokazuje najważniejsze sygnały i pomaga szybciej reagować — z jednego przejrzystego miejsca.",
      primaryCta: "Załóż konto",
      secondaryCta: "Zobacz jak działa",
      bullets: ["Opinie pod kontrolą", "Wnioski gotowe do działania", "Jedno centrum reputacji"],
      floatingLabel: "Reputacja rośnie",
      floatingValue: "+20% nowych opinii",
    },
    benefits: {
      eyebrow: "Korzyści",
      title: "Reputacja, która pracuje na rozwój Twojej firmy",
      description:
        "NuvoRate pomaga zdobywać opinie, rozumieć potrzeby klientów i szybciej reagować — wszystko w jednym miejscu.",
      stories: [
        { kicker: "Zdobywaj więcej opinii dzięki prostszemu doświadczeniu klienta", title: "Każda dobra opinia zaczyna się od prostego momentu", text: "Plakietka NFC skraca drogę klienta do wystawienia opinii Google. Nowe opinie trafiają bezpośrednio do centrum reputacji firmy." },
        { kicker: "Zamień opinie w konkretne decyzje", title: "Nie tylko widzisz opinie. Wiesz, co oznaczają.", text: "NuvoRate analizuje opinie i pokazuje najważniejsze sygnały, mocne strony oraz obszary wymagające poprawy." },
        { kicker: "Odpowiadaj szybciej i bardziej profesjonalnie", title: "Każda opinia zasługuje na odpowiedź", text: "Przygotuj spójne odpowiedzi i reaguj szybciej bez ręcznego pisania każdej wiadomości." },
      ],
      journey: {
        title: "NuvoRate pomaga zbudować własny system zarządzania reputacją",
        description: "Od pierwszej konfiguracji do codziennych decyzji — NuvoRate staje się partnerem w rozwoju reputacji firmy.",
        footer: "NuvoRate wspiera rozwój Twojej firmy",
        statuses: [
          "Przygotowanie zakończone",
          "System zdobywania opinii gotowy",
          "Nowe opinie zaczynają napływać",
          "Wnioski gotowe do działania",
          "Reputacja rozwija się każdego dnia",
        ],
        steps: [
          ["Poznajemy Twoją firmę", "Ustalamy punkt wyjścia, aby wszystkie ważne informacje trafiały do jednego miejsca."],
          ["Tworzymy prosty system zdobywania opinii", "Plakietki pojawiają się tam, gdzie klient najłatwiej podzieli się swoim doświadczeniem."],
          ["Twoi klienci zaczynają dzielić się doświadczeniem", "Każdy nowy głos klienta wzmacnia widoczność i zaufanie do firmy."],
          ["Pokazujemy, co naprawdę dzieje się w Twojej firmie", "System porządkuje sygnały, aby właściciel szybko rozumiał, co dzieje się w firmie."],
          ["Wspólnie rozwijamy reputację firmy", "Konkretne wnioski pomagają podejmować lepsze decyzje i systematycznie rozwijać reputację."],
        ],
      },
      items: [
        {
          icon: "quote",
          title: "Zdobywaj więcej opinii",
          text: "Plakietki NFC skracają drogę klienta do wystawienia opinii Google.",
        },
        {
          icon: "shield",
          title: "Rozumiej swoją reputację",
          text: "NuvoRate pokazuje najważniejsze sygnały i wskazuje, co warto poprawić.",
        },
        {
          icon: "clock",
          title: "Reaguj szybciej",
          text: "Twórz profesjonalne odpowiedzi bez ręcznego analizowania każdej opinii.",
        },
        {
          icon: "data",
          title: "Kontroluj rozwój firmy",
          text: "Wszystkie opinie, analizy i działania w jednym przejrzystym centrum.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "Jak działa",
      title: "Od opinii klienta do lepszej decyzji",
      description:
        "NuvoRate zamienia rozproszone komentarze w prosty, powtarzalny proces zarządzania reputacją.",
      cta: "Zobacz dostępne plany",
      stepLabel: "Krok",
      context: ["NFC → Google Review", "Opinie → Panel NuvoRate", "Opinie → Analiza reputacji", "Wnioski → Działanie"],
      steps: [
        {
          title: "Klient dzieli się swoim doświadczeniem",
          text: "Dzięki plakietkom NFC lub bezpośredniemu linkowi klient może szybko zostawić opinię Google w odpowiednim momencie.",
        },
        {
          title: "Wszystkie opinie trafiają w jedno miejsce",
          text: "NuvoRate zbiera opinie firmy i pokazuje je w przejrzystym panelu, aby żadna ważna informacja nie została pominięta.",
        },
        {
          title: "Poznajesz, co naprawdę myślą klienci",
          text: "Analiza reputacji pokazuje najważniejsze mocne strony firmy, powtarzające się problemy oraz obszary wymagające poprawy.",
        },
        {
          title: "Podejmujesz lepsze decyzje",
          text: "Otrzymujesz konkretne wskazówki i możesz szybciej reagować, budując lepsze doświadczenia klientów.",
        },
      ],
    },
    dashboard: {
      badge: "Dashboard NuvoRate",
      title: "Cała reputacja Twojej firmy. Jeden czytelny widok.",
      description:
        "Najważniejsze statystyki, najnowsze opinie, powiadomienia i inteligentna analiza. Od razu widzisz, co działa i co wymaga Twojej uwagi.",
      cards: [
        [
          "Analiza opinii",
          "Najczęściej chwalone elementy i problemy widoczne bez ręcznego czytania każdej opinii.",
        ],
        [
          "Generowanie odpowiedzi",
          "Profesjonalna propozycja odpowiedzi jednym kliknięciem, zawsze z możliwością edycji.",
        ],
        [
          "Ważne powiadomienia",
          "Nowa opinia, negatywna ocena i spadek średniej trafiają od razu na Twój radar.",
        ],
      ],
    },
    nfc: {
      badge: "Moduł NFC",
      title: "Jedna plakietka. Pełna kontrola nad opiniami.",
      description:
        "Plakietki NFC ułatwiają klientom zostawienie opinii, a NuvoRate pokazuje, co dzieje się po każdym skanie.",
      features: [
        ["Wiele plakietek dla jednej firmy", "Dodawaj plakietki w różnych miejscach i sprawdzaj, które generują najwięcej skanów."],
        ["Własne linki i identyfikacja", "Każda plakietka posiada własny link i własne statystyki."],
        ["Statystyki skanów", "Śledź liczbę użyć, aktywność i skuteczność każdej plakietki."],
        ["Konkretne miejsca wykorzystania", "Sprawdź, czy lepiej działa kasa, stolik, recepcja lub inne miejsce."],
      ],
      cardBrand: "NuvoRate",
      cardTitle: "Podziel się swoją opinią",
      cardText: "Zbliż telefon i oceń wizytę.",
      floatingLabel: "Skan NFC",
      floatingValue: "Gotowe w 2 sekundy",
      bullets: [
        "Własna nazwa, link i token dla każdej plakietki",
        "Wszystkie skany i aktywność w jednym miejscu",
        "Porównanie skuteczności miejsc w firmie",
        "Gotowe do użycia przy kasie, stoliku lub recepcji",
      ],
      priceLabel: "Plakietki NFC",
      price: "od 15 zł",
      unit: "/ szt.",
    },
    pricing: {
      eyebrow: "Prosty cennik",
      title: "Wybierz plan dla swojej firmy",
      description:
        "Zacznij od podstawowego monitorowania albo wybierz pełną analizę reputacji.",
      billing: {
        monthly: "Miesięcznie",
        yearly: "Rocznie",
      },
      yearlyBadge: "Najlepsza wartość",
      choosePrefix: "Wybierz",
      nfcNote:
        "Plakietki NFC są opcjonalnym dodatkiem dostępnym od 15 zł za sztukę. Szczegółowe zasady rozliczeń zostaną podane przed uruchomieniem sprzedaży.",
      plans: {
        starter: {
          name: "Starter",
          title: "NuvoRate Starter",
          subtitle: "Dobry początek",
          description:
            "Dla małych firm, które chcą zacząć budować swoją reputację i odpowiadać na opinie z jednego miejsca.",
          features: [
            "50 odpowiedzi na opinie miesięcznie",
            "1 analiza opinii miesięcznie",
            "Dashboard z podstawowymi statystykami",
            "Monitorowanie nowych opinii Google",
            "Powiadomienia o nowych opiniach",
            "Liczba skanów plakietek NFC",
            "Obsługa plakietek NFC i linków do opinii",
          ],
          prices: {
            monthly: { period: "/ miesiąc" },
            yearly: {
              period: "/ rok",
              monthlyEquivalent: "≈ 41,67 zł miesięcznie",
              saving: "Oszczędzasz około 100 zł rocznie",
            },
          },
        },
        business: {
          name: "Business",
          title: "NuvoRate Business",
          subtitle: "Pełna kontrola reputacji",
          description:
            "Pełne narzędzie do zarządzania reputacją dla firm, które chcą rozwijać swoją obecność w Google i oszczędzać czas.",
          featuredBadge: "Najczęściej wybierany",
          features: [
            "350 odpowiedzi na opinie miesięcznie",
            "50 analiz opinii miesięcznie",
            "Dashboard z zaawansowanymi statystykami",
            "Zaawansowana analiza opinii",
            "Weryfikacja autorów opinii",
            "Statystyki skanów NFC",
            "Obsługa wielu lokalizacji",
            "Wszystkie funkcje planu Starter",
          ],
          prices: {
            monthly: { period: "/ miesiąc" },
            yearly: {
              period: "/ rok",
              monthlyEquivalent: "≈ 191,67 zł miesięcznie",
              saving: "Oszczędzasz około 460 zł rocznie",
            },
          },
        },
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Najczęściej zadawane pytania",
      description:
        "Krótko i konkretnie o produkcie, planach oraz opcjonalnych plakietkach NFC.",
      items: [
        {
          question: "Czym jest NuvoRate?",
          answer:
            "NuvoRate to platforma do zarządzania opiniami i reputacją online. Pozwala monitorować nowe opinie Google, odpowiadać na nie, analizować reputację firmy oraz śledzić najważniejsze statystyki w jednym, przejrzystym dashboardzie.",
        },
        {
          question: "Czy plakietka NFC jest potrzebna do korzystania z NuvoRate?",
          answer:
            "Nie. Z NuvoRate możesz korzystać również bez plakietki NFC. Jest ona polecanym dodatkiem, który ułatwia klientom szybkie wystawienie opinii i pomaga zwiększać liczbę nowych recenzji.",
        },
        {
          question: "Czym różni się Starter od Business?",
          answer:
            "Starter zawiera wszystkie podstawowe narzędzia do monitorowania opinii i zarządzania reputacją.\n\nBusiness oferuje wyższe limity, zaawansowane statystyki, rozszerzoną analizę reputacji, obsługę wielu lokalizacji oraz dodatkowe funkcje przeznaczone dla rozwijających się firm.",
        },
        {
          question: "Co zobaczę w dashboardzie?",
          answer:
            "Dashboard pokazuje najważniejsze informacje o reputacji Twojej firmy – liczbę nowych opinii, średnią ocenę, udział pozytywnych opinii, statystyki skanów NFC, wykres zmian w czasie oraz podsumowanie analizy reputacji.",
        },
        {
          question: "Czy NuvoRate może przygotować odpowiedź na opinię?",
          answer:
            "Tak. NuvoRate generuje propozycję profesjonalnej odpowiedzi na podstawie treści opinii. Możesz ją edytować, dostosować do swojego stylu i wykorzystać jako gotową odpowiedź dla klienta.",
        },
        {
          question: "Dla jakich firm jest NuvoRate?",
          answer:
            "NuvoRate został stworzony z myślą o lokalnych firmach, które chcą rozwijać swoją reputację w Google. Świetnie sprawdzi się między innymi w salonach fryzjerskich, barberach, salonach beauty, restauracjach, hotelach, gabinetach oraz innych firmach usługowych.",
        },
      ],
    },
    cta: {
      eyebrow: "Reputacja pod kontrolą",
      title: "Zacznij świadomie rozwijać reputację swojej firmy",
      description:
        "Zbieraj więcej opinii, reaguj szybciej i korzystaj z jednego miejsca do monitorowania tego, co klienci mówią o Twojej firmie.",
      primary: "Załóż konto",
      secondary: "Zobacz dashboard",
    },
    footer: {
      description: "Profesjonalna platforma do zarządzania opiniami i reputacją online.",
      language: "PL / EN",
      copyright: "© 2026 NuvoRate. Wszystkie prawa zastrzeżone.",
      privacy: "Polityka prywatności",
      terms: "Regulamin",
    },
  },
  EN: {
    aria: {
      mainNav: "Main navigation",
      mobileMenu: "Mobile menu",
      languageSelect: "Language selection",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      growthChart: "Review growth chart",
    },
    nav: {
      items: [
        { label: "Features", href: "#funkcje" },
        { label: "How it works", href: "#jak-dziala" },
        { label: "Pricing", href: "#cennik" },
        { label: "FAQ", href: "#faq" },
      ],
      language: "Language",
      login: "Log in",
      register: "Create account",
    },
    mockup: {
      appBadge: "BUSINESS",
      company: "Nova Restaurant",
      planBusiness: "Business plan",
      nav: ["Dashboard", "Reviews", "Analysis", "Responses", "NFC", "Notifications"],
      yourPlan: "Your plan",
      businessActive: "Business active",
      dashboardLabel: "Main dashboard",
      greeting: "Good morning, Anna",
      subtitle: "Your company reputation summary.",
      range: "Last 30 days",
      business: "Business",
      metrics: [
        { label: "New reviews", value: "49", detail: "last 30 days" },
        { label: "Average rating", value: "4.6", detail: "from 49 reviews" },
        { label: "Positive", value: "92%", detail: "45 of 49 reviews" },
        { label: "NFC scans", value: "148", detail: "NFC tracking" },
      ],
      planLimits: "Plan limits",
      billingPeriod: "Monthly plan limits",
      limitsRenewal: "Limits renew at the beginning of each month.",
      limits: [
        ["Review responses", "306 left", "12%"],
        ["Reputation analyses", "47 left", "6%"],
      ],
      newReviewsLabel: "NEW REVIEWS",
      chartTitle: "New reviews over time",
      currentPeriod: "Current period",
      chartLabels: ["Jul 1", "Jul 8", "Jul 15", "Jul 22", "Jul 30"],
      insights: [
        ["Best day", "Saturday"],
        ["This month", "17 reviews"],
        ["Monthly goal", "17 / 30"],
      ],
      analysisLabel: "Analysis",
      analysisTitle: "Last 30 days analysis",
      analysisText:
        "Reputation is growing steadily. Customers most often praise service and the venue atmosphere.",
      analysisPoints: [
        "Strong customer service",
        "Keep asking for reviews",
        "Low share of negative ratings",
      ],
      latestReviewsLabel: "LATEST REVIEWS",
      latestReviewsTitle: "Latest customer reviews",
      seeAll: "See all",
      reviews: [
        ["Anna K.", "Great service and a very friendly atmosphere.", "5.0", "Copy"],
        ["Mark P.", "Good place, I will come back again.", "4.0", "Generate response"],
      ],
    },
    hero: {
      eyebrow: "Reputation hub for local businesses",
      titleStart: "Turn customer reviews into",
      titleHighlight: "better decisions.",
      titleEnd: "",
      description:
        "NuvoRate organizes customer feedback, highlights the signals that matter and helps you respond faster from one clear place.",
      primaryCta: "Create account",
      secondaryCta: "See how it works",
      bullets: ["Reviews under control", "Action-ready insights", "One reputation hub"],
      floatingLabel: "Reputation is growing",
      floatingValue: "+20% new reviews",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Reputation that works for your company growth",
      description:
        "NuvoRate helps you collect reviews, understand customer needs and respond faster — all in one place.",
      stories: [
        { kicker: "Collect more reviews through a simpler customer experience", title: "Every great review starts with a simple moment", text: "An NFC plate shortens the customer’s path to a Google review. New reviews go directly to your company’s reputation center." },
        { kicker: "Turn reviews into clear decisions", title: "You do not just see reviews. You understand what they mean.", text: "NuvoRate analyzes reviews and highlights the key signals, strengths and areas that need improvement." },
        { kicker: "Respond faster and more professionally", title: "Every review deserves a response", text: "Prepare consistent responses and react faster without writing every message manually." },
      ],
      journey: {
        title: "NuvoRate helps you build your own reputation management system",
        description: "From initial setup to everyday decisions, NuvoRate becomes a partner in growing your company’s reputation.",
        footer: "NuvoRate supports your company’s growth",
        statuses: [
          "Preparation complete",
          "Your review collection system is ready",
          "New reviews are starting to arrive",
          "Insights are ready for action",
          "Your reputation grows every day",
        ],
        steps: [
          ["We get to know your company", "We establish a starting point so that all important information comes to one place."],
          ["We create a simple review collection system", "The plates appear where customers can most easily share their experience."],
          ["Your customers start sharing their experience", "Every new customer voice builds trust and visibility for your company."],
          ["We show what is really happening in your company", "The system organizes the signals so the owner quickly understands what is happening."],
          ["Together, we grow your company’s reputation", "Clear insights support better decisions and steady reputation growth."],
        ],
      },
      items: [
        {
          icon: "quote",
          title: "Collect more reviews",
          text: "NFC plates shorten the customer journey to leaving a Google review.",
        },
        {
          icon: "shield",
          title: "Understand your reputation",
          text: "NuvoRate highlights the most important signals and what is worth improving.",
        },
        {
          icon: "clock",
          title: "Respond faster",
          text: "Create professional responses without manually analyzing every review.",
        },
        {
          icon: "data",
          title: "Control company growth",
          text: "All reviews, analysis and actions in one clear reputation center.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "From customer review to better decision",
      description:
        "NuvoRate turns scattered comments into a simple, repeatable reputation management process.",
      cta: "See available plans",
      stepLabel: "Step",
      context: ["NFC → Google Review", "Reviews → NuvoRate dashboard", "Reviews → Reputation analysis", "Insights → Action"],
      steps: [
        {
          title: "The customer shares their experience",
          text: "With NFC plates or a direct link, the customer can quickly leave a Google review at the right moment.",
        },
        {
          title: "All reviews come to one place",
          text: "NuvoRate collects your company reviews and shows them in a clear dashboard, so no important information is missed.",
        },
        {
          title: "You learn what customers really think",
          text: "Reputation analysis highlights the company’s key strengths, recurring issues and areas that need improvement.",
        },
        {
          title: "You make better decisions",
          text: "You receive clear guidance and can respond faster, building better customer experiences.",
        },
      ],
    },
    dashboard: {
      badge: "NuvoRate dashboard",
      title: "Your full company reputation. One clear view.",
      description:
        "Key statistics, latest reviews, notifications and intelligent analysis. You immediately see what works and what needs your attention.",
      cards: [
        [
          "Review analysis",
          "Most praised elements and recurring problems visible without reading every review manually.",
        ],
        [
          "Response generation",
          "A professional response suggestion in one click, always editable before use.",
        ],
        [
          "Important notifications",
          "New reviews, negative ratings and rating drops appear on your radar immediately.",
        ],
      ],
    },
    nfc: {
      badge: "NFC module",
      title: "One plate. Full control over your reviews.",
      description:
        "NFC plates make it easier for customers to leave a review, while NuvoRate shows what happens after every scan.",
      features: [
        ["Multiple plates for one company", "Add plates in different places and see which ones generate the most scans."],
        ["Your own links and identification", "Every plate has its own link and its own statistics."],
        ["Scan statistics", "Track usage, activity and the effectiveness of every plate."],
        ["Specific places of use", "See whether the counter, table, reception or another place works best."],
      ],
      cardBrand: "NuvoRate",
      cardTitle: "Share your review",
      cardText: "Tap your phone and rate your visit.",
      floatingLabel: "NFC scan",
      floatingValue: "Ready in 2 seconds",
      bullets: [
        "A unique name, link and token for every plate",
        "All scans and activity in one place",
        "Compare the effectiveness of places in your company",
        "Ready to use at the counter, table or reception",
      ],
      priceLabel: "NFC plates",
      price: "from 15 PLN",
      unit: "/ pc.",
    },
    pricing: {
      eyebrow: "Simple pricing",
      title: "Choose a plan for your company",
      description:
        "Start with basic monitoring or choose full reputation analysis.",
      billing: {
        monthly: "Monthly",
        yearly: "Yearly",
      },
      yearlyBadge: "Best value",
      choosePrefix: "Choose",
      nfcNote:
        "NFC plates are an optional add-on available from 15 PLN per piece. Detailed billing rules will be shown before sales launch.",
      plans: {
        starter: {
          name: "Starter",
          title: "NuvoRate Starter",
          subtitle: "A strong start",
          description:
            "For small businesses that want to start building their reputation and respond to reviews from one place.",
          features: [
            "50 review responses per month",
            "1 review analysis per month",
            "Dashboard with basic statistics",
            "Google review monitoring",
            "Notifications about new reviews",
            "NFC plate scan count",
            "Support for NFC plates and review links",
          ],
          prices: {
            monthly: { period: "/ month" },
            yearly: {
              period: "/ year",
              monthlyEquivalent: "≈ 41.67 PLN per month",
              saving: "Save around 100 PLN per year",
            },
          },
        },
        business: {
          name: "Business",
          title: "NuvoRate Business",
          subtitle: "Full reputation control",
          description:
            "A complete reputation management tool for companies that want to grow their Google presence and save time.",
          featuredBadge: "Most popular",
          features: [
            "350 review responses per month",
            "50 review analyses per month",
            "Dashboard with advanced statistics",
            "Advanced review analysis",
            "Review author verification",
            "NFC scan statistics",
            "Multiple location support",
            "All Starter features",
          ],
          prices: {
            monthly: { period: "/ month" },
            yearly: {
              period: "/ year",
              monthlyEquivalent: "≈ 191.67 PLN per month",
              saving: "Save around 460 PLN per year",
            },
          },
        },
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      description:
        "Short and clear answers about the product, plans and optional NFC plates.",
      items: [
        {
          question: "What is NuvoRate?",
          answer:
            "NuvoRate is a platform for managing reviews and online reputation. It lets you monitor new Google reviews, respond to them, analyze company reputation and track key statistics in one clear dashboard.",
        },
        {
          question: "Do I need an NFC plate to use NuvoRate?",
          answer:
            "No. You can use NuvoRate without an NFC plate. It is a recommended add-on that makes it easier for customers to leave a review quickly and helps increase the number of new reviews.",
        },
        {
          question: "What is the difference between Starter and Business?",
          answer:
            "Starter includes all basic tools for review monitoring and reputation management.\n\nBusiness offers higher limits, advanced statistics, extended reputation analysis, multi-location support and additional features for growing companies.",
        },
        {
          question: "What will I see in the dashboard?",
          answer:
            "The dashboard shows the key reputation data for your company: number of new reviews, average rating, share of positive reviews, NFC scan statistics, changes over time and a reputation analysis summary.",
        },
        {
          question: "Can NuvoRate prepare a response to a review?",
          answer:
            "Yes. NuvoRate generates a professional response suggestion based on the review content. You can edit it, adjust it to your style and use it as a ready response to the customer.",
        },
        {
          question: "Is NuvoRate right for my business?",
          answer:
            "NuvoRate was built for local companies that want to grow their reputation on Google. It works especially well for hair salons, barbers, beauty salons, restaurants, hotels, clinics and other service businesses.",
        },
      ],
    },
    cta: {
      eyebrow: "Reputation under control",
      title: "Start growing your company reputation with intention",
      description:
        "Collect more reviews, respond faster and use one place to monitor what customers say about your company.",
      primary: "Create account",
      secondary: "See dashboard",
    },
    footer: {
      description: "A professional platform for managing reviews and online reputation.",
      language: "PL / EN",
      copyright: "© 2026 NuvoRate. All rights reserved.",
      privacy: "Privacy policy",
      terms: "Terms",
    },
  },
} as const;

export type LandingTranslations = (typeof landingTranslations)[LandingLanguage];
