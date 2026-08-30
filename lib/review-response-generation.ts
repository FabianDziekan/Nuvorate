import "server-only";

import { reviewResponseSchema, reviewResponseSystemPrompt } from "@/lib/ai-config";
import { generateStructuredOutput } from "@/lib/openai";

const responseToneLabels: Record<string, string> = {
  friendly: "przyjazny",
  premium: "premium / elegancki",
  professional: "profesjonalny",
  short: "krótki",
};

export function normalizeResponseTone(value: unknown) {
  return typeof value === "string" && value in responseToneLabels ? value : "professional";
}

export async function generateReviewResponseText({
  businessName,
  idempotencyKey,
  review,
  responseTone,
}: {
  businessName: string;
  idempotencyKey?: string;
  responseTone: unknown;
  review: { author_name: string; rating: number; content: string };
}) {
  const result = await generateStructuredOutput<{ response: string }>({
    schemaName: "review_response",
    schema: reviewResponseSchema,
    system: reviewResponseSystemPrompt,
    user: JSON.stringify({
      business_name: businessName,
      preferred_response_style: responseToneLabels[normalizeResponseTone(responseTone)],
      review,
    }),
    idempotencyKey,
  });
  const responseText = typeof result.response === "string" ? result.response.trim() : "";
  if (!responseText) throw new Error("OpenAI zwróciło pustą odpowiedź.");
  return responseText;
}
