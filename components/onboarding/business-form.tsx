"use client";

import { useActionState } from "react";
import { createBusiness } from "@/app/onboarding/actions";
import { initialOnboardingState } from "@/app/onboarding/state";
import type { CheckoutIntent } from "@/lib/checkout-intent";

const industries = [
  "Restauracja i gastronomia",
  "Salon beauty",
  "Barber",
  "Hotel i noclegi",
  "Firma usługowa",
  "Inna branża",
];

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs font-medium text-red-600">{message}</p>;
}

export function BusinessForm({ intent }: { intent: CheckoutIntent | null }) {
  const [state, formAction, pending] = useActionState(
    createBusiness,
    initialOnboardingState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="plan" value={intent?.plan ?? ""} />
      <input type="hidden" name="billing" value={intent?.billing ?? ""} />
      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.error}
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Nazwa firmy
        </span>
        <input
          name="name"
          type="text"
          autoComplete="organization"
          placeholder="np. Restauracja Nova"
          required
          aria-invalid={Boolean(state.fieldErrors?.name)}
          className="h-[52px] w-full rounded-2xl border border-black/10 bg-white px-4 text-base text-ink outline-none transition placeholder:text-black/25 focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <FieldError message={state.fieldErrors?.name} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">Branża</span>
        <select
          name="industry"
          defaultValue=""
          required
          aria-invalid={Boolean(state.fieldErrors?.industry)}
          className="h-[52px] w-full appearance-none rounded-2xl border border-black/10 bg-white px-4 text-base text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
        >
          <option value="" disabled>
            Wybierz branżę
          </option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.industry} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">Miasto</span>
        <input
          name="city"
          type="text"
          autoComplete="address-level2"
          placeholder="np. Warszawa"
          required
          aria-invalid={Boolean(state.fieldErrors?.city)}
          className="h-[52px] w-full rounded-2xl border border-black/10 bg-white px-4 text-base text-ink outline-none transition placeholder:text-black/25 focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <FieldError message={state.fieldErrors?.city} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? "Zapisywanie firmy..." : "Zapisz i przejdź dalej"}
      </button>
    </form>
  );
}
