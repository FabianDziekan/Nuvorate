import { NextResponse } from "next/server";
import { validateGoogleReviewUrl } from "@/lib/nfc";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function inactiveLinkResponse() {
  return new NextResponse(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Link NFC nieaktywny | NuvoRate</title><style>body{margin:0;background:#f7f7fa;color:#0f0f10;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.card{max-width:440px;margin:18vh auto;padding:36px;border:1px solid rgba(15,15,16,.08);border-radius:24px;background:#fff;box-shadow:0 18px 48px rgba(15,15,16,.08)}.mark{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:#f1f1ff;color:#5b5cf6;font-weight:700}p{color:rgba(15,15,16,.58);line-height:1.6}</style></head><body><main class="card"><div class="mark">N</div><h1>Ten link NFC nie jest już aktywny</h1><p>Poproś obsługę firmy o aktualny link do wystawienia opinii.</p></main></body></html>`,
    {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) {
    return inactiveLinkResponse();
  }

  const supabase = createAdminClient();
  const { data: tag, error: tagError } = await supabase
    .from("nfc_tags")
    .select("id, business_id, destination_url")
    .eq("public_token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (tagError || !tag) {
    return inactiveLinkResponse();
  }

  const destinationUrl = validateGoogleReviewUrl(tag.destination_url);
  if (!destinationUrl) {
    return inactiveLinkResponse();
  }

  const { error: scanError } = await supabase.from("nfc_scans").insert({
    tag_id: tag.id,
    business_id: tag.business_id,
  });

  if (scanError) {
    console.error("NFC scan could not be recorded", scanError);
  }

  return NextResponse.redirect(destinationUrl, 307);
}
