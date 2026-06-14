import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Logowanie | NuvoRate",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Witaj ponownie"
      title="Zaloguj się"
      description="Przejdź do dashboardu i sprawdź najnowsze informacje o reputacji swojej firmy."
    >
      <LoginForm nextPath={params.next} initialError={params.error} />
    </AuthShell>
  );
}
