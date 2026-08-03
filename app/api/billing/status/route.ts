import { NextResponse } from "next/server";
import { isPaidPlan, normalizePlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

const activeSubscriptionStatuses = ["active", "trialing"];

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "plan, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Billing status profile lookup failed", {
      message: profileError.message,
      userId: user.id,
    });

    return NextResponse.json(
      { error: "Nie udało się odczytać statusu subskrypcji." },
      { status: 500 },
    );
  }

  const plan = normalizePlan(profile?.plan);
  const subscriptionStatus = profile?.subscription_status ?? null;
  const isActivated =
    isPaidPlan(plan) &&
    activeSubscriptionStatuses.includes(subscriptionStatus ?? "");

  return NextResponse.json(
    {
      current_period_end: profile?.current_period_end ?? null,
      isActivated,
      plan,
      stripe_customer_id: profile?.stripe_customer_id ?? null,
      stripe_subscription_id: profile?.stripe_subscription_id ?? null,
      subscription_status: subscriptionStatus,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
