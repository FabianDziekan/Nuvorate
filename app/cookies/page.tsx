import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Polityka cookies | NuvoRate",
  description: "Polityka cookies usługi NuvoRate.",
};

export default function CookiesPage() {
  return (
    <LegalDocument
      eyebrow="Dokument prawny"
      title="Polityka cookies"
      intro="NuvoRate jest usługą SaaS świadczoną przez CONNECTON sp. z o.o. Dokument wyjaśnia, w jaki sposób usługa może korzystać z plików cookies i podobnych technologii."
      sections={[
        {
          title: "Administrator i kontakt",
          paragraphs: [
            "Administratorem serwisu jest CONNECTON sp. z o.o., ul. Parkowa 20, 42-582 Rogoźnik, NIP: 6252464506, KRS: 0000722596.",
            "Pytania dotyczące cookies i prywatności można kierować do Fabiana Dziekana na: nuvorate.contact@gmail.com.",
          ],
        },
        {
          title: "Czym są pliki cookies",
          paragraphs: ["Cookies to niewielkie pliki tekstowe zapisywane na urządzeniu użytkownika podczas korzystania ze strony lub aplikacji. Mogą być wykorzystywane także podobne technologie służące do zapewnienia działania, bezpieczeństwa i pomiaru usług."],
        },
        {
          title: "Cookies niezbędne",
          paragraphs: ["Niezbędne cookies pomagają zapewnić podstawowe działanie serwisu i bezpieczeństwo konta. Bez nich niektóre funkcje, takie jak logowanie, utrzymanie sesji lub ochrona przed nadużyciami, mogą nie działać prawidłowo."],
        },
        {
          title: "Cookies analityczne",
          paragraphs: ["Cookies analityczne pomagają zrozumieć, w jaki sposób użytkownicy korzystają z serwisu, aby poprawiać jego funkcje, wydajność i użyteczność. Tam, gdzie wymaga tego prawo, będą używane dopiero po uzyskaniu odpowiedniej zgody."],
        },
        {
          title: "Cookies usług zewnętrznych",
          paragraphs: ["Niektóre funkcje NuvoRate korzystają z usług zewnętrznych: Supabase, Vercel, Stripe, OpenAI oraz Google Business Profile API. Usługi te mogą stosować własne cookies i zasady prywatności w zakresie niezbędnym do zapewnienia działania, płatności, funkcji AI, integracji Google i infrastruktury technicznej."],
        },
        {
          title: "Zarządzanie zgodami",
          paragraphs: [
            "Użytkownik może zarządzać zgodami na nieobowiązkowe cookies za pomocą mechanizmu zgód dostępnego w serwisie, jeśli został udostępniony.",
            "Użytkownik może również ograniczyć lub usunąć cookies w ustawieniach przeglądarki. Ograniczenie cookies niezbędnych może wpłynąć na prawidłowe działanie części serwisu.",
          ],
        },
        {
          title: "Zmiany polityki cookies",
          paragraphs: ["Polityka cookies może być aktualizowana w razie zmian technologicznych, prawnych lub zmian w wykorzystywanych usługach. Aktualna wersja będzie publikowana na tej stronie."],
        },
      ]}
    />
  );
}
