import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { parseCheckoutIntent } from "@/lib/checkout-intent";

export const metadata: Metadata = {
  title: "Załóż konto",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; billing?: string }>;
}) {
  const params = await searchParams;
  const initialIntent = parseCheckoutIntent(params.plan, params.billing ?? "monthly");

  return (
    <AuthShell
      eyebrow="Rozpocznij z NuvoRate"
      title="Załóż konto"
      description="Wybierz plan i utwórz konto. Plakietki NFC pozostają opcjonalnym dodatkiem."
    >
      <RegisterForm initialIntent={initialIntent} />
    </AuthShell>
  );
}
