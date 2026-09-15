import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Załóż konto",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const initialPlan = params.plan === "business" ? "business" : "starter";

  return (
    <AuthShell
      eyebrow="Rozpocznij z NuvoRate"
      title="Załóż konto"
      description="Wybierz plan i utwórz konto. Plakietki NFC pozostają opcjonalnym dodatkiem."
    >
      <RegisterForm initialPlan={initialPlan} />
    </AuthShell>
  );
}
