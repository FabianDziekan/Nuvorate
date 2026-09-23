import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { canonicalRedirectUrl } from "@/lib/app-url";

export async function middleware(request: NextRequest) {
  const canonicalUrl = canonicalRedirectUrl(
    request.url,
    process.env.NODE_ENV === "production",
  );
  if (canonicalUrl) return NextResponse.redirect(canonicalUrl, 308);

  const pathname = request.nextUrl.pathname;
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/")
  ) {
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api/|_next/|favicon.ico|.*\\..*).*)"],
};
