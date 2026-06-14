"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FormField, FormMessage } from "@/components/auth/form-controls";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (resetError) {
        setError("Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.");
        return;
      }

      setSuccess(
        "Jeśli konto z tym adresem istnieje, wysłaliśmy wiadomość z linkiem do zmiany hasła.",
      );
    } catch {
      setError("Nie udało się połączyć z usługą resetowania hasła.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormMessage type="error">{error}</FormMessage>}
      {success && <FormMessage type="success">{success}</FormMessage>}
      <FormField
        label="Adres e-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="twoj@email.pl"
        required
      />
      <button type="submit" disabled={loading} className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-65">
        {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
      </button>
      <p className="text-center text-sm text-black/50">
        Pamiętasz hasło?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
