import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Polityka prywatności | NuvoRate",
  description: "Polityka prywatności usługi NuvoRate.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Dokument prawny"
      title="Polityka prywatności"
      intro="NuvoRate jest usługą SaaS świadczoną przez CONNECTON sp. z o.o. Dokument opisuje zasady przetwarzania danych osobowych i danych związanych z korzystaniem z usługi."
      sections={[
        {
          title: "Administrator danych",
          paragraphs: [
            "Administratorem danych osobowych jest CONNECTON sp. z o.o., ul. Parkowa 20, 42-582 Rogoźnik, NIP: 6252464506, KRS: 0000722596.",
            "W sprawach związanych z prywatnością i przetwarzaniem danych można kontaktować się z Fabianem Dziekanem pod adresem: nuvorate.contact@gmail.com.",
          ],
        },
        {
          title: "Zakres przetwarzanych danych",
          paragraphs: ["W zależności od sposobu korzystania z NuvoRate możemy przetwarzać dane użytkowników konta oraz dane związane z obsługiwaną firmą."],
          items: [
            "dane konta, takie jak imię, nazwisko, adres e-mail oraz dane logowania;",
            "dane firmy dodane w panelu NuvoRate, w tym nazwa, branża, lokalizacja i ustawienia;",
            "dane techniczne i statystyczne dotyczące korzystania z usługi;",
            "dane zawarte w opiniach Google pobieranych w ramach integracji Google Business Profile API, w zakresie dostępnym dla uprawnionego konta;",
            "dane związane z plakietkami NFC, w tym ich identyfikatory, skany, czas aktywności i statystyki użycia.",
          ],
        },
        {
          title: "Cele i podstawy przetwarzania",
          paragraphs: ["Dane przetwarzamy w zakresie niezbędnym do świadczenia usługi NuvoRate, zapewnienia bezpieczeństwa konta, obsługi płatności, wsparcia użytkowników oraz rozwoju i ochrony usługi."],
          items: [
            "wykonanie umowy i świadczenie funkcji SaaS;",
            "wypełnienie obowiązków prawnych;",
            "realizacja prawnie uzasadnionego interesu administratora, w tym bezpieczeństwa, diagnostyki i zapobiegania nadużyciom;",
            "zgoda użytkownika — gdy jest wymagana, w szczególności w odniesieniu do wybranych technologii cookies.",
          ],
        },
        {
          title: "Google Business Profile i opinie Google",
          paragraphs: [
            "Jeżeli użytkownik połączy konto NuvoRate z usługami Google, NuvoRate może przetwarzać dane dostępne przez Google Business Profile API w zakresie uprawnień udzielonych przez użytkownika.",
            "Dane opinii Google są wykorzystywane wyłącznie do prezentacji ich w panelu, analizy reputacji, tworzenia statystyk oraz przygotowywania propozycji odpowiedzi. Użytkownik pozostaje odpowiedzialny za podstawę prawną i uprawnienia do korzystania z danych swojej firmy.",
          ],
        },
        {
          title: "Płatności i dostawcy usług",
          paragraphs: [
            "Płatności za płatne subskrypcje NuvoRate są obsługiwane przez Stripe. NuvoRate nie przechowuje pełnych danych karty płatniczej; dane płatnicze są przetwarzane zgodnie z zasadami Stripe.",
            "W celu świadczenia usługi korzystamy z dostawców zewnętrznych: Supabase (baza danych i uwierzytelnianie), Vercel (hosting i infrastruktura), Stripe (płatności), OpenAI (funkcje AI) oraz Google Business Profile API (integracja z profilem firmy i opiniami Google). Dostawcy przetwarzają dane wyłącznie w zakresie niezbędnym do realizacji powierzonych usług.",
          ],
        },
        {
          title: "Okres przechowywania danych",
          paragraphs: ["Dane przechowujemy przez okres korzystania z konta oraz przez czas wymagany przepisami prawa lub konieczny do ochrony roszczeń. Po zakończeniu korzystania z usługi dane są usuwane albo anonimizowane zgodnie z obowiązującymi zasadami i wymaganiami prawnymi."],
        },
        {
          title: "Prawa użytkownika",
          paragraphs: ["Zgodnie z RODO użytkownikowi przysługuje prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu oraz cofnięcia zgody, jeśli przetwarzanie odbywa się na jej podstawie."],
          items: [
            "Aby skorzystać z praw, skontaktuj się z nami: nuvorate.contact@gmail.com.",
            "Użytkownik ma także prawo wniesienia skargi do właściwego organu nadzorczego ds. ochrony danych osobowych.",
          ],
        },
        {
          title: "Bezpieczeństwo i zmiany dokumentu",
          paragraphs: [
            "Stosujemy odpowiednie środki organizacyjne i techniczne, aby chronić przetwarzane dane. Żaden sposób transmisji lub przechowywania danych nie zapewnia jednak całkowitego bezpieczeństwa.",
            "Polityka może być aktualizowana w razie zmian prawnych, technologicznych lub rozwoju usługi. Aktualna wersja będzie dostępna na tej stronie.",
          ],
        },
      ]}
    />
  );
}
