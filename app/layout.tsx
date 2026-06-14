import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NuvoRate - Więcej opinii. Większe zaufanie.",
  description:
    "Zbieraj opinie, monitoruj reputację i szybciej reaguj na głos klientów z NuvoRate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
