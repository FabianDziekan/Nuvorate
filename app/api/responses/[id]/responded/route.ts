import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({
        response_status: "responded",
      })
      .eq("id", id)
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
