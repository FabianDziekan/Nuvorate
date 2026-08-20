import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessForUser } from "@/lib/active-business";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const responseText = body?.responseText;

    if (typeof responseText !== "string" || !responseText.trim()) {
      return NextResponse.json(
        { error: "Wpisz treść odpowiedzi przed zapisem." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    let activeBusiness;
    try {
      activeBusiness = await requireActiveBusinessForUser(
        supabase,
        user.id,
        "id",
        "manage",
      );
    } catch {
      return NextResponse.json(
        { error: "Nie udało się zapisać odpowiedzi." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({
        response_status: "ready",
        response_text: responseText.trim(),
      })
      .eq("id", id)
      .eq("business_id", activeBusiness.business.id)
      .select("response_status, response_text")
      .maybeSingle();

    if (error || !data) {
      console.error("Response update API failed", error);
      return NextResponse.json(
        { error: "Nie udało się zapisać odpowiedzi." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      responseText: data.response_text,
      status: data.response_status,
    });
  } catch (error) {
    console.error("Response update API crashed", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać odpowiedzi." },
      { status: 500 },
    );
  }
}
