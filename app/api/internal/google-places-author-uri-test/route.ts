import { NextResponse } from "next/server";

import { fetchGoogleLocationPlaceId } from "@/lib/google-business";
import { createGoogleAccessToken, fetchGoogleLocationReviews } from "@/lib/google-reviews";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PlacesReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  publishTime?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
};

function normalizeComparisonText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/\r\n?/gu, "\n")
    .trim()
    .replace(/\s+/gu, " ");
}

function timestampDeltaSeconds(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) return null;
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  return Number.isFinite(leftTime) && Number.isFinite(rightTime)
    ? Math.abs(leftTime - rightTime) / 1000
    : null;
}

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
      .select("google_account_id, google_location_id, encrypted_refresh_token, status")
      .eq("business_id", body.businessId)
      .eq("status", "connected")
      .maybeSingle();

    if (connectionError || !connection?.google_account_id || !connection.google_location_id || !connection.encrypted_refresh_token) {
      return NextResponse.json({ ...emptyResult(), error: "Connected Google location unavailable." }, { status: 404 });
    }

    const accessToken = await createGoogleAccessToken(connection.encrypted_refresh_token);
    const placeId = await fetchGoogleLocationPlaceId(accessToken, connection.google_location_id);
    if (!placeId) {
      return NextResponse.json({ ...emptyResult(), error: "Google Place ID unavailable." }, { status: 404 });
    }

    const gbpResult = await fetchGoogleLocationReviews({
      accountId: connection.google_account_id,
      encryptedRefreshToken: connection.encrypted_refresh_token,
      locationId: connection.google_location_id,
    });

    const placesResponse = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": placesApiKey,
          "X-Goog-FieldMask": "reviews.rating,reviews.text,reviews.originalText,reviews.publishTime,reviews.authorAttribution,userRatingCount",
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
    const comparisons = reviews.map((review, index) => {
      const displayName = review.authorAttribution?.displayName ?? "";
      const normalizedName = normalizeComparisonText(displayName);
      const placesText = review.originalText?.text ?? review.text?.text ?? "";
      const normalizedPlacesText = normalizeComparisonText(placesText);
      const hasText = normalizedPlacesText.length > 0;
      const afterRating = gbpResult.reviews.filter((candidate) => candidate.rating === review.rating);
      const afterName = afterRating.filter(
        (candidate) => !candidate.author.isAnonymous &&
          normalizeComparisonText(candidate.author.displayName) === normalizedName,
      );
      const afterText = afterName.filter((candidate) => {
        const normalizedCandidateText = normalizeComparisonText(candidate.comment);
        return normalizedCandidateText === normalizedPlacesText;
      });
      const timestampMatches = afterText.flatMap((candidate) => {
        const createDeltaSeconds = timestampDeltaSeconds(candidate.createdAt, review.publishTime);
        const updateDeltaSeconds = timestampDeltaSeconds(candidate.updatedAt, review.publishTime);
        const exact = createDeltaSeconds === 0 || updateDeltaSeconds === 0;
        return exact ? [{ candidate, createDeltaSeconds, updateDeltaSeconds }] : [];
      });
      const finalStatus = timestampMatches.length === 1
        ? "UNIQUE_MATCH"
        : timestampMatches.length > 1 ? "AMBIGUOUS" : "NO_MATCH";
      const uniqueTimestampMatch = finalStatus === "UNIQUE_MATCH" ? timestampMatches[0] : null;

      return {
        authorUri: uniqueTimestampMatch ? review.authorAttribution?.uri ?? null : null,
        candidateCountAfterDisplayName: afterName.length,
        candidateCountAfterRating: afterRating.length,
        candidateCountAfterText: afterText.length,
        candidateCountAfterTimestamp: timestampMatches.length,
        displayName,
        finalStatus,
        hasAuthorUri: Boolean(review.authorAttribution?.uri),
        hasText,
        index: index + 1,
        publishTime: review.publishTime ?? null,
        rating: review.rating ?? null,
        timestampDeltasAfterText: afterText.map((candidate) => ({
          createTime: timestampDeltaSeconds(candidate.createdAt, review.publishTime),
          updateTime: timestampDeltaSeconds(candidate.updatedAt, review.publishTime),
        })),
        timestampDeltaSeconds: uniqueTimestampMatch
          ? {
              createTime: uniqueTimestampMatch.createDeltaSeconds,
              updateTime: uniqueTimestampMatch.updateDeltaSeconds,
            }
          : null,
      };
    });

    return NextResponse.json({
      authorUriFormat: example?.uri ? authorUriFormat(example.uri) : null,
      exampleAuthor: example?.displayName ?? null,
      exampleAuthorUri: example?.uri ?? null,
      examplePhotoUriPresent: typeof example?.photoUri === "string" && example.photoUri.length > 0,
      gbpReviewsReturned: gbpResult.reviews.length,
      gbpReviewsWithoutText: gbpResult.reviews.filter(
        (review) => normalizeComparisonText(review.comment).length === 0,
      ).length,
      matching: comparisons,
      placeIdPresent: true,
      placesReviewsWithoutText: comparisons.filter((review) => !review.hasText).length,
      reviewsReturned: reviews.length,
      reviewsWithAuthorUri: reviewsWithUri.length,
      reviewsWithoutAuthorUri: reviews.length - reviewsWithUri.length,
      success: true,
    });
  } catch {
    return NextResponse.json({ ...emptyResult(), error: "Diagnostic request failed." }, { status: 502 });
  }
}
