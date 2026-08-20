import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const manualResponseRoute = readFileSync(
  join(process.cwd(), "app/api/responses/[id]/route.ts"),
  "utf8",
);
const respondedRoute = readFileSync(
  join(process.cwd(), "app/api/responses/[id]/responded/route.ts"),
  "utf8",
);
const responseActions = readFileSync(
  join(process.cwd(), "app/responses/actions.ts"),
  "utf8",
);

function expectsActiveReviewScope(source: string) {
  assert.match(source, /requireActiveBusinessForUser\([\s\S]*?"id",[\s\S]*?"manage"/);
  assert.match(
    source,
    /\.eq\("id", (?:id|reviewId)\)[\s\S]*?\.eq\("business_id", activeBusiness\.business\.id\)/,
  );
}

test("manual response API allows a mutation only for a review in the active managed location", () => {
  expectsActiveReviewScope(manualResponseRoute);
  assert.match(manualResponseRoute, /if \(error \|\| !data\)/);
  assert.doesNotMatch(manualResponseRoute, /active_business_id/);
});

test("responded-status API allows a mutation only for a review in the active managed location", () => {
  expectsActiveReviewScope(respondedRoute);
  assert.match(respondedRoute, /if \(error \|\| !data\)/);
  assert.doesNotMatch(respondedRoute, /active_business_id/);
});

test("server actions scope every response mutation to the active managed location", () => {
  expectsActiveReviewScope(responseActions);
  assert.match(responseActions, /const \{ data: updatedReview, error \}/);
  assert.match(responseActions, /if \(error \|\| !updatedReview\)/);
  assert.match(
    responseActions,
    /requireRequestedActiveBusiness\([\s\S]*?businessId,[\s\S]*?"manage"/,
  );
  assert.match(responseActions, /business_id: activeBusiness\.business\.id/);
  assert.doesNotMatch(responseActions, /active_business_id/);
});

test("the response module has no review mutation keyed only by review id", () => {
  for (const source of [manualResponseRoute, respondedRoute, responseActions]) {
    const reviewUpdates = source.match(/\.from\("reviews"\)[\s\S]*?\.update\([\s\S]*?(?=\n\s*if \(|\n\s*revalidatePath|\n\s*return)/g) ?? [];
    for (const update of reviewUpdates) {
      assert.match(update, /\.eq\("business_id", activeBusiness\.business\.id\)/);
    }
  }
});
