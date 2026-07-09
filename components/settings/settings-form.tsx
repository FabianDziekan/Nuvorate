"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings } from "@/app/settings/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type SettingsFormProps = {
  business: {
    industry: string;
    name: string;
  };
  firstName: string;
  responseTone: string;
};

const responseToneOptions = [
  { label: "Profesjonalny", value: "professional" },
  { label: "Przyjazny", value: "friendly" },
  { label: "Krótki", value: "short" },
  { label: "Premium", value: "premium" },
];

const initialState = {
  ok: false,
  error: "",
  message: "",
};

export function SettingsForm({
  business,
  firstName,
  responseTone,
}: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveSettings,
    initialState,
  );
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    setToast(state.message || "Ustawienia zapisane");
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {toast && (
        <div className="rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand shadow-sm">
          {toast}
        </div>
      )}

      {state?.error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">
          {state.error}
        </div>
      )}

      <ThemeToggle />

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
            Konto
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Dane właściciela
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-black/45">
            Imię wykorzystujemy w powitaniu i elementach konta, aby panel był
            bardziej osobisty.
          </p>
        </div>

        <label className="mt-6 block max-w-md space-y-2">
          <span className="text-xs font-semibold text-black/45">Imię</span>
          <input
            name="firstName"
            defaultValue={firstName}
            className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10"
            maxLength={40}
            minLength={2}
            placeholder="Fabian"
            required
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
            Profil firmy
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Dane widoczne w NuvoRate
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-black/45">
            Te informacje pomagają dopasować panel, odpowiedzi i przyszłe
            automatyzacje do Twojej firmy.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold text-black/45">Nazwa firmy</span>
            <input
              name="name"
              defaultValue={business.name}
              className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold text-black/45">Branża</span>
            <input
              name="industry"
              defaultValue={business.industry}
              className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">
          Styl odpowiedzi
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Domyślny ton komunikacji
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
          Wybrany styl będzie domyślnie używany podczas generowania odpowiedzi
          na opinie. Możesz go zmienić w dowolnym momencie.
        </p>
        <label className="mt-5 block max-w-md space-y-2">
          <span className="text-xs font-semibold text-black/45">
            Preferowany styl
          </span>
          <select
            name="responseTone"
            defaultValue={responseTone}
            className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10"
          >
            {responseToneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-[#4D4EE8] disabled:cursor-wait disabled:opacity-65"
        >
          {isPending ? "Zapisywanie..." : "Zapisz ustawienia"}
        </button>
      </div>
    </form>
  );
}
