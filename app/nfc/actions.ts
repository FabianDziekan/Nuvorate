"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { hasPlanCapability } from "@/lib/plans";
import { validateNfcTagInput } from "@/lib/nfc";
import type { NfcTagActionState } from "@/lib/nfc-types";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessBillingContext } from "@/lib/active-business-billing";

async function getOwnedNfcBusiness() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { error: "Sesja wygasła. Zaloguj się ponownie." } as const;
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
    return { error: "Nie udało się odczytać danych firmy." } as const;
  }

  const business = billingContext.activeBusiness.business;

  if (!hasPlanCapability(billingContext.plan, "nfcBasicStats")) {
    return { error: "Moduł NFC jest dostępny w planie Starter albo Business." } as const;
  }

  return { business, supabase } as const;
}

function readTagInput(formData: FormData) {
  return validateNfcTagInput({
    name: String(formData.get("name") ?? ""),
    destinationUrl: String(formData.get("destinationUrl") ?? ""),
  });
}

export async function createNfcTag(
  _previousState: NfcTagActionState,
  formData: FormData,
): Promise<NfcTagActionState> {
  const input = readTagInput(formData);
  if ("error" in input) return input;

  const context = await getOwnedNfcBusiness();
  if ("error" in context) return context;

  const publicToken = randomBytes(24).toString("base64url");

  const { error } = await context.supabase.from("nfc_tags").insert({
    business_id: context.business.id,
    name: input.name,
    public_token: publicToken,
    destination_url: input.destinationUrl,
  });

  if (error) {
    return { error: "Nie udało się utworzyć linku NFC. Spróbuj ponownie." };
  }

  revalidatePath("/nfc");
  revalidatePath("/dashboard");
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    success: "Link NFC został utworzony.",
    createdTag: { name: input.name, publicUrl: `${baseUrl}/r/${publicToken}` },
  };
}

export async function updateNfcTag(
  _previousState: NfcTagActionState,
  formData: FormData,
): Promise<NfcTagActionState> {
  const tagId = String(formData.get("tagId") ?? "");
  const input = readTagInput(formData);
  if (!tagId || "error" in input) {
    return "error" in input ? input : { error: "Nie znaleziono plakietki NFC." };
  }

  const context = await getOwnedNfcBusiness();
  if ("error" in context) return context;

  const { data: updatedTag, error } = await context.supabase
    .from("nfc_tags")
    .update({ name: input.name, destination_url: input.destinationUrl })
    .eq("id", tagId)
    .eq("business_id", context.business.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedTag) {
    return { error: "Nie udało się zapisać zmian plakietki." };
  }

  revalidatePath("/nfc");
  return { success: "Zmiany zostały zapisane." };
}

export async function toggleNfcTag(
  _previousState: NfcTagActionState,
  formData: FormData,
): Promise<NfcTagActionState> {
  const tagId = String(formData.get("tagId") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!tagId) return { error: "Nie znaleziono plakietki NFC." };

  const context = await getOwnedNfcBusiness();
  if ("error" in context) return context;

  const { data: updatedTag, error } = await context.supabase
    .from("nfc_tags")
    .update({ is_active: isActive })
    .eq("id", tagId)
    .eq("business_id", context.business.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedTag) return { error: "Nie udało się zmienić statusu plakietki." };

  revalidatePath("/nfc");
  return {
    success: isActive ? "Plakietka została włączona." : "Plakietka została wyłączona.",
  };
}
