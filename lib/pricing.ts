export type BillingCycle = "monthly" | "yearly";
export type PricingPlanId = "starter" | "business";

export const billingCycles: Array<{ id: BillingCycle; label: string }> = [
  { id: "monthly", label: "Miesięcznie" },
  { id: "yearly", label: "Rocznie" },
];

export const pricingPlans = [
  {
    id: "starter",
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
      monthly: {
        price: "49,99 zł",
        period: "/ miesiąc",
        href: "/checkout?plan=starter&billing=monthly",
      },
      yearly: {
        price: "499,99 zł",
        period: "/ rok",
        monthlyEquivalent: "≈ 41,67 zł miesięcznie",
        saving: "Oszczędzasz około 100 zł rocznie",
        href: "/checkout?plan=starter&billing=yearly",
      },
    },
  },
  {
    id: "business",
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
      monthly: {
        price: "229,99 zł",
        period: "/ miesiąc",
        href: "/checkout?plan=business&billing=monthly",
      },
      yearly: {
        price: "2299,99 zł",
        period: "/ rok",
        monthlyEquivalent: "≈ 191,67 zł miesięcznie",
        saving: "Oszczędzasz około 460 zł rocznie",
        href: "/checkout?plan=business&billing=yearly",
      },
    },
  },
] as const;
