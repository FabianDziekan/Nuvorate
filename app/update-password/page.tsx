import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = {
  title: "Nowe hasło | NuvoRate",
};

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      eyebrow="Nowe hasło"
      title="Ustaw nowe hasło"
      description="Wybierz bezpieczne hasło, którego nie używasz w innych serwisach."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
