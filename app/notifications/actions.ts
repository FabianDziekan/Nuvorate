"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/notifications");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    throw new Error("Nie udało się odczytać firmy.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("business_id", business.id)
    .eq("type", "new_review")
    .eq("is_read", false);

  if (error) {
    throw new Error("Nie udało się oznaczyć powiadomień jako przeczytane.");
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function clearNotificationHistory() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/notifications");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    throw new Error("Nie udało się odczytać firmy.");
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("notifications")
    .delete()
    .eq("business_id", business.id);

  if (error) {
    console.error("Notification history clear failed", error);
    throw new Error("Nie udało się wyczyścić historii powiadomień.");
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
