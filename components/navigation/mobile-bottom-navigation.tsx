import { createClient } from "@/lib/supabase/server";
import { MobileBottomNavigationClient } from "./mobile-bottom-navigation-client";

type MobileBottomNavigationProps = {
  businessId: string;
};

export async function MobileBottomNavigation({
  businessId,
}: MobileBottomNavigationProps) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("type", "new_review")
    .eq("is_read", false);

  return <MobileBottomNavigationClient unreadCount={count ?? 0} />;
}
