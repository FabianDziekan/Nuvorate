import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const businessId = body?.businessId;
    const autoGenerate = Boolean(body?.autoGenerate);
    const enabledRatings = Array.isArray(body?.enabledRatings)
      ? body.enabledRatings
          .map((value: unknown) => Number(value))
          .filter((value: number) => Number.isInteger(value) && value >= 1 && value <= 5)
      : [];

    if (typeof businessId !== "string" || !businessId) {
      return NextResponse.json(
        { error: "Nie wskazano firmy." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("business_response_settings")
      .upsert(
        {
          auto_generate: autoGenerate,
          business_id: businessId,
          enabled_ratings: enabledRatings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id" },
      )
      .select("auto_generate, enabled_ratings")
      .maybeSingle();

    if (error || !data) {
      console.error("Response settings API failed", error);
      return NextResponse.json(
        { error: "Nie udało się zapisać ustawień odpowiedzi." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      autoGenerate: data.auto_generate,
      enabledRatings: data.enabled_ratings ?? [],
    });
  } catch (error) {
    console.error("Response settings API crashed", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać ustawień odpowiedzi." },
      { status: 500 },
    );
  }
}
