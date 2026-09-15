import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/billing/",
        "/checkout",
        "/dashboard",
        "/reviews",
        "/analysis",
        "/responses",
        "/nfc",
        "/notifications",
        "/settings",
        "/support",
        "/login",
        "/register",
        "/forgot-password",
        "/update-password",
        "/onboarding",
        "/r/",
      ],
    },
    sitemap: "https://www.nuvorate.pl/sitemap.xml",
  };
}
