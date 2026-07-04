"use server";

import type { GenerateReviewResponseState } from "@/components/dashboard/review-response-state";
import { generateReviewResponseForReview } from "./review-response-service";

export async function generateReviewResponse(
  previousState: GenerateReviewResponseState,
  formData: FormData,
): Promise<GenerateReviewResponseState> {
  return generateReviewResponseForReview(previousState, formData);
}
