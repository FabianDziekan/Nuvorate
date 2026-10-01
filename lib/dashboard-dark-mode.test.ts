import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all dashboard routes, including support, restore the saved dark preference on load and navigation", () => {
  const initialTheme = source("components/theme/theme-script.tsx");
  const routeTheme = source("components/theme/app-theme-scope.tsx");
  for (const route of ["dashboard", "reviews", "analysis", "responses", "nfc", "notifications", "settings", "support"]) {
    assert.match(initialTheme, new RegExp(`"/${route}"`));
    assert.match(routeTheme, new RegExp(`"/${route}"`));
  }
  assert.match(initialTheme, /isAppRoute && window\.localStorage\.getItem\("nuvorate-theme"\) === "dark"/);
  assert.match(routeTheme, /isAppThemePath\(pathname\)/);
});

test("billing and monthly goal progress share a visible dark-mode track without changing their fill", () => {
  const css = source("app/globals.css");
  for (const component of ["components/billing/ai-usage-card.tsx", "components/dashboard/monthly-goal-card.tsx"]) {
    const content = source(component);
    assert.match(content, /dashboard-progress-track/);
    assert.match(content, /h-full rounded-full bg-brand/);
  }
  assert.match(css, /html\.dark \.dashboard-progress-track\s*\{\s*background-color: rgba\(247, 247, 250, 0\.16\)/);
});

test("support keeps its existing form and receives dark controls through the shared theme", () => {
  const form = source("components/support/support-form.tsx");
  const css = source("app/globals.css");
  for (const control of ["select", "input", "textarea"]) {
    assert.match(form, new RegExp(`<${control} `));
    assert.match(css, new RegExp(`html\\.dark ${control}`));
  }
  assert.match(css, /html\.dark \.bg-white\s*\{/);
  assert.match(css, /html\.dark \[class\*="text-black\/"\]/);
});
