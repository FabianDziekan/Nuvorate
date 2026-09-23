import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { PlanPicker } from "@/components/billing/plan-picker";
import { CheckoutActivationStatus } from "@/components/billing/checkout-activation-status";
import { getDashboardRequestContext, getDashboardUser } from "@/lib/dashboard-request-context";
import { hasPaidAccess } from "@/lib/billing-access";
import { checkoutIntentQuery, parseCheckoutIntent } from "@/lib/checkout-intent";
import { hasPriceIdForPlan } from "@/lib/stripe";

export const metadata: Metadata = { title: "Aktywacja planu", robots: { index: false, follow: false } };

export default async function ActivatePage({ searchParams }: {
  searchParams: Promise<{ plan?: string; billing?: string; checkout?: string; error?: string }>;
}) {
  const params = await searchParams;
  const intent = parseCheckoutIntent(params.plan, params.billing ?? "monthly");
  const { data: { user } } = await getDashboardUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/activate${checkoutIntentQuery(intent)}`)}`);
  const { billingContext } = await getDashboardRequestContext(user.id);
  if (!billingContext) redirect(`/onboarding${checkoutIntentQuery(intent)}`);
  if (hasPaidAccess(billingContext.plan, billingContext.subscriptionStatus)) redirect("/dashboard");
  const canPurchase = billingContext.billingOwnerId === user.id;

  const availability = {
    monthly: { starter: hasPriceIdForPlan("starter", "monthly"), business: hasPriceIdForPlan("business", "monthly") },
    yearly: { starter: hasPriceIdForPlan("starter", "yearly"), business: hasPriceIdForPlan("business", "yearly") },
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7FA] px-5 py-12 text-ink">
      <section className="w-full max-w-5xl rounded-[32px] border border-black/[0.06] bg-white p-7 text-center shadow-card sm:p-10">
        <div className="flex justify-center"><BrandLogo /></div>
        {params.checkout === "success" ? <CheckoutActivationStatus /> : <>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">Aktywuj NuvoRate</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/50">
            {!canPurchase ? "Subskrypcję tej firmy może aktywować jej właściciel." : params.checkout === "cancel" ? "Płatność została anulowana. Możesz wybrać plan ponownie." : "Wybierz plan, aby rozpocząć korzystanie z NuvoRate."}
          </p>
          {params.error && <p role="alert" className="mt-4 text-sm text-red-600">Nie udało się rozpocząć płatności. Spróbuj ponownie.</p>}
          {canPurchase && intent && <a className="button-primary mx-auto mt-6 w-fit" href={`/checkout${checkoutIntentQuery(intent)}`}>Kontynuuj wybrany plan</a>}
          {canPurchase && <div className="mt-8"><PlanPicker checkoutAvailability={availability} /></div>}
        </>}
      </section>
    </main>
  );
}
