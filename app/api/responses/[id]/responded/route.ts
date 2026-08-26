import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireActiveBusinessForUser } from "@/lib/active-business";
import {
  deleteGoogleLocationReviewReply,
  publishGoogleLocationReviewReply,
} from "@/lib/google-reviews";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const responseText = body?.responseText;

    if (typeof responseText !== "string" || !responseText.trim()) {
      return NextResponse.json(
        { error: "Wpisz treść odpowiedzi przed publikacją." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    let activeBusiness;
    try {
      activeBusiness = await requireActiveBusinessForUser(
        supabase,
        user.id,
        "id",
        "manage",
      );
    } catch {
      return NextResponse.json(
        { error: "Nie udało się oznaczyć odpowiedzi." },
        { status: 403 },
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, source, google_review_id")
      .eq("id", id)
      .eq("business_id", activeBusiness.business.id)
      .maybeSingle();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: "Nie udało się zapisać odpowiedzi w Google." },
        { status: 404 },
      );
    }

    if (review.source !== "google" || !review.google_review_id) {
      return NextResponse.json(
        { error: "Ta opinia nie jest połączona z Google Business Profile." },
        { status: 400 },
      );
    }

    const { data: connection, error: connectionError } = await createAdminClient()
      .from("google_business_connections")
      .select("google_account_id, google_location_id, encrypted_refresh_token, status")
      .eq("business_id", activeBusiness.business.id)
      .maybeSingle();

    if (
      connectionError ||
      !connection ||
      connection.status !== "connected" ||
      !connection.google_account_id ||
      !connection.google_location_id ||
      !connection.encrypted_refresh_token
    ) {
      return NextResponse.json(
        { error: "Brak aktywnego połączenia Google dla tej lokalizacji." },
        { status: 409 },
      );
    }

    let publication;
    try {
      publication = await publishGoogleLocationReviewReply({
        accountId: connection.google_account_id,
        encryptedRefreshToken: connection.encrypted_refresh_token,
        locationId: connection.google_location_id,
        replyText: responseText,
        reviewId: review.google_review_id,
      });
    } catch (publicationError) {
      console.error(
        "Google review reply publication failed",
        publicationError instanceof Error ? publicationError.message : "unknown error",
      );
      return NextResponse.json(
        { error: "Nie udało się zapisać odpowiedzi w Google. Spróbuj ponownie później." },
        { status: 502 },
      );
    }

    const { data, error } = await createAdminClient()
      .from("reviews")
      .update({
        response_status: "responded",
        response_published_at: publication.publishedAt,
        response_text: publication.responseText,
      })
      .eq("id", id)
      .eq("business_id", activeBusiness.business.id)
      .select("response_published_at, response_status, response_text")
      .maybeSingle();

    if (error || !data) {
      console.error("Mark response as responded API failed", error);
      return NextResponse.json(
        { error: "Nie udało się zapisać odpowiedzi w Google." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      responsePublishedAt: data.response_published_at,
      responseText: data.response_text,
      status: data.response_status,
    });
  } catch (error) {
    console.error("Mark response as responded API crashed", error);
      return NextResponse.json(
      { error: "Nie udało się zapisać odpowiedzi w Google." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        { error: "Musisz się zalogować." },
        { status: 401 },
      );
    }

    let activeBusiness;
    try {
      activeBusiness = await requireActiveBusinessForUser(
        supabase,
        user.id,
        "id",
        "manage",
      );
    } catch {
      return NextResponse.json(
        { error: "Nie udało się usunąć odpowiedzi z Google." },
        { status: 403 },
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, source, google_review_id, response_status, response_text")
      .eq("id", id)
      .eq("business_id", activeBusiness.business.id)
      .maybeSingle();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: "Nie udało się usunąć odpowiedzi z Google." },
        { status: 404 },
      );
    }

    if (
      review.source !== "google" ||
      !review.google_review_id ||
      review.response_status !== "responded" ||
      !review.response_text?.trim()
    ) {
      return NextResponse.json(
        { error: "Ta odpowiedź nie może zostać usunięta z Google." },
        { status: 400 },
      );
    }

    const { data: connection, error: connectionError } = await createAdminClient()
      .from("google_business_connections")
      .select("google_account_id, google_location_id, encrypted_refresh_token, status")
      .eq("business_id", activeBusiness.business.id)
      .maybeSingle();

    if (
      connectionError ||
      !connection ||
      connection.status !== "connected" ||
      !connection.google_account_id ||
      !connection.google_location_id ||
      !connection.encrypted_refresh_token
    ) {
      return NextResponse.json(
        { error: "Brak aktywnego połączenia Google dla tej lokalizacji." },
        { status: 409 },
      );
    }

    try {
      await deleteGoogleLocationReviewReply({
        accountId: connection.google_account_id,
        encryptedRefreshToken: connection.encrypted_refresh_token,
        locationId: connection.google_location_id,
        reviewId: review.google_review_id,
      });
    } catch (deletionError) {
      console.error(
        "Google review reply deletion failed",
        deletionError instanceof Error ? deletionError.message : "unknown error",
      );
      return NextResponse.json(
        { error: "Nie udało się usunąć odpowiedzi z Google. Spróbuj ponownie później." },
        { status: 502 },
      );
    }

    const { data, error } = await createAdminClient()
      .from("reviews")
      .update({
        response_published_at: null,
        response_status: "ready",
      })
      .eq("id", id)
      .eq("business_id", activeBusiness.business.id)
      .select("response_published_at, response_status, response_text")
      .maybeSingle();

    if (error || !data) {
      console.error("Google review reply local deletion update failed", error);
      return NextResponse.json(
        { error: "Nie udało się zapisać zmiany odpowiedzi." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      responsePublishedAt: data.response_published_at,
      responseText: data.response_text,
      status: data.response_status,
    });
  } catch (error) {
    console.error("Google review reply deletion API crashed", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć odpowiedzi z Google." },
      { status: 500 },
    );
  }
}
