import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Regulamin | NuvoRate",
  description: "Regulamin korzystania z usługi NuvoRate.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Dokument prawny"
      title="Regulamin korzystania z usługi"
      intro="NuvoRate jest usługą SaaS świadczoną przez CONNECTON sp. z o.o. Regulamin określa zasady korzystania z platformy do zarządzania reputacją Google dla firm."
      sections={[
        {
          title: "Postanowienia ogólne",
          paragraphs: [
            "Usługodawcą platformy NuvoRate jest CONNECTON sp. z o.o., ul. Parkowa 20, 42-582 Rogoźnik, NIP: 6252464506, KRS: 0000722596. Kontakt z usługodawcą: Fabian Dziekan, nuvorate.contact@gmail.com.",
            "Regulamin określa zasady korzystania z usługi SaaS NuvoRate dostępnej w aplikacji internetowej oraz na stronach publicznych usługi.",
          ],
        },
        {
          title: "Zakres usługi",
          paragraphs: ["NuvoRate jest usługą SaaS do zarządzania reputacją Google dla firm. Zakres dostępnych funkcji zależy od wybranego planu i aktualnego stanu subskrypcji."],
          items: [
            "monitorowanie i organizacja opinii;",
            "analiza reputacji oraz prezentacja statystyk;",
            "propozycje odpowiedzi na opinie;",
            "NFC review badges i statystyki skanów;",
            "integrację z Google Business Profile API, jeśli jest dostępna dla konta użytkownika;",
            "płatne subskrypcje oraz funkcje zależne od aktywnego planu.",
          ],
        },
        {
          title: "Konto użytkownika",
          paragraphs: [
            "Korzystanie z części funkcji wymaga utworzenia konta. Użytkownik jest zobowiązany podawać prawdziwe dane, chronić dane dostępowe oraz nie udostępniać konta osobom nieuprawnionym.",
            "Użytkownik odpowiada za działania wykonane z użyciem jego konta, chyba że doszło do nich z przyczyn niezależnych od użytkownika i zostały niezwłocznie zgłoszone usługodawcy.",
          ],
        },
        {
          title: "Plany, opłaty i limity",
          paragraphs: [
            "NuvoRate oferuje płatne subskrypcje miesięczne i roczne, w tym plany Starter i Business. Aktualna cena, okres rozliczeniowy, zakres funkcji, limity użycia oraz dostępność poszczególnych funkcji są prezentowane użytkownikowi przed aktywacją subskrypcji.",
            "Płatności za subskrypcje są obsługiwane przez Stripe. Subskrypcja odnawia się automatycznie na kolejny okres rozliczeniowy, chyba że użytkownik anuluje ją przed rozpoczęciem kolejnego okresu.",
            "Limity, w tym limity analiz i odpowiedzi AI, są stosowane zgodnie z wybranym planem. Usługodawca może odmówić wykonania operacji po wykorzystaniu danego limitu do czasu jego odnowienia lub zmiany planu.",
          ],
        },
        {
          title: "Zasady korzystania z funkcji AI",
          paragraphs: [
            "Funkcje AI mogą przygotowywać analizy i propozycje odpowiedzi na podstawie danych dostępnych w usłudze. Wyniki mają charakter pomocniczy i wymagają oceny użytkownika przed podjęciem decyzji biznesowej lub publikacją odpowiedzi.",
            "Użytkownik ponosi odpowiedzialność za ostateczną treść opublikowanych odpowiedzi oraz za zgodność korzystania z funkcji AI z prawem, regulaminami usług zewnętrznych i prawami osób trzecich.",
          ],
        },
        {
          title: "Obowiązki użytkownika",
          paragraphs: ["Użytkownik zobowiązuje się korzystać z NuvoRate zgodnie z prawem, dobrymi obyczajami oraz niniejszym regulaminem."],
          items: [
            "nie używać usługi do działań naruszających prawa osób trzecich;",
            "nie podejmować prób zakłócania działania usługi lub obchodzenia limitów i zabezpieczeń;",
            "posiadać wymagane uprawnienia do danych firmy, opinii oraz kont usług zewnętrznych, które łączy z NuvoRate.",
          ],
        },
        {
          title: "Anulowanie subskrypcji",
          paragraphs: [
            "Użytkownik może anulować subskrypcję w dowolnym momencie za pomocą dostępnego mechanizmu zarządzania subskrypcją.",
            "Po anulowaniu dostęp do płatnego planu pozostaje aktywny do końca już opłaconego okresu rozliczeniowego. Po jego zakończeniu płatna subskrypcja nie zostanie ponownie odnowiona.",
          ],
        },
        {
          title: "Zwroty i rozliczenia",
          paragraphs: [
            "Samo anulowanie subskrypcji nie powoduje automatycznego proporcjonalnego zwrotu opłaty za rozpoczęty lub już opłacony okres rozliczeniowy, z zastrzeżeniem przypadków, w których zwrot jest wymagany przez obowiązujące przepisy prawa.",
            "W przypadku zmiany planu sposób rozliczenia zmiany wynika z informacji przedstawionych użytkownikowi przed jej potwierdzeniem oraz z mechanizmu rozliczeń Stripe.",
          ],
        },
        {
          title: "Odpowiedzialność i zmiany regulaminu",
          paragraphs: [
            "Usługodawca dokłada starań, aby NuvoRate działał prawidłowo, jednak nie gwarantuje nieprzerwanej dostępności wszystkich usług zewnętrznych ani rezultatów biznesowych wynikających z korzystania z platformy.",
            "Regulamin może zostać zaktualizowany z ważnych przyczyn, w szczególności zmian prawa, funkcji lub bezpieczeństwa usługi. Aktualna wersja dokumentu będzie dostępna na tej stronie.",
          ],
        },
      ]}
    />
  );
}
