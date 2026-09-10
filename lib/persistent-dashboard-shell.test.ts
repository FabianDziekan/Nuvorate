import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shell = readFileSync("components/dashboard/dashboard-shell.tsx", "utf8");
const layout = readFileSync("app/(dashboard)/layout.tsx", "utf8");
const routes = ["dashboard", "reviews", "analysis", "responses", "nfc", "notifications", "settings", "support"];

test("route group has one persistent dashboard shell while public URLs stay unchanged", () => {
  assert.match(layout, /<DashboardShell>\{children\}<\/DashboardShell>/);
  assert.match(shell, /fixed inset-y-0 left-0/);
  assert.match(shell, /dashboard-topbar z-20 shrink-0/);
  assert.match(shell, /<DashboardShellScrollArea>\{children\}<\/DashboardShellScrollArea>/);
  assert.match(shell, /<MobileBottomNavigation key=\{business.id\}/);
  assert.match(shell, /<DesktopBusinessSwitcher/);
  for (const route of routes) {
    assert.ok(readFileSync(`app/(dashboard)/${route}/page.tsx`, "utf8"));
    assert.doesNotMatch(route, /\(dashboard\)/);
  }
});

test("pages retain content only; shell chrome is not duplicated", () => {
  for (const route of routes) {
    const page = readFileSync(`app/(dashboard)/${route}/page.tsx`, "utf8");
    assert.doesNotMatch(page, /<aside className="fixed inset-y-0 left-0/);
    assert.doesNotMatch(page, /<header className="dashboard-topbar/);
    assert.doesNotMatch(page, /<MobileBottomNavigation/);
    assert.doesNotMatch(page, /<DesktopBusinessSwitcher/);
    assert.doesNotMatch(page, /<NotificationBell/);
  }
});

test("every route retains its page-specific content after shell extraction", () => {
  const expected = {
    dashboard: /Podsumowanie reputacji firmy/,
    reviews: /Wszystkie opinie firmy/,
    analysis: /Analiza reputacji/,
    responses: /Zarządzaj odpowiedziami/,
    nfc: /Zarządzaj linkiem do opinii/,
    notifications: /Centrum zdarzeń/,
    settings: /Ustawienia/,
    support: /Pomoc i kontakt/,
  } as const;
  for (const [route, marker] of Object.entries(expected)) {
    assert.match(readFileSync(`app/(dashboard)/${route}/page.tsx`, "utf8"), marker);
  }
});

test("persistent shell uses the request-scoped context and keys notification state by active business", () => {
  assert.match(shell, /getDashboardRequestContext\(user.id\)/);
  assert.match(shell, /<NotificationBell key=\{business.id\}/);
  assert.match(shell, /<MobileBottomNavigation key=\{business.id\}/);
  assert.match(shell, /dashboardContext=\{dashboardContext\}/);
});

test("topbar stays outside the only scroll container and route changes reset only that container", () => {
  const client = readFileSync("components/dashboard/dashboard-shell-client.tsx", "utf8");
  assert.match(shell, /<main className="h-dvh overflow-hidden/);
  assert.match(shell, /flex h-dvh min-w-0 flex-col/);
  assert.ok(shell.indexOf("<header") < shell.indexOf("<DashboardShellScrollArea>"));
  assert.match(client, /data-dashboard-scroll-container/);
  assert.match(client, /overflow-y-auto/);
  assert.match(client, /if \(previousPathname\.current === pathname\) return;/);
  assert.match(client, /scrollAreaRef\.current\?\.scrollTo\(\{ top: 0, behavior: "auto" \}\)/);
});

test("page loading boundaries render content skeletons, not a second shell", () => {
  for (const route of routes) {
    const loading = readFileSync(`app/(dashboard)/${route}/loading.tsx`, "utf8");
    assert.match(loading, /DashboardContentSkeleton/);
    assert.doesNotMatch(loading, /DashboardShell|<aside|dashboard-topbar/);
  }
});
