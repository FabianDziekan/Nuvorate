import { NextResponse } from "next/server";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { createClient } from "@/lib/supabase/server";
import { generateReviewResponseForReview } from "@/app/dashboard/review-response-service";

type GeneratedResponse = {
  responseText: string;
  reviewId: string;
  status: "ready";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessId = body?.businessId;
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

    if (enabledRatings.length === 0) {
      return NextResponse.json({
        generatedCount: 0,
        generatedResponses: [],
      });
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

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Nie znaleziono firmy." },
        { status: 404 },
      );
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, response_status, response_text")
      .eq("business_id", business.id)
      .in("rating", enabledRatings)
      .or("response_status.eq.pending,response_text.is.null")
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("Auto response reviews lookup failed", reviewsError);
      return NextResponse.json(
        { error: "Nie udało się odczytać opinii do automatycznego generowania." },
        { status: 500 },
      );
    }

    const reviewsToGenerate = (reviews ?? []).filter((review) => {
      const responseText =
        typeof review.response_text === "string"
          ? review.response_text.trim()
          : "";

      return !responseText;
    });
    const generatedResponses: GeneratedResponse[] = [];

    for (const review of reviewsToGenerate) {
      try {
        const formData = new FormData();
        const initialState: GenerateReviewResponseState = {
          ok: false,
        };
        formData.set("reviewId", review.id);

        const result = await generateReviewResponseForReview(
          initialState,
          formData,
        );

        if (!result.ok || typeof result.responseText !== "string") {
          console.error("Auto response generation skipped", {
            error: result.error,
            reviewId: review.id,
          });
          continue;
        }

        generatedResponses.push({
          responseText: result.responseText,
          reviewId: review.id,
          status: "ready",
        });
      } catch (error) {
        console.error("Auto response generation failed for review", {
          error,
          reviewId: review.id,
        });
      }
    }

    return NextResponse.json({
      generatedCount: generatedResponses.length,
      generatedResponses,
    });
  } catch (error) {
    console.error("Auto response generation API crashed", error);
    return NextResponse.json(
      { error: "Nie udało się automatycznie wygenerować odpowiedzi." },
      { status: 500 },
    );
  }
}
