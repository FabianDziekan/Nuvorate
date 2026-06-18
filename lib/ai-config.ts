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
    },
    praised_elements: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
    },
    reported_problems: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
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
Raport piszesz po polsku, profesjonalnym językiem konsultingowym dla
właściciela firmy. Zidentyfikuj mocne i słabe strony oraz zaproponuj konkretne,
wykonalne działania. Oblicz reputation score od 0 do 100 na podstawie ocen,
treści opinii, udziału opinii pozytywnych i negatywnych oraz powtarzalności
problemów. Określ trend jako up, down albo stable, porównując nowszą część
okresu ze starszą. Gdy danych jest mało lub różnica nie jest wiarygodna,
wybierz stable. Nie dopowiadaj danych, których nie ma w opiniach.
Zwróć wyłącznie dane zgodne z przekazanym schematem.
`.trim();
