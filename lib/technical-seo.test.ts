import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rootLayout = readFileSync("app/layout.tsx", "utf8");
const homepage = readFileSync("app/page.tsx", "utf8");
const homepageClient = readFileSync("components/landing/home-page.tsx", "utf8");
const landingTranslations = readFileSync("lib/landing-translations.ts", "utf8");
const robots = readFileSync("app/robots.ts", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const dashboardLayout = readFileSync("app/(dashboard)/layout.tsx", "utf8");
const nfcRedirect = readFileSync("app/r/[token]/route.ts", "utf8");

test("landing images have alt text, including empty alt for repeated logos", () => {
  const landingSources = [homepageClient, readFileSync("components/dashboard/dashboard-demo.tsx", "utf8")];
  const images = landingSources.flatMap((source) => source.match(/<img\b[\s\S]*?\/>/g) ?? []);
  assert.ok(images.length > 0);
  for (const image of images) {
    assert.match(image, /\balt="[^"]*"/);
    if (image.includes("/brand/nuvorate-logo.png")) {
      assert.match(image, /\balt=""/);
    }
  }
  assert.match(homepageClient, /alt="Mobilny pulpit NuvoRate z podsumowaniem opinii, oceną i wykresem nowych recenzji"/);
  assert.match(homepageClient, /<a href="#top"[^>]*aria-label="NuvoRate"/);
});

test("landing identifies its SaaS provider and links canonical structured data entities", () => {
  assert.match(homepageClient, /NuvoRate to platforma SaaS[^<]+CONNECTON sp\. z o\.o\./);
  assert.match(homepageClient, /const siteUrl = "https:\/\/www\.nuvorate\.pl\/"/);
  for (const fragment of ["organization", "brand", "website", "software"]) {
    assert.match(homepageClient, new RegExp("`\\$\\{siteUrl\\}#" + fragment + "`"));
  }
  assert.match(homepageClient, /brand: \{ "@id": brandId \}/);
  assert.match(homepageClient, /publisher: \{ "@id": organizationId \}/);
  assert.match(homepageClient, /about: \{ "@id": softwareId \}/);
  assert.match(homepageClient, /provider: \{ "@id": organizationId \}/);
});

test("public metadata uses the canonical production host and social metadata", () => {
  assert.match(rootLayout, /metadataBase: new URL\("https:\/\/www\.nuvorate\.pl"\)/);
  assert.match(rootLayout, /template: "%s \| NuvoRate"/);
  assert.match(rootLayout, /openGraph:/);
  assert.match(rootLayout, /twitter:/);
  assert.match(homepage, /canonical: "\/"/);
  assert.match(landingTranslations, /centrum zarządzania opiniami Google/);
  assert.match(homepageClient, /application\/ld\+json/);
});

test("sitemap exposes only intended public pages", () => {
  for (const pathname of ["/", "/privacy", "/terms", "/cookies"]) {
    assert.match(sitemap, new RegExp(`\\$\\{siteUrl\\}${pathname === "/" ? "\\/" : pathname}`));
  }
  for (const privatePath of ["/dashboard", "/reviews", "/login", "/api/"]) {
    assert.doesNotMatch(sitemap, new RegExp(privatePath.replace("/", "\\/")));
  }
});

test("robots blocks technical paths without blocking Next.js rendering assets", () => {
  assert.match(robots, /sitemap: "https:\/\/www\.nuvorate\.pl\/sitemap\.xml"/);
  for (const pathname of ["/api/", "/dashboard", "/login", "/r/"]) {
    assert.match(robots, new RegExp(`"${pathname.replace("/", "\\/")}`));
  }
  assert.doesNotMatch(robots, /_next/);
});

test("private app pages and NFC redirects are explicitly noindex", () => {
  assert.match(dashboardLayout, /robots: \{ index: false, follow: false \}/);
  assert.match(nfcRedirect, /X-Robots-Tag": "noindex, nofollow"/);
  assert.match(nfcRedirect, /NextResponse\.redirect\(destinationUrl, 307\)/);
});

test("legal pages have distinct canonical metadata", () => {
  for (const [file, canonical] of [
    ["app/privacy/page.tsx", "/privacy"],
    ["app/terms/page.tsx", "/terms"],
    ["app/cookies/page.tsx", "/cookies"],
  ]) {
    const page = readFileSync(file, "utf8");
    assert.match(page, new RegExp(`canonical: "${canonical}"`));
    assert.match(page, /robots: \{ index: true, follow: true \}/);
  }
});
