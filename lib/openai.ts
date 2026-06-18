type JsonSchema = Record<string, unknown>;

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

export const openAIModel = process.env.OPENAI_MODEL || "gpt-5.5";

export async function generateStructuredOutput<T>({
  schemaName,
  schema,
  system,
  user,
}: {
  schemaName: string;
  schema: JsonSchema;
  system: string;
  user: string;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Brak zmiennej OPENAI_API_KEY.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAIModel,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message || "OpenAI API zwróciło błąd.",
    );
  }

  const outputText = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")
    ?.text;

  if (!outputText) {
    throw new Error("OpenAI API nie zwróciło treści odpowiedzi.");
  }

  return JSON.parse(outputText) as T;
}
