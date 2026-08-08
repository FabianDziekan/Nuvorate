"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function selectGoogleLocation(_previous: unknown, formData: FormData) {
  const store = await cookies(); const raw = store.get("google_pending_connection")?.value; const locationName = String(formData.get("locationName") ?? "");
  if (!raw || !locationName) return { error: "Sesja wyboru lokalizacji wygasła. Połącz Google ponownie." };
  let pending: { businessId: string; email: string; refresh: string; locations: Array<{ accountId: string; accountName: string; locationName: string; locationTitle: string }> };
  try { pending = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")); } catch { return { error: "Sesja wyboru lokalizacji wygasła. Połącz Google ponownie." }; }
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login?next=/settings");
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle(); if (!business || business.id !== pending.businessId) return { error: "Nie udało się zweryfikować firmy." };
  const location = pending.locations.find((item) => item.locationName === locationName); if (!location) return { error: "Wybierz jedną z dostępnych lokalizacji." };
  const { error } = await createAdminClient().from("google_business_connections").upsert({ business_id: business.id, google_account_id: location.accountId, google_account_name: location.accountName, google_location_id: location.locationName, google_location_name: location.locationName, google_location_title: location.locationTitle, google_email: pending.email, encrypted_refresh_token: pending.refresh, status: "connected", last_error: null }, { onConflict: "business_id" });
  if (error) return { error: "Nie udało się zapisać połączenia Google." }; store.delete("google_pending_connection"); revalidatePath("/settings"); revalidatePath("/dashboard"); return { success: "Profil Google został połączony." };
}

export async function disconnectGoogleConnection() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login?next=/settings"); const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle(); if (!business) return { error: "Nie udało się odłączyć Google." }; const { error } = await createAdminClient().from("google_business_connections").delete().eq("business_id", business.id); if (error) return { error: "Nie udało się odłączyć Google." }; revalidatePath("/settings"); revalidatePath("/dashboard"); return { ok: true }; }

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
  const firstName = textValue(formData, "firstName");
  const name = textValue(formData, "name");
  const industry = textValue(formData, "industry");
  const responseTone = textValue(formData, "responseTone") || "professional";

  if (firstName.length < 2 || firstName.length > 40) {
    return {
      ok: false,
      error: "Imię musi mieć od 2 do 40 znaków.",
      message: "",
    };
  }

  if (!name || !industry) {
    return {
      ok: false,
      error: "Uzupełnij nazwę firmy i branżę.",
      message: "",
    };
  }

  if (!allowedResponseTones.has(responseTone)) {
    return {
      ok: false,
      error: "Wybierz prawidłowy ton odpowiedzi.",
      message: "",
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
      message: "",
    };
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
    })
    .eq("user_id", user.id);

  if (profileUpdateError) {
    console.error("Settings profile update failed", profileUpdateError);
    return {
      ok: false,
      error: isMissingColumnError(profileUpdateError)
        ? "Uruchom migrację 014_profile_first_name.sql, aby zapisać imię."
        : "Nie udało się zapisać imienia.",
      message: "",
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
      message: "",
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
      message: "",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/reviews");
  revalidatePath("/analysis");
  revalidatePath("/responses");
  revalidatePath("/nfc");
  revalidatePath("/notifications");

  return {
    ok: true,
    message: "Imię zapisane",
  };
}
