"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormField, FormMessage } from "@/components/auth/form-controls";
import { createClient } from "@/lib/supabase/client";

type Plan = "starter" | "business";

export function RegisterForm({ initialPlan = "starter" }: { initialPlan?: Plan }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            `/checkout?plan=${plan}`,
          )}`,
        },
      });

      if (signUpError) {
        setError(
          signUpError.message.toLowerCase().includes("already")
            ? "Konto z tym adresem e-mail już istnieje."
            : "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.",
        );
        return;
      }

      if (data.session) {
        router.push(`/checkout?plan=${plan}`);
        router.refresh();
        return;
      }

      setSuccess(
        "Konto zostało utworzone. Sprawdź skrzynkę e-mail i potwierdź adres, aby przejść do płatności.",
      );
    } catch {
      setError("Nie udało się połączyć z usługą rejestracji. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormMessage type="error">{error}</FormMessage>}
      {success && <FormMessage type="success">{success}</FormMessage>}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Wybierz plan</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "starter" as const, name: "Starter", price: "49,99 zł / mies." },
            { id: "business" as const, name: "Business", price: "229,99 zł / mies." },
          ].map((item) => {
            const selected = plan === item.id;
            return (
              <label
                key={item.id}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  selected
                    ? "border-brand bg-brand-soft ring-4 ring-brand/10"
                    : "border-black/10 hover:border-brand/30"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={item.id}
                  checked={selected}
                  onChange={() => setPlan(item.id)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{item.name}</span>
                  <span
                    className={`h-4 w-4 rounded-full border-4 ${
                      selected ? "border-brand bg-white" : "border-black/15"
                    }`}
                  />
                </span>
                <span className="mt-1 block text-xs text-black/45">{item.price}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

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
        autoComplete="new-password"
        placeholder="Minimum 8 znaków"
        minLength={8}
        required
      />
      <FormField
        label="Powtórz hasło"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        placeholder="Wpisz hasło ponownie"
        minLength={8}
        required
      />
      <button type="submit" disabled={loading || Boolean(success)} className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-65">
        {loading ? "Tworzenie konta..." : "Załóż konto"}
      </button>
      <p className="text-center text-sm text-black/50">
        Masz już konto?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
