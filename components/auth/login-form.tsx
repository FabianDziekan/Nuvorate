"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormField, FormMessage } from "@/components/auth/form-controls";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  nextPath = "/dashboard",
  initialError,
}: {
  nextPath?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState(initialError ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Nie udało się zalogować. Sprawdź e-mail i hasło.");
        return;
      }

      const safeNext =
        nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      router.push(safeNext);
      router.refresh();
    } catch {
      setError("Nie udało się połączyć z usługą logowania. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormMessage type="error">{error}</FormMessage>}
      <FormField
        label="Adres e-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="twoj@email.pl"
        required
      />
      <FormField
        label="Hasło"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Wpisz swoje hasło"
        required
        hint={
          <Link href="/forgot-password" className="font-medium text-brand hover:underline">
            Nie pamiętasz hasła?
          </Link>
        }
      />
      <button type="submit" disabled={loading} className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-65">
        {loading ? "Logowanie..." : "Zaloguj się"}
      </button>
      <p className="text-center text-sm text-black/50">
        Nie masz jeszcze konta?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Załóż konto
        </Link>
      </p>
    </form>
  );
}
