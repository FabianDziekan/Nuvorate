import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessForUser } from "@/lib/active-business";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
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
    .eq("id", id)
    .eq("business_id", business.id)
    .eq("type", "new_review");

  if (error) {
    console.error("Notification mark read failed", error);
    return NextResponse.json(
      { error: "Could not mark notification as read" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
