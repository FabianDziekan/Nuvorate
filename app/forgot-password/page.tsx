import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset hasła | NuvoRate",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Odzyskaj dostęp"
      title="Zresetuj hasło"
      description="Podaj adres e-mail konta. Wyślemy bezpieczny link umożliwiający ustawienie nowego hasła."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
