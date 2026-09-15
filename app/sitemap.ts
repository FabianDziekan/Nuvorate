import type { MetadataRoute } from "next";

const siteUrl = "https://www.nuvorate.pl";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/privacy` },
    { url: `${siteUrl}/terms` },
    { url: `${siteUrl}/cookies` },
  ];
}
