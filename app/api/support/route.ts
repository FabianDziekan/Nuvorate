import { NextResponse } from "next/server";
import { getActiveBusinessBillingContext } from "@/lib/active-business-billing";
import { retrieveLatestStripeInvoice } from "@/lib/stripe";
import { isSupportMailConfigured, sendSupportEmail } from "@/lib/support-mail";
import {
  cleanSupportText,
  isAllowedSupportAttachment,
  isPaymentSupportCategory,
  isSupportCategory,
} from "@/lib/support-request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Brak danych";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Brak danych" : new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(date);
}

function formatAmount(amount: number | undefined, currency: string | undefined) {
  if (typeof amount !== "number" || !currency) return "Brak danych";
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user?.email) {
      return NextResponse.json({ error: "Zaloguj się, aby wysłać zgłoszenie." }, { status: 401 });
    }
    if (!isSupportMailConfigured()) {
      return NextResponse.json({ error: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę." }, { status: 503 });
    }

    const formData = await request.formData();
    const categoryValue = cleanSupportText(formData.get("category"), 80);
    const subject = cleanSupportText(formData.get("subject"), 150);
    const description = cleanSupportText(formData.get("description"), 5000);

    if (!isSupportCategory(categoryValue)) {
      return NextResponse.json({ error: "Wybierz kategorię zgłoszenia." }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "Wpisz temat zgłoszenia." }, { status: 400 });
    }
    if (description.length < 10) {
      return NextResponse.json({ error: "Opis problemu powinien mieć co najmniej 10 znaków." }, { status: 400 });
    }

    const billingContext = await getActiveBusinessBillingContext(
      supabase,
      user.id,
      "id, name, city",
    );
    const business = billingContext?.activeBusiness.business;
    if (!billingContext || !business) {
      return NextResponse.json({ error: "Nie udało się ustalić aktywnej lokalizacji." }, { status: 403 });
    }

    const attachment = formData.get("attachment");
    const attachments: Array<{ content: string; filename: string }> = [];
    if (attachment instanceof File && attachment.size > 0) {
      const buffer = new Uint8Array(await attachment.arrayBuffer());
      if (!isAllowedSupportAttachment(attachment, buffer)) {
        return NextResponse.json({ error: "Załącznik musi być plikiem PNG, JPG/JPEG lub PDF i mieć maksymalnie 5 MB." }, { status: 400 });
      }
      const safeFilename = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "zalacznik";
      attachments.push({ content: Buffer.from(buffer).toString("base64"), filename: safeFilename });
    }

    const { data: rateAllowed, error: rateError } = await supabase.rpc("claim_support_request_slot");
    if (rateError || rateAllowed !== true) {
      return NextResponse.json({ error: "Wysłano zbyt wiele zgłoszeń. Spróbuj ponownie za kilka minut." }, { status: 429 });
    }

    const [operatorProfileResult, billingProfileResult] = await Promise.all([
      supabase.from("profiles").select("first_name, full_name").eq("user_id", user.id).maybeSingle(),
      createAdminClient()
        .from("profiles")
        .select("plan, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end")
        .eq("user_id", billingContext.billingOwnerId)
        .maybeSingle(),
    ]);

    const operatorProfile = operatorProfileResult.data;
    const billingProfile = billingProfileResult.data;
    const userName = cleanSupportText(operatorProfile?.full_name || operatorProfile?.first_name || user.user_metadata?.full_name || "Nie podano", 150);
    const isPaymentRequest = isPaymentSupportCategory(categoryValue);
    let latestInvoice: Awaited<ReturnType<typeof retrieveLatestStripeInvoice>> = null;

    if (isPaymentRequest && billingProfile?.stripe_customer_id) {
      try {
        latestInvoice = await retrieveLatestStripeInvoice(billingProfile.stripe_customer_id);
      } catch {
        // The ticket remains useful even if Stripe cannot provide invoice data.
      }
    }

    const submittedAt = new Date().toISOString();
    const billingLines = isPaymentRequest
      ? [
          "DANE ROZLICZENIOWE",
          `Stripe Customer: ${billingProfile?.stripe_customer_id ?? "Brak danych"}`,
          `Subscription: ${billingProfile?.stripe_subscription_id ?? "Brak danych"}`,
          `Status: ${billingProfile?.subscription_status ?? "Brak danych"}`,
          `Koniec okresu: ${formatDate(billingProfile?.current_period_end)}`,
          `Ostatnia płatność: ${formatAmount(latestInvoice?.amount_paid, latestInvoice?.currency)}`,
          `Data płatności: ${latestInvoice?.created ? formatDate(new Date(latestInvoice.created * 1000).toISOString()) : "Brak danych"}`,
          `Invoice: ${latestInvoice?.id ?? "Brak danych"}`,
          `Payment intent: ${typeof latestInvoice?.payment_intent === "string" ? latestInvoice.payment_intent : latestInvoice?.payment_intent?.id ?? "Brak danych"}`,
        ]
      : [];
    const lines = [
      "NOWE ZGŁOSZENIE NUVORATE",
      "",
      `Kategoria: ${categoryValue}`,
      `Temat: ${subject}`,
      "Opis:",
      description,
      "",
      "--------------------------------",
      "UŻYTKOWNIK I LOKALIZACJA",
      `Użytkownik: ${userName}`,
      `E-mail: ${user.email}`,
      `Firma: ${business.name ?? "Brak danych"}`,
      `Plan: ${billingContext.plan}`,
      `Lokalizacja: ${business.city ?? "Brak danych"}`,
      `Business ID: ${business.id}`,
      `Data zgłoszenia: ${formatDate(submittedAt)}`,
      ...(billingLines.length ? ["", "--------------------------------", ...billingLines] : []),
      ...(attachments.length ? ["", "--------------------------------", `Załącznik: ${attachments[0].filename}`] : []),
    ];
    const text = lines.join("\n");
    const html = `<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.55">${escapeHtml(text)}</div>`;
    const companyName = cleanSupportText(business.name || "NuvoRate", 80);

    await sendSupportEmail({
      attachments,
      html,
      replyTo: user.email,
      subject: `[NuvoRate Support] [${categoryValue.toUpperCase()}] ${companyName} — ${subject}`,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support request delivery failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę." }, { status: 500 });
  }
}
