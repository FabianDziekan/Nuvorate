import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalRedirectUrl, PRODUCTION_APP_URL, resolveAppUrl } from "./app-url.ts";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("production auth and payment use the canonical www origin", () => {
  assert.equal(resolveAppUrl({ production: true, browserOrigin: "https://nuvorate.vercel.app", configuredUrl: "https://nuvorate.pl" }), PRODUCTION_APP_URL);
  assert.match(source("components/auth/register-form.tsx"), /emailRedirectTo: `\$\{getAppUrl\(\)\}\/auth\/callback\?next=/);
  assert.match(source("components/auth/forgot-password-form.tsx"), /redirectTo: `\$\{getAppUrl\(\)\}\/auth\/callback/);
  assert.match(source("lib/stripe.ts"), /success_url", `\$\{appUrl\}\/activate\?checkout=success`/);
  assert.match(source("lib/stripe.ts"), /cancel_url", `\$\{appUrl\}\/activate\?checkout=cancel/);
  assert.match(source("lib/stripe.ts"), /import \{ getAppUrl \} from "@\/lib\/app-url"/);
});

test("normal technical and apex URLs redirect once, retaining path and query", () => {
  for (const host of ["nuvorate.vercel.app", "nuvorate.pl"]) {
    const destination = canonicalRedirectUrl(`https://${host}/register?plan=business&billing=monthly`, true);
    assert.equal(destination?.href, "https://www.nuvorate.pl/register?plan=business&billing=monthly");
  }
  assert.equal(canonicalRedirectUrl("https://www.nuvorate.pl/register", true), null);
  assert.equal(canonicalRedirectUrl("http://localhost:3000/register", true), null);
});

test("PKCE callback stays on its arrival host until code exchange", () => {
  assert.equal(canonicalRedirectUrl("https://nuvorate.vercel.app/auth/callback?code=opaque", true), null);
  const callback = source("app/auth/callback/route.ts");
  assert.ok(callback.indexOf("exchangeCodeForSession(code)") < callback.indexOf("origin !== PRODUCTION_APP_URL"));
  assert.match(callback, /const next = searchParams\.get\("next"\) \?\? "\/dashboard"/);
  assert.match(callback, /NextResponse\.redirect\(`\$\{origin\}\$\{safeNext\}`\)/);
});

test("development keeps the local origin", () => {
  assert.equal(resolveAppUrl({ production: false, browserOrigin: "http://localhost:3000" }), "http://localhost:3000");
  assert.equal(resolveAppUrl({ production: false, configuredUrl: "http://localhost:3000/" }), "http://localhost:3000");
  assert.equal(canonicalRedirectUrl("http://localhost:3000/register", false), null);
  const middleware = source("middleware.ts");
  assert.match(middleware, /canonicalRedirectUrl\(\s*request\.url/);
  assert.match(middleware, /NextResponse\.redirect\(canonicalUrl, 308\)/);
});
