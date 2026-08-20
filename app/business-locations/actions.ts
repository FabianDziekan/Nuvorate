"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const locationDependentPaths = [
  "/dashboard",
  "/reviews",
  "/analysis",
  "/responses",
  "/author-verification",
  "/nfc",
  "/notifications",
  "/settings",
] as const;

export type CreateBusinessLocationInput = {
  name: string;
  industry: string;
  city: string;
  googleReviewUrl: string;
};

export type CreateBusinessLocationResult =
  | { success: true; businessId: string }
  | { success: false; error: string };

function cannotCreateLocation(): CreateBusinessLocationResult {
  return {
    success: false,
    error: "Nie udało się utworzyć lokalizacji. Sprawdź dane i spróbuj ponownie.",
  };
}

function normalizeInput(input: unknown): CreateBusinessLocationInput | null {
  if (!input || typeof input !== "object") return null;

  const values = input as Record<string, unknown>;
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const industry = typeof values.industry === "string" ? values.industry.trim() : "";
  const city = typeof values.city === "string" ? values.city.trim() : "";
  const googleReviewUrl =
    typeof values.googleReviewUrl === "string" ? values.googleReviewUrl.trim() : "";

  if (!name || !industry || !city || !googleReviewUrl) return null;

  try {
    const url = new URL(googleReviewUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
  } catch {
    return null;
  }

  return { name, industry, city, googleReviewUrl };
}

/**
 * The sole application entry point for creating a location. Authorization,
 * billing plan and atomic entitlement enforcement remain in the authenticated
 * database RPC, where clients cannot tamper with owner or limit values.
 */
export async function createBusinessLocationAction(
  input: unknown,
): Promise<CreateBusinessLocationResult> {
  const location = normalizeInput(input);
  if (!location) return cannotCreateLocation();

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return cannotCreateLocation();

  const { data: businessId, error } = await supabase.rpc(
    "create_business_location",
    {
      p_name: location.name,
      p_industry: location.industry,
      p_city: location.city,
      p_google_review_url: location.googleReviewUrl,
    },
  );

  if (error || typeof businessId !== "string") return cannotCreateLocation();

  for (const path of locationDependentPaths) {
    revalidatePath(path);
  }

  return { success: true, businessId };
}
