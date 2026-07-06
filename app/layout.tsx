import type { Metadata } from "next";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "NuvoRate - Więcej opinii. Większe zaufanie.",
  description:
    "Zbieraj opinie, monitoruj reputację i szybciej reaguj na głos klientów z NuvoRate.",
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
      <body>{children}</body>
    </html>
  );
}
