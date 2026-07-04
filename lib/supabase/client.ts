import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserDiagnostics() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  let urlStartsWithHttps = false;
  let urlEndsWithSupabaseHost = false;
  let urlHost = "";

  if (supabaseUrl) {
    try {
      const parsedUrl = new URL(supabaseUrl);
      urlStartsWithHttps = parsedUrl.protocol === "https:";
      urlEndsWithSupabaseHost = parsedUrl.hostname.endsWith(".supabase.co");
      urlHost = parsedUrl.hostname;
    } catch {
      urlStartsWithHttps = false;
      urlEndsWithSupabaseHost = false;
    }
  }

  return {
    anonKeyPresent: Boolean(supabaseAnonKey),
    supabaseUrlPresent: Boolean(supabaseUrl),
    supabaseUrlStartsWithHttps: urlStartsWithHttps,
    supabaseUrlEndsWithSupabaseHost: urlEndsWithSupabaseHost,
    supabaseUrlHost: urlHost,
  };
}

export function getSupabaseBrowserConfigError() {
  const diagnostics = getSupabaseBrowserDiagnostics();

  if (!diagnostics.supabaseUrlPresent || !diagnostics.anonKeyPresent) {
    return "Konfiguracja logowania jest niekompletna.";
  }

  if (
    !diagnostics.supabaseUrlStartsWithHttps ||
    !diagnostics.supabaseUrlEndsWithSupabaseHost
  ) {
    return "Konfiguracja logowania jest niekompletna.";
  }

  return null;
}

export function createClient() {
  const configError = getSupabaseBrowserConfigError();

  if (configError) {
    throw new Error(configError);
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  );
}
