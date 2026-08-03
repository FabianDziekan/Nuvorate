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
      eyebrow: "Platforma do zarządzania reputacją",
      titleStart: "Więcej opinii.",
      titleHighlight: "Większe zaufanie.",
      titleEnd: "Więcej klientów.",
      description:
        "Zbieraj opinie, monitoruj reputację i szybciej reaguj na głos klientów. Wszystko, czego potrzebujesz, w jednym przejrzystym panelu.",
      primaryCta: "Załóż konto",
      secondaryCta: "Zobacz dashboard",
      bullets: ["Proste wdrożenie", "Dane w jednym miejscu", "NFC jako opcja"],
      floatingLabel: "Reputacja rośnie",
      floatingValue: "+20% nowych opinii",
    },
    benefits: {
      eyebrow: "Korzyści",
      title: "Reputacja, która pracuje na rozwój Twojej firmy",
      description:
        "NuvoRate porządkuje cały proces zarządzania opiniami, aby każda informacja prowadziła do lepszej decyzji.",
      items: [
        {
          icon: "quote",
          title: "Więcej opinii",
          text: "Ułatw klientom wystawienie opinii dzięki plakietkom NFC i zwiększaj liczbę nowych recenzji każdego dnia.",
        },
        {
          icon: "shield",
          title: "Większe zaufanie",
          text: "Odpowiadaj na opinie szybciej i buduj wiarygodność firmy dzięki aktywnej komunikacji z klientami.",
        },
        {
          icon: "clock",
          title: "Oszczędność czasu",
          text: "Zamiast czytać dziesiątki opinii, otrzymujesz gotowe wnioski i konkretne wskazówki do działania.",
        },
        {
          icon: "data",
          title: "Wszystko w jednym miejscu",
          text: "Opinie, statystyki, analiza reputacji, powiadomienia i NFC w jednym przejrzystym panelu.",
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
      steps: [
        {
          title: "Klient wystawia opinię",
          text: "Udostępniasz klientowi plakietkę NFC lub link do opinii. Jedno zbliżenie telefonu lub jedno kliknięcie wystarczy, aby w kilka sekund przejść do wystawienia opinii.",
        },
        {
          title: "NuvoRate monitoruje",
          text: "Nowe oceny i komentarze trafiają do jednego uporządkowanego panelu.",
        },
        {
          title: "NuvoRate analizuje",
          text: "Platforma pokazuje wzrost liczby opinii, najmocniejsze strony Twojej firmy oraz obszary wymagające poprawy.",
        },
        {
          title: "Otrzymujesz gotowe informacje",
          text: "Wiesz, co wymaga reakcji, gdzie firma rośnie i jakie działania warto podjąć.",
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
      badge: "Polecany dodatek",
      title: "Jeszcze prostsza droga do opinii",
      description:
        "Plakietki NFC pomagają wykorzystać moment, w którym klient jest najbardziej gotowy podzielić się doświadczeniem. Jedno zbliżenie telefonu prowadzi go prosto do opinii.",
      cardBrand: "NuvoRate",
      cardTitle: "Podziel się swoją opinią",
      cardText: "Zbliż telefon i oceń wizytę.",
      floatingLabel: "Skan NFC",
      floatingValue: "Gotowe w 2 sekundy",
      bullets: [
        "Prosta konfiguracja z kontem NuvoRate",
        "Liczba skanów widoczna w dashboardzie",
        "Idealne do lokali i punktów usługowych",
        "NFC wspiera abonament, ale nie jest wymagane",
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
      eyebrow: "Reputation management platform",
      titleStart: "More reviews.",
      titleHighlight: "More trust.",
      titleEnd: "More customers.",
      description:
        "Collect reviews, monitor your reputation and respond faster to customer feedback. Everything you need in one clear dashboard.",
      primaryCta: "Create account",
      secondaryCta: "See dashboard",
      bullets: ["Easy setup", "Data in one place", "NFC as an option"],
      floatingLabel: "Reputation is growing",
      floatingValue: "+20% new reviews",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Reputation that works for your company growth",
      description:
        "NuvoRate organizes the entire review management process so every piece of feedback leads to a better decision.",
      items: [
        {
          icon: "quote",
          title: "More reviews",
          text: "Make it easier for customers to leave reviews with NFC plates and increase the number of new reviews every day.",
        },
        {
          icon: "shield",
          title: "More trust",
          text: "Respond to reviews faster and build company credibility through active communication with customers.",
        },
        {
          icon: "clock",
          title: "Save time",
          text: "Instead of reading dozens of reviews, you get ready-made insights and clear recommendations for action.",
        },
        {
          icon: "data",
          title: "Everything in one place",
          text: "Reviews, statistics, reputation analysis, notifications and NFC in one clear dashboard.",
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
      steps: [
        {
          title: "The customer leaves a review",
          text: "You share an NFC plate or review link with the customer. One phone tap or one click is enough to open the review page in seconds.",
        },
        {
          title: "NuvoRate monitors",
          text: "New ratings and comments appear in one organized dashboard.",
        },
        {
          title: "NuvoRate analyzes",
          text: "The platform shows review growth, your company’s strongest points and areas that need improvement.",
        },
        {
          title: "You receive ready insights",
          text: "You know what needs a response, where the company is growing and what actions are worth taking.",
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
      badge: "Recommended add-on",
      title: "An even simpler path to reviews",
      description:
        "NFC plates help you use the moment when customers are most ready to share their experience. One phone tap takes them straight to the review page.",
      cardBrand: "NuvoRate",
      cardTitle: "Share your review",
      cardText: "Tap your phone and rate your visit.",
      floatingLabel: "NFC scan",
      floatingValue: "Ready in 2 seconds",
      bullets: [
        "Simple setup with a NuvoRate account",
        "Scan count visible in the dashboard",
        "Ideal for local venues and service points",
        "NFC supports the subscription, but is not required",
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
