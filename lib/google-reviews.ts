import "server-only";

import { decryptGoogleToken } from "@/lib/google-business";
import { mapGoogleReview, type GoogleReviewPayload } from "@/lib/google-review-mapping";

type GoogleReviewsResponse = {
  reviews?: GoogleReviewPayload[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
};

type GoogleReviewReplyResponse = {
  comment?: string;
  updateTime?: string;
};

function requireGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Google integration is not configured.");
  }

  return { clientId, clientSecret };
}

function isGoogleResourceName(value: string, prefix: "accounts" | "locations") {
  return new RegExp(`^${prefix}/[^/]+$`).test(value);
}

async function createGoogleAccessToken(encryptedRefreshToken: string) {
  const { clientId, clientSecret } = requireGoogleOAuthConfig();
  const refreshToken = decryptGoogleToken(encryptedRefreshToken);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google token refresh failed (${response.status}).`);
  }

  const token = (await response.json()) as { access_token?: string };
  if (!token.access_token) {
    throw new Error("Google token refresh returned no access token.");
  }

  return token.access_token;
}

export async function fetchGoogleLocationReviews({
  accountId,
  encryptedRefreshToken,
  locationId,
}: {
  accountId: string;
  encryptedRefreshToken: string;
  locationId: string;
}) {
  if (!isGoogleResourceName(accountId, "accounts") || !isGoogleResourceName(locationId, "locations")) {
    throw new Error("Google connection has invalid account or location data.");
  }

  const accessToken = await createGoogleAccessToken(encryptedRefreshToken);
  const reviews = [];
  let averageRating: number | null = null;
  let totalReviewCount = 0;
  let pageToken: string | null = null;

  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");

    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Google reviews request failed (${response.status}).`);
    }

    const data = (await response.json()) as GoogleReviewsResponse;
    reviews.push(...(data.reviews ?? []).map(mapGoogleReview));

    if (averageRating === null && typeof data.averageRating === "number") {
      averageRating = data.averageRating;
    }

    if (typeof data.totalReviewCount === "number") {
      totalReviewCount = data.totalReviewCount;
    }

    pageToken = data.nextPageToken ?? null;
  } while (pageToken);

  return {
    averageRating,
    nextPageToken: null,
    reviews,
    totalReviewCount,
  };
}

export async function publishGoogleLocationReviewReply({
  accountId,
  encryptedRefreshToken,
  locationId,
  replyText,
  reviewId,
}: {
  accountId: string;
  encryptedRefreshToken: string;
  locationId: string;
  replyText: string;
  reviewId: string;
}) {
  if (!isGoogleResourceName(accountId, "accounts") || !isGoogleResourceName(locationId, "locations")) {
    throw new Error("Google connection has invalid account or location data.");
  }

  const normalizedReviewId = reviewId.trim();
  const normalizedReplyText = replyText.trim();

  if (!normalizedReviewId || !normalizedReplyText) {
    throw new Error("Google review reply requires a review and reply text.");
  }

  const accessToken = await createGoogleAccessToken(encryptedRefreshToken);
  const url = new URL(
    `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${encodeURIComponent(normalizedReviewId)}/reply`,
  );
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ comment: normalizedReplyText }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google review reply request failed (${response.status}).`);
  }

  const data = (await response.json()) as GoogleReviewReplyResponse;
  const returnedText = typeof data.comment === "string" ? data.comment.trim() : "";
  const returnedDate = typeof data.updateTime === "string" ? new Date(data.updateTime) : null;

  return {
    publishedAt: returnedDate && !Number.isNaN(returnedDate.getTime())
      ? returnedDate.toISOString()
      : new Date().toISOString(),
    responseText: returnedText || normalizedReplyText,
  };
}

export async function deleteGoogleLocationReviewReply({
  accountId,
  encryptedRefreshToken,
  locationId,
  reviewId,
}: {
  accountId: string;
  encryptedRefreshToken: string;
  locationId: string;
  reviewId: string;
}) {
  if (!isGoogleResourceName(accountId, "accounts") || !isGoogleResourceName(locationId, "locations")) {
    throw new Error("Google connection has invalid account or location data.");
  }

  const normalizedReviewId = reviewId.trim();

  if (!normalizedReviewId) {
    throw new Error("Google review reply deletion requires a review.");
  }

  const accessToken = await createGoogleAccessToken(encryptedRefreshToken);
  const url = new URL(
    `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${encodeURIComponent(normalizedReviewId)}/reply`,
  );
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google review reply deletion failed (${response.status}).`);
  }
}
