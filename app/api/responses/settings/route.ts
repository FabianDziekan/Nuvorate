import { NextResponse } from "next/server";
import { hasPlanCapability } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessBillingContext } from "@/lib/active-business-billing";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const businessId = body?.businessId;
    const autoGenerate = Boolean(body?.autoGenerate);
    const autoPublish = Boolean(body?.autoPublish);
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

    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    let billingContext;
    try {
      billingContext = await requireActiveBusinessBillingContext(
        supabase,
        user.id,
        "id",
        "manage",
      );
    } catch {
      return NextResponse.json({ error: "Brak dostępu do firmy." }, { status: 403 });
    }

    if (billingContext.activeBusiness.business.id !== businessId) {
      return NextResponse.json(
        { error: "Aktywna lokalizacja została zmieniona. Odśwież stronę i spróbuj ponownie." },
        { status: 409 },
      );
    }

    if (
      !hasPlanCapability(
        billingContext.plan,
        "automaticReviewResponses",
      )
    ) {
      return NextResponse.json(
        { error: "Automatyczne odpowiedzi są dostępne w planie Business." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("business_response_settings")
      .upsert(
        {
          auto_generate: autoGenerate,
          auto_publish: autoPublish,
          business_id: billingContext.activeBusiness.business.id,
          enabled_ratings: enabledRatings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id" },
      )
      .select("auto_generate, auto_publish, enabled_ratings")
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
      autoPublish: data.auto_publish,
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
