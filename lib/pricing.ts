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
      "Dla małych firm, które chcą systematycznie zbierać i monitorować opinie.",
    features: [
      "50 odpowiedzi na opinie miesięcznie",
      "1 analiza reputacji miesięcznie",
      "Podstawowy dashboard reputacji",
      "Statystyki i trendy opinii",
      "Podgląd skanów NFC",
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
      "Dla firm, które potrzebują głębszych wniosków i inteligentnej analizy.",
    featuredBadge: "Najczęściej wybierany",
    features: [
      "350 odpowiedzi na opinie miesięcznie",
      "50 analiz reputacji miesięcznie",
      "Wszystko z planu Starter",
      "Inteligentna analiza opinii",
      "Zaawansowane alerty i filtry",
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
