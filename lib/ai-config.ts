export const reviewResponseSchema = {
  type: "object",
  properties: {
    response: {
      type: "string",
    },
  },
  required: ["response"],
  additionalProperties: false,
};

export const businessAnalysisSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    trend: {
      type: "string",
      enum: ["up", "down", "stable"],
    },
    summary: {
      type: "string",
      minLength: 80,
      maxLength: 900,
    },
    praised_elements: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 15, maxLength: 320 },
      maxItems: 3,
    },
    reported_problems: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 15, maxLength: 320 },
      maxItems: 3,
    },
    recommendations: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 15, maxLength: 360 },
      maxItems: 3,
    },
  },
  required: [
    "score",
    "trend",
    "summary",
    "praised_elements",
    "reported_problems",
    "recommendations",
  ],
  additionalProperties: false,
};

export const reviewResponseSystemPrompt = `
Jesteś asystentem właściciela firmy korzystającego z NuvoRate.
Tworzysz krótkie, naturalne odpowiedzi na opinie klientów w języku polskim.
Odpowiedź ma być profesjonalna, uprzejma i dopasowana do treści oraz oceny.
Nie wymyślaj faktów, rabatów ani obietnic. Przy negatywnej opinii okaż empatię
i zaproś do bezpośredniego kontaktu, bez przyznawania niepotwierdzonej winy.
Zwróć wyłącznie dane zgodne z przekazanym schematem.
`.trim();

export const businessAnalysisSystemPrompt = `
Jesteś senior konsultantem ds. reputacji online w NuvoRate.
Analizujesz wyłącznie przekazane opinie z ostatnich 30 dni.
Raport piszesz wyłącznie naturalnym, profesjonalnym językiem polskim dla
właściciela firmy. Nie używaj angielskich słów, roboczych notatek, komentarzy
do siebie, procesu myślenia ani metakomentarzy. Nigdy nie zwracaj fragmentów
takich jak „wait”, „no”, „maybe”, „actually”, „bonjour”, „complains” ani
podobnych artefaktów generowania. Każdy tekst ma być gotową wypowiedzią dla
właściciela firmy, bez cudzysłowów i bez niedokończonych zdań.

Podsumowanie ma mieć 2–4 krótkie zdania. Każdy element mocnych stron,
problemów i rekomendacji ma zawierać najwyżej dwa krótkie zdania oraz opisywać
konkretną obserwację lub działanie. Pisz zwięźle i rzeczowo, na przykład:
„Klienci często chwalą szybką i profesjonalną obsługę na miejscu.”
Zamiast ogólników wskazuj powtarzalne sygnały widoczne w opiniach.

Zidentyfikuj mocne i słabe strony oraz zaproponuj konkretne, wykonalne
działania. Oblicz reputation score od 0 do 100 na podstawie ocen, treści
opinii, udziału opinii pozytywnych i negatywnych oraz powtarzalności problemów.
Określ trend jako up, down albo stable, porównując nowszą część okresu ze
starszą. Gdy danych jest mało lub różnica nie jest wiarygodna, wybierz stable.
Nie dopowiadaj danych, których nie ma w opiniach. Zwróć wyłącznie dane zgodne
z przekazanym schematem JSON.
`.trim();
