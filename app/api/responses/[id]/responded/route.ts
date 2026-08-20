import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessForUser } from "@/lib/active-business";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
        { error: "Nie udało się oznaczyć odpowiedzi." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({
        response_status: "responded",
      })
      .eq("id", id)
      .eq("business_id", activeBusiness.business.id)
      .select("response_status, response_text")
      .maybeSingle();

    if (error || !data) {
      console.error("Mark response as responded API failed", error);
      return NextResponse.json(
        { error: "Nie udało się oznaczyć odpowiedzi." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      responseText: data.response_text,
      status: data.response_status,
    });
  } catch (error) {
    console.error("Mark response as responded API crashed", error);
    return NextResponse.json(
      { error: "Nie udało się oznaczyć odpowiedzi." },
      { status: 500 },
    );
  }
}
