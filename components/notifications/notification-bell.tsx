import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import type { AppNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

export async function NotificationBell({ businessId }: { businessId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, business_id, type, title, message, is_read, created_at")
    .eq("business_id", businessId)
    .eq("type", "new_review")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.warn("Notifications lookup failed", error);
  }

  return (
    <NotificationDropdown
      initialNotifications={(data ?? []) as AppNotification[]}
    />
  );
}
