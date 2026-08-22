import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const responsesPage = readFileSync(
  join(process.cwd(), "app/responses/page.tsx"),
  "utf8",
);
const responseCard = readFileSync(
  join(process.cwd(), "components/responses/response-card.tsx"),
  "utf8",
);
const mobileFilters = readFileSync(
  join(process.cwd(), "components/responses/mobile-response-filters.tsx"),
  "utf8",
);

test("responses filters use management-oriented labels consistently", () => {
  assert.match(responsesPage, /label: "Wszystkie opinie", value: "all"/);
  assert.match(responsesPage, /label: "Do odpowiedzi", value: "pending"/);
  assert.match(responsesPage, /label: "Odpowiedziano", value: "answered"/);
  assert.match(mobileFilters, /"Wszystkie opinie"/);
});

test("response card keeps direct editing and removes the separate manual-writing action", () => {
  assert.doesNotMatch(responseCard, /Napisz ręcznie/);
  assert.doesNotMatch(responseCard, /Zapisywanie\.\.\.|>\s*Zapisz\s*</);
  assert.match(responseCard, /<textarea[\s\S]*?value=\{responseText\}[\s\S]*?onChange=/);
  assert.match(responseCard, /Wygeneruj ponownie/);
  assert.match(responseCard, />\s*Kopiuj\s*</);
});

test("response card exposes draft, AI-ready and publication placeholder states", () => {
  assert.match(responseCard, /label: "Wersja robocza"/);
  assert.match(responseCard, /label: "Gotowa odpowiedź AI"/);
  assert.match(responseCard, /label: "Opublikowano w Google"/);
  assert.match(responseCard, /getStatusDetails/);
  assert.match(responseCard, /Opublikuj w Google/);
  assert.match(responseCard, /setPublishedAt\(new Date\(\)\.toISOString\(\)\)/);
});

test("response generation surfaces the configured response tone through settings", () => {
  assert.match(responsesPage, /select\("auto_generate, enabled_ratings, response_tone"\)/);
  assert.match(responsesPage, /responseTone=\{responseTone\}/);
  assert.match(responseCard, /Ton odpowiedzi:/);
  assert.match(responseCard, /href="\/settings"/);
});
