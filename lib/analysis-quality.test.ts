import assert from "node:assert/strict";
import test from "node:test";
import { isValidBusinessAnalysis } from "./analysis-quality.ts";

const validAnalysis = {
  score: 82,
  trend: "stable" as const,
  summary:
    "Klienci najczęściej doceniają jakość obsługi i przyjazną atmosferę. W części opinii pojawiają się jednak uwagi o czasie oczekiwania w godzinach szczytu.",
  praised_elements: ["Klienci często chwalą szybką i profesjonalną obsługę na miejscu."],
  reported_problems: ["W kilku opiniach powtarzają się uwagi dotyczące zbyt długiego czasu oczekiwania."],
  recommendations: ["W godzinach największego ruchu warto wzmocnić obsadę, aby skrócić czas oczekiwania klientów."],
};

test("accepts concise professional Polish analysis content", () => {
  assert.equal(isValidBusinessAnalysis(validAnalysis), true);
});

test("rejects model artifacts before an analysis can be saved", () => {
  assert.equal(
    isValidBusinessAnalysis({
      ...validAnalysis,
      praised_elements: ["bonjour? wait no"],
    }),
    false,
  );
  assert.equal(
    isValidBusinessAnalysis({
      ...validAnalysis,
      recommendations: ["Maybe warto poprawić obsługę."],
    }),
    false,
  );
});
