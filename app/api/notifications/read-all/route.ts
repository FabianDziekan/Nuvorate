import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessForUser } from "@/lib/active-business";

export async function PATCH() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = (await getActiveBusinessForUser(supabase, user.id, "id"))?.business;

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("business_id", business.id)
    .eq("type", "new_review")
    .eq("is_read", false);

  if (error) {
    console.error("Notifications mark all read failed", error);
    return NextResponse.json(
      { error: "Could not mark notifications as read" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
