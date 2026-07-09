import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType = "new_review";

export type AppNotification = {
  id: string;
  business_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

export async function createNotification({
  businessId,
  type,
  title,
  message,
  dedupeMinutes = 5,
}: {
  businessId: string;
  type: NotificationType;
  title: string;
  message?: string;
  dedupeMinutes?: number;
}) {
  const supabaseAdmin = createAdminClient();
  const dedupeSince = new Date(Date.now() - dedupeMinutes * 60 * 1000).toISOString();

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("notifications")
    .select("id")
    .eq("business_id", businessId)
    .eq("type", type)
    .eq("title", title)
    .gte("created_at", dedupeSince)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.warn("Notification dedupe lookup failed", lookupError);
  }

  if (existing?.id) {
    return;
  }

  const { error } = await supabaseAdmin.from("notifications").insert({
    business_id: businessId,
    message: message ?? null,
    title,
    type,
  });

  if (error) {
    console.warn("Notification insert failed", error);
  }
}
