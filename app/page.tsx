import type { Metadata } from "next";
import { HomePage } from "@/components/landing/home-page";

export const metadata: Metadata = {
  title: {
    absolute: "NuvoRate – zarządzanie opiniami Google dla lokalnych firm",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    url: "/",
  },
};

export default function Home() {
  return <HomePage />;
}
