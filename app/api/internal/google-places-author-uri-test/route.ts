import { NextResponse } from "next/server";

import { fetchGoogleLocationPlaceId } from "@/lib/google-business";
import { createGoogleAccessToken } from "@/lib/google-reviews";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PlacesReview = {
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
};

function isAuthorized(request: Request) {
  const secret = process.env.GOOGLE_REVIEW_SYNC_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function emptyResult(placeIdPresent = false) {
  return {
    authorUriFormat: null,
    exampleAuthor: null,
    exampleAuthorUri: null,
    examplePhotoUriPresent: false,
    placeIdPresent,
    reviewsReturned: 0,
    reviewsWithAuthorUri: 0,
    reviewsWithoutAuthorUri: 0,
    success: false,
  };
}

function authorUriFormat(uri: string) {
  try {
    const parsed = new URL(uri);
    return (parsed.protocol === "https:" &&
      (parsed.hostname === "google.com" || parsed.hostname === "www.google.com") &&
      /^\/maps\/contrib\/[^/]+(?:\/.*)?$/.test(parsed.pathname))
      ? "GOOGLE_MAPS_CONTRIBUTOR_PROFILE"
      : "OTHER";
  } catch {
    return "OTHER";
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { businessId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ...emptyResult(), error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.businessId !== "string" || !UUID_PATTERN.test(body.businessId)) {
    return NextResponse.json({ ...emptyResult(), error: "Invalid business." }, { status: 400 });
  }

  const placesApiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!placesApiKey) {
    return NextResponse.json({ ...emptyResult(), error: "Places configuration unavailable." }, { status: 500 });
  }

  try {
    const { data: connection, error: connectionError } = await createAdminClient()
      .from("google_business_connections")
      .select("google_location_id, encrypted_refresh_token, status")
      .eq("business_id", body.businessId)
      .eq("status", "connected")
      .maybeSingle();

    if (connectionError || !connection?.google_location_id || !connection.encrypted_refresh_token) {
      return NextResponse.json({ ...emptyResult(), error: "Connected Google location unavailable." }, { status: 404 });
    }

    const accessToken = await createGoogleAccessToken(connection.encrypted_refresh_token);
    const placeId = await fetchGoogleLocationPlaceId(accessToken, connection.google_location_id);
    if (!placeId) {
      return NextResponse.json({ ...emptyResult(), error: "Google Place ID unavailable." }, { status: 404 });
    }

    const placesResponse = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": placesApiKey,
          "X-Goog-FieldMask": "reviews,userRatingCount",
        },
        cache: "no-store",
      },
    );

    if (!placesResponse.ok) {
      return NextResponse.json({ ...emptyResult(true), error: "Places request failed." }, { status: 502 });
    }

    const payload = (await placesResponse.json()) as { reviews?: PlacesReview[] };
    const reviews = payload.reviews ?? [];
    const reviewsWithUri = reviews.filter(
      (review) => typeof review.authorAttribution?.uri === "string" && review.authorAttribution.uri.length > 0,
    );
    const example = reviewsWithUri[0]?.authorAttribution;

    return NextResponse.json({
      authorUriFormat: example?.uri ? authorUriFormat(example.uri) : null,
      exampleAuthor: example?.displayName ?? null,
      exampleAuthorUri: example?.uri ?? null,
      examplePhotoUriPresent: typeof example?.photoUri === "string" && example.photoUri.length > 0,
      placeIdPresent: true,
      reviewsReturned: reviews.length,
      reviewsWithAuthorUri: reviewsWithUri.length,
      reviewsWithoutAuthorUri: reviews.length - reviewsWithUri.length,
      success: true,
    });
  } catch {
    return NextResponse.json({ ...emptyResult(), error: "Diagnostic request failed." }, { status: 502 });
  }
}
