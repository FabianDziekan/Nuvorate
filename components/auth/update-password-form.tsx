"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormField, FormMessage } from "@/components/auth/form-controls";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Podane hasła nie są takie same.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("Nie udało się zmienić hasła. Otwórz ponownie link z wiadomości.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Nie udało się połączyć z usługą zmiany hasła.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormMessage type="error">{error}</FormMessage>}
      <FormField
        label="Nowe hasło"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Minimum 8 znaków"
        minLength={8}
        required
      />
      <FormField
        label="Powtórz nowe hasło"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        placeholder="Wpisz hasło ponownie"
        minLength={8}
        required
      />
      <button type="submit" disabled={loading} className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-65">
        {loading ? "Zapisywanie..." : "Ustaw nowe hasło"}
      </button>
    </form>
  );
}
