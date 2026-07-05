import { createClient } from "@/lib/supabase/server";

export async function NotificationSidebarBadge({
  businessId,
}: {
  businessId: string;
}) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("is_read", false);

  if (error || !count) {
    return null;
  }

  return (
    <span className="notification-sidebar-badge ml-auto grid min-h-[20px] min-w-[20px] place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
