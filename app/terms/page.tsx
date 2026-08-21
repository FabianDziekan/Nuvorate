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
            "NuvoRate może oferować plany Starter i Business. Ceny, zakres funkcji, limity użycia oraz dostępność poszczególnych funkcji są prezentowane przed aktywacją płatnego planu.",
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
            "Płatną subskrypcję można anulować zgodnie z warunkami przedstawionymi podczas zakupu lub w panelu rozliczeń. Anulowanie może skutkować zakończeniem dostępu do funkcji płatnego planu po upływie opłaconego okresu rozliczeniowego.",
            "Szczegółowe zasady zwrotów, rozliczeń i zmian planu należy uzupełnić zgodnie z modelem sprzedaży oraz obowiązującymi przepisami.",
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
