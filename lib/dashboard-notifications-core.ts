import type { AppNotification } from "./notifications.ts";

type SupabaseLike = { from: (table: string) => any };

export type DashboardNotifications = {
  latest: AppNotification[];
  unreadCount: number;
};

/**
 * The bell needs the most recent entries while navigation needs the total
 * unread count. Keep these two distinct, concurrent reads in one resolver and
 * pass the resulting snapshot through the dashboard shell.
 */
export async function getDashboardNotifications(
  supabase: SupabaseLike,
  businessId: string,
): Promise<DashboardNotifications> {
  const [latestResult, unreadResult] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, business_id, type, title, message, is_read, created_at")
      .eq("business_id", businessId)
      .eq("type", "new_review")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("type", "new_review")
      .eq("is_read", false),
  ]);

  if (latestResult.error) {
    console.warn("Notifications lookup failed", latestResult.error);
  }

  return {
    latest: (latestResult.data ?? []) as AppNotification[],
    unreadCount: unreadResult.error ? 0 : unreadResult.count ?? 0,
  };
}
