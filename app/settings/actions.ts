"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedResponseTones = new Set([
  "professional",
  "friendly",
  "short",
  "premium",
]);

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isMissingColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42703"
  );
}

export async function saveSettings(_previousState: unknown, formData: FormData) {
  const name = textValue(formData, "name");
  const industry = textValue(formData, "industry");
  const responseTone = textValue(formData, "responseTone") || "professional";

  if (!name || !industry) {
    return {
      ok: false,
      error: "Uzupełnij nazwę firmy i branżę.",
    };
  }

  if (!allowedResponseTones.has(responseTone)) {
    return {
      ok: false,
      error: "Wybierz prawidłowy ton odpowiedzi.",
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/settings");
  }

  const { data: business, error: businessLookupError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessLookupError || !business) {
    console.error("Settings business lookup failed", businessLookupError);
    return {
      ok: false,
      error: "Nie udało się odczytać firmy.",
    };
  }

  const { error: businessError } = await supabase
    .from("businesses")
    .update({
      industry,
      name,
    })
    .eq("id", business.id);

  if (businessError) {
    console.error("Settings base business update failed", businessError);
    return {
      ok: false,
      error: "Nie udało się zapisać profilu firmy.",
    };
  }

  const { error: responseSettingsError } = await supabase
    .from("business_response_settings")
    .upsert(
      {
        business_id: business.id,
        response_tone: responseTone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    );

  if (responseSettingsError) {
    console.error("Settings response tone update failed", responseSettingsError);
    return {
      ok: false,
      error: isMissingColumnError(responseSettingsError)
        ? "Uruchom migrację 009_settings_fields.sql, aby zapisać ton odpowiedzi."
        : "Nie udało się zapisać tonu odpowiedzi.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}
