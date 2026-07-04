import { NextResponse } from "next/server";
import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { generateReviewResponseForReview } from "@/app/dashboard/review-response-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reviewId = body?.reviewId;

    if (typeof reviewId !== "string" || !reviewId) {
      return NextResponse.json(
        { error: "Nie wskazano opinii." },
        { status: 400 },
      );
    }

    const formData = new FormData();
    const initialState: GenerateReviewResponseState = {
      ok: false,
    };
    formData.set("reviewId", reviewId);

    const result = await generateReviewResponseForReview(initialState, formData);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Nie udało się wygenerować odpowiedzi." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      responseText: result.responseText,
      status: "ready",
    });
  } catch (error) {
    console.error("Response generation API failed", error);
    return NextResponse.json(
      { error: "Nie udało się wygenerować odpowiedzi." },
      { status: 500 },
    );
  }
}
