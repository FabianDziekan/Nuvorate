import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("Business routes contain server-side capability gates", () => {
  const authorPage = source("app/author-verification/page.tsx");
  assert.match(
    authorPage,
    /hasPlanCapability\(appPlan, "authorVerification"\)/,
  );
  assert.doesNotMatch(authorPage, /notFound\(\)/);
  assert.match(authorPage, /canVerifyAuthors\s*\?\s*await supabase/);
  assert.match(authorPage, /: \{ data: \[\], error: null \}/);
  assert.match(
    source("app/api/responses/auto-generate/route.ts"),
    /"automaticReviewResponses"/,
  );
  assert.match(
    source("app/api/responses/settings/route.ts"),
    /"automaticReviewResponses"/,
  );
  assert.match(
    source("app/api/responses/auto-generate/route.ts"),
    /status: 403/,
  );
});

test("Analysis data is projected by plan before rendering", () => {
  const analysisPage = source("app/analysis/page.tsx");
  assert.match(analysisPage, /projectAnalysisForPlan\(appPlan, analysis\)/);
  assert.match(analysisPage, /analysisProjection\?\.kind === "basic"/);
  assert.match(analysisPage, /createAdminClient\(\)/);
});

test("Reached Starter limit prevents the analysis action call in the form", () => {
  const form = source("components/dashboard/analysis-action-form.tsx");
  const dashboardCard = source(
    "components/dashboard/analysis-preview-card.tsx",
  );
  assert.match(form, /if \(isLimitReached\) \{\s*return;\s*\}/);
  assert.match(form, /disabled=\{isRunning \|\| isLimitReached\}/);
  assert.match(form, /Limit analiz wykorzystany/);
  assert.match(form, /isLimitReached && showLimitDetails/);
  assert.match(dashboardCard, /showLimitDetails=\{false\}/);
});

test("Context alert consumes ai_error without reloading", () => {
  const alert = source("components/dashboard/analysis-context-alert.tsx");
  assert.match(alert, /nextParams\.delete\("ai_error"\)/);
  assert.match(alert, /window\.history\.replaceState\(/);
  assert.match(alert, /10_000/);
});

test("Dashboard passes only the plan projection to its analysis card", () => {
  const dashboard = source("app/dashboard/page.tsx");
  const card = source("components/dashboard/analysis-preview-card.tsx");
  assert.match(
    dashboard,
    /dashboardAnalysis = latestAnalysis\s*\?\s*projectAnalysisForPlan/,
  );
  assert.match(dashboard, /analysis=\{dashboardAnalysis\}/);
  assert.doesNotMatch(
    dashboard,
    /<AnalysisPreviewCard[\s\S]*praisedElements=/,
  );
  assert.match(card, /analysis\.reputationScore/);
  assert.match(card, /analysis\.summary/);
  assert.match(card, /analysis\.strongestStrength/);
  assert.match(card, /analysis\.keyProblem/);
  assert.match(card, /analysis\.actionTip/);
  assert.doesNotMatch(card, /Zobacz analizę/);
});

test("Business navigation badge is a compact accessible lock", () => {
  const badge = source("components/billing/business-nav-badge.tsx");
  assert.match(badge, /aria-label="Dostępne w planie Business"/);
  assert.match(badge, /role="tooltip"/);
  assert.match(badge, /tabIndex=\{0\}/);
  assert.doesNotMatch(badge, />\s*Business\s*</);
});

test("Atomic limit migration serializes and can roll back reservations", () => {
  const migration = source(
    "docs/database/015_atomic_ai_usage_reservations.sql",
  );
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /for update/);
  assert.match(migration, /create or replace function public\.reserve_ai_usage/);
  assert.match(
    migration,
    /create or replace function public\.release_ai_usage_reservation/,
  );
  assert.match(migration, /greatest\(ai_replies_used - 1, 0\)/);
  assert.match(migration, /greatest\(ai_analyses_used - 1, 0\)/);
  assert.match(migration, /expires_at <= now\(\)/);
});

test("NFC scans can only be created by the public server redirect", () => {
  const migration = source("docs/database/016_nfc_tags_and_scans.sql");
  const route = source("app/r/[token]/route.ts");
  const dashboard = source("app/dashboard/page.tsx");
  assert.match(migration, /alter table public\.nfc_tags enable row level security/);
  assert.match(migration, /alter table public\.nfc_scans enable row level security/);
  assert.match(migration, /revoke insert, update, delete on public\.nfc_scans from authenticated/);
  assert.match(route, /\.eq\("is_active", true\)/);
  assert.match(route, /validateGoogleReviewUrl\(tag\.destination_url\)/);
  assert.match(route, /from\("nfc_scans"\)\.insert/);
  assert.match(route, /NextResponse\.redirect\(destinationUrl, 307\)/);
  assert.match(dashboard, /from\("nfc_scans"\)/);
  assert.match(dashboard, /value: \(nfcScans \?\? 0\)\.toLocaleString/);
});
