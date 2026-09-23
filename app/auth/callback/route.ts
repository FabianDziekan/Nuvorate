import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PRODUCTION_APP_URL } from "@/lib/app-url";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // The PKCE verifier belongs to the callback host. Exchange first, then
      // require a fresh sign-in on www for any legacy link to another host.
      if (process.env.NODE_ENV === "production" && origin !== PRODUCTION_APP_URL) {
        const canonicalLogin = new URL("/login", PRODUCTION_APP_URL);
        canonicalLogin.searchParams.set("next", safeNext);
        canonicalLogin.searchParams.set("error", "Zaloguj się ponownie na www.nuvorate.pl.");
        const response = NextResponse.redirect(canonicalLogin);
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
        return response;
      }
      const response = NextResponse.redirect(`${origin}${safeNext}`);
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }
  }

  const response = NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Link logowania wygasł lub jest nieprawidłowy.",
    )}`,
  );
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
