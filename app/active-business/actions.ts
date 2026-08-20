"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const activeBusinessPaths = [
  "/dashboard",
  "/reviews",
  "/analysis",
  "/responses",
  "/author-verification",
  "/nfc",
  "/notifications",
  "/settings",
] as const;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SetActiveBusinessActionResult =
  | { success: true }
  | { success: false; error: string };

function cannotSwitchBusiness(): SetActiveBusinessActionResult {
  return {
    success: false,
    error: "Nie udało się zmienić aktywnej firmy.",
  };
}

/**
 * Future location switchers must use this action instead of writing the profile
 * directly. The database RPC is the final authorization boundary: it derives
 * auth.uid() itself and verifies the current membership atomically with write.
 */
export async function setActiveBusinessAction(
  businessId: unknown,
): Promise<SetActiveBusinessActionResult> {
  if (typeof businessId !== "string" || !uuidPattern.test(businessId)) {
    return cannotSwitchBusiness();
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return cannotSwitchBusiness();
  }

  const { data: selectedBusinessId, error } = await supabase.rpc(
    "set_active_business",
    { p_business_id: businessId },
  );

  // Do not expose whether a requested UUID exists or belongs to another user.
  // The RPC has already checked membership using auth.uid() at write time.
  if (error || selectedBusinessId !== businessId) {
    return cannotSwitchBusiness();
  }

  for (const path of activeBusinessPaths) {
    revalidatePath(path);
  }

  return { success: true };
}
