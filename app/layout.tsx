import type { Metadata } from "next";
import { AppThemeScope } from "@/components/theme/app-theme-scope";
import { ThemeScript } from "@/components/theme/theme-script";
import { CookieBanner } from "@/components/legal/cookie-banner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nuvorate.pl"),
  title: {
    default: "NuvoRate – zarządzanie opiniami Google dla lokalnych firm",
    template: "%s | NuvoRate",
  },
  description:
    "NuvoRate pomaga lokalnym firmom monitorować opinie Google, odpowiadać na nie szybciej, analizować reputację i zbierać więcej recenzji.",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "NuvoRate",
    url: "/",
    title: "NuvoRate – zarządzanie opiniami Google dla lokalnych firm",
    description:
      "NuvoRate pomaga lokalnym firmom monitorować opinie Google, odpowiadać na nie szybciej, analizować reputację i zbierać więcej recenzji.",
  },
  twitter: {
    card: "summary",
    title: "NuvoRate – zarządzanie opiniami Google dla lokalnych firm",
    description:
      "NuvoRate pomaga lokalnym firmom monitorować opinie Google, odpowiadać na nie szybciej, analizować reputację i zbierać więcej recenzji.",
  },
  icons: {
    apple: "/brand/nuvorate-logo.png",
    icon: "/brand/nuvorate-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppThemeScope />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
