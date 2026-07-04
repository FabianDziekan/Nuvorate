"use client";

import Link from "next/link";
import { useState } from "react";
import {
  billingCycles,
  pricingPlans,
  type BillingCycle,
  type PricingPlanId,
} from "@/lib/pricing";

type CheckoutAvailability = Record<BillingCycle, Record<PricingPlanId, boolean>>;

const defaultCheckoutAvailability: CheckoutAvailability = {
  monthly: {
    business: true,
    starter: true,
  },
  yearly: {
    business: true,
    starter: true,
  },
};

export function PlanPicker({
  checkoutAvailability = defaultCheckoutAvailability,
}: {
  checkoutAvailability?: CheckoutAvailability;
}) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const isYearly = billingCycle === "yearly";

  return (
    <div>
      <div className="mx-auto flex w-fit rounded-full border border-black/[0.08] bg-white p-1 shadow-sm">
        {billingCycles.map((cycle) => {
          const active = billingCycle === cycle.id;

          return (
            <button
              key={cycle.id}
              type="button"
              onClick={() => setBillingCycle(cycle.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-brand text-white shadow-sm"
                  : "text-black/55 hover:bg-black/[0.04] hover:text-black"
              }`}
              aria-pressed={active}
            >
              {cycle.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {pricingPlans.map((plan) => {
          const price = plan.prices[billingCycle];
          const yearlyPrice = isYearly ? plan.prices.yearly : null;
          const checkoutEnabled = checkoutAvailability[billingCycle][plan.id];
          const isBusiness = plan.id === "business";
          const featuredBadge =
            "featuredBadge" in plan ? plan.featuredBadge : null;

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[28px] p-6 text-left shadow-card sm:p-7 ${
                isBusiness
                  ? "overflow-hidden bg-ink text-white"
                  : "border border-black/[0.08] bg-white text-ink"
              }`}
            >
              {isBusiness && (
                <div className="absolute right-0 top-0 h-44 w-44 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
              )}
              <div className="relative flex flex-1 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p
                    className={`text-sm font-semibold ${
                      isBusiness ? "text-[#A6A7FF]" : "text-brand"
                    }`}
                  >
                    {plan.title}
                  </p>
                  {(isYearly || featuredBadge) && (
                    <span
                      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                        isBusiness
                          ? "bg-brand text-white"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      {isYearly ? "Najlepsza wartość" : featuredBadge}
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  {plan.subtitle}
                </h2>
                <p
                  className={`mt-3 min-h-12 text-sm leading-6 ${
                    isBusiness ? "text-white/55" : "text-black/50"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                    {price.price}
                  </span>
                  <span
                    className={`pb-1 text-sm ${
                      isBusiness ? "text-white/45" : "text-black/40"
                    }`}
                  >
                    {price.period}
                  </span>
                </div>

                {isYearly && (
                  <div className="mt-4 space-y-1 text-sm">
                    <p className={isBusiness ? "text-white/75" : "text-black/70"}>
                      {yearlyPrice?.monthlyEquivalent}
                    </p>
                    <p className={isBusiness ? "text-[#A6A7FF]" : "text-brand"}>
                      {yearlyPrice?.saving}
                    </p>
                  </div>
                )}

                <div
                  className={`my-7 h-px ${
                    isBusiness ? "bg-white/10" : "bg-black/[0.07]"
                  }`}
                />

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex gap-3 text-sm ${
                        isBusiness ? "text-white/75" : "text-black/70"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          isBusiness
                            ? "bg-brand text-white"
                            : "bg-brand-soft text-brand"
                        }`}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {checkoutEnabled ? (
                  <Link
                    href={price.href}
                    className={`mt-8 w-full justify-center ${
                      isBusiness ? "button-primary" : "button-secondary"
                    }`}
                  >
                    Wybierz {plan.name}
                  </Link>
                ) : (
                  <div className="mt-8">
                    <button
                      type="button"
                      disabled
                      className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold opacity-55 ${
                        isBusiness
                          ? "bg-white/15 text-white"
                          : "border border-black/10 bg-black/[0.03] text-black/45"
                      }`}
                    >
                      Wybierz {plan.name}
                    </button>
                    <p
                      className={`mt-3 text-center text-xs leading-5 ${
                        isBusiness ? "text-white/50" : "text-black/45"
                      }`}
                    >
                      Ten wariant rozliczenia nie jest jeszcze skonfigurowany.
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
