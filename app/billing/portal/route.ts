import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { createStripePortalSession, getAppUrl } from "@/lib/stripe";
import { billingPortalGet, billingPortalPost } from "@/lib/billing-portal";

export function GET() {
  return billingPortalGet(getAppUrl());
}

export async function POST(request: Request) {
  // Reject cross-origin requests before session/DB work.
  let client: Awaited<ReturnType<typeof createClient>>;
  return billingPortalPost(request, getAppUrl(), {
    async getUser() {
      client = await createClient();
      const { data, error } = await client.auth.getUser();
      return error ? null : data.user;
    },
    getBillingContext: userId => getActiveBusinessBillingContext(client, userId, "id"),
    async getCustomerId(userId) {
      const { data, error } = await client.from("profiles")
        .select("stripe_customer_id").eq("user_id", userId).maybeSingle();
      if (error) throw new Error("Profile unavailable");
      return data?.stripe_customer_id ?? null;
    },
    createPortal: createStripePortalSession,
  });
}
