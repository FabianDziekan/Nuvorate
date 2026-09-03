import "server-only";

import { randomUUID } from "node:crypto";

import {
  findGoogleLocationReview,
  publishGoogleLocationReviewReply,
} from "@/lib/google-reviews";
import { GoogleReviewSyncError } from "@/lib/google-review-sync-error";
import { createAdminClient } from "@/lib/supabase/admin";

const PUBLICATION_LEASE_SECONDS = 10 * 60;

export type ClaimedAutomaticGooglePublicationJob = {
  job_id: string;
  business_id: string;
  review_id: string;
  billing_owner_id: string;
  publication_lease_token: string;
};

type PublicationResult = "completed" | "retryable_failed" | "terminal_failed" | "skipped";
type PublicationFailureStatus = Exclude<PublicationResult, "completed" | "skipped">;

function normalizeReply(value: string) {
  return value.trim();
}

function publicationFailure(error: unknown): { code: string; status: PublicationFailureStatus } {
  if (error instanceof GoogleReviewSyncError && error.requiresReconnect) {
    return { code: "google_reconnect_required", status: "terminal_failed" };
  }

  const message = error instanceof Error ? error.message : "";
  const status = Number(message.match(/\((\d{3})\)/)?.[1]);
  if (status === 408 || status === 429 || status >= 500) {
    return { code: `google_publish_retryable_${status}`, status: "retryable_failed" };
  }
  if (status >= 400 && status < 500) {
    return { code: `google_publish_terminal_${status}`, status: "terminal_failed" };
  }
  return { code: "google_publish_retryable_unknown", status: "retryable_failed" };
}

export async function claimAutomaticGooglePublicationJobs(limit: number) {
  const { data, error } = await createAdminClient().rpc(
    "claim_automatic_review_response_publication_jobs",
    {
      p_lease_seconds: PUBLICATION_LEASE_SECONDS,
      p_lease_token: randomUUID(),
      p_limit: Math.min(Math.max(limit, 1), 25),
    },
  );
  if (error) throw new Error("Automatic publication claim failed");
  return (data ?? []) as ClaimedAutomaticGooglePublicationJob[];
}

/** Claims exactly one requested publication job, with no global-queue fallback. */
export async function claimSpecificAutomaticGooglePublicationJob(jobId: string) {
  const { data, error } = await createAdminClient().rpc(
    "claim_specific_automatic_review_response_publication_job",
    {
      p_job_id: jobId,
      p_lease_seconds: PUBLICATION_LEASE_SECONDS,
      p_lease_token: randomUUID(),
    },
  );
  if (error) throw new Error("Specific automatic publication claim failed");
  return ((data ?? []) as ClaimedAutomaticGooglePublicationJob[])[0] ?? null;
}

async function renewPublicationLease(job: ClaimedAutomaticGooglePublicationJob) {
  const { data, error } = await createAdminClient().rpc(
    "renew_automatic_review_response_publication_lease",
    {
      p_job_id: job.job_id,
      p_lease_seconds: PUBLICATION_LEASE_SECONDS,
      p_lease_token: job.publication_lease_token,
    },
  );
  return !error && data === true;
}

async function finishPublication(
  job: ClaimedAutomaticGooglePublicationJob,
  status: PublicationFailureStatus | "completed",
  lastError?: string,
) {
  const { data, error } = await createAdminClient().rpc(
    "finish_automatic_review_response_publication",
    {
      p_job_id: job.job_id,
      p_last_error: lastError ?? null,
      p_lease_token: job.publication_lease_token,
      p_publication_status: status,
    },
  );
  if (error || data !== true) throw new Error("Automatic publication completion failed");
}

async function failPublication(
  job: ClaimedAutomaticGooglePublicationJob,
  status: PublicationFailureStatus,
  code: string,
) {
  await finishPublication(job, status, code);
  return status;
}

/**
 * Publishes only an already billed, ready draft. It deliberately contains no
 * OpenAI or AI-usage path; publication has its own lease and retry state.
 */
export async function processAutomaticGooglePublicationJob(
  job: ClaimedAutomaticGooglePublicationJob,
): Promise<PublicationResult> {
  if (!await renewPublicationLease(job)) return "skipped";

  const admin = createAdminClient();
  const [{ data: review }, { data: settings }, { data: business }, { data: connection }, { data: reservation }] = await Promise.all([
    admin.from("reviews").select("id, business_id, source, google_review_id, rating, response_status, response_text, response_published_at").eq("id", job.review_id).eq("business_id", job.business_id).maybeSingle(),
    admin.from("business_response_settings").select("auto_generate, auto_publish, enabled_ratings").eq("business_id", job.business_id).maybeSingle(),
    admin.from("businesses").select("id, owner_id").eq("id", job.business_id).maybeSingle(),
    admin.from("google_business_connections").select("google_account_id, google_location_id, encrypted_refresh_token, status").eq("business_id", job.business_id).maybeSingle(),
    admin.from("ai_usage_reservations").select("id, status").eq("automatic_review_response_job_id", job.job_id).eq("user_id", job.billing_owner_id).maybeSingle(),
  ]);

  const responseText = typeof review?.response_text === "string" ? normalizeReply(review.response_text) : "";
  const reviewRating = review?.rating;
  const ratingEnabled = Number.isInteger(reviewRating) && Array.isArray(settings?.enabled_ratings)
    && settings.enabled_ratings.includes(Number(reviewRating));
  const connectionReady = connection?.status === "connected"
    && Boolean(connection.google_account_id && connection.google_location_id && connection.encrypted_refresh_token);

  if (
    !review || !business || business.owner_id !== job.billing_owner_id ||
    review.source !== "google" || !review.google_review_id || !responseText ||
    review.response_status !== "ready" || review.response_published_at ||
    !settings?.auto_generate || !settings.auto_publish || !ratingEnabled ||
    reservation?.status !== "completed" || !connectionReady
  ) {
    return failPublication(job, "terminal_failed", "publication_precondition_failed");
  }

  let googleReview;
  try {
    googleReview = await findGoogleLocationReview({
      accountId: connection.google_account_id!,
      encryptedRefreshToken: connection.encrypted_refresh_token!,
      locationId: connection.google_location_id!,
      reviewId: review.google_review_id,
    });
  } catch (error) {
    const failure = publicationFailure(error);
    return failPublication(job, failure.status, failure.code);
  }

  if (!googleReview) {
    return failPublication(job, "terminal_failed", "google_review_not_found");
  }

  const googleReply = googleReview.ownerReply?.comment ? normalizeReply(googleReview.ownerReply.comment) : "";
  if (googleReply) {
    if (googleReply !== responseText) {
      return failPublication(job, "terminal_failed", "google_reply_conflict");
    }

    const { data: reconciled, error } = await admin
      .from("reviews")
      .update({
        response_published_at: googleReview.ownerReply?.updatedAt ?? new Date().toISOString(),
        response_status: "responded",
      })
      .eq("id", job.review_id)
      .eq("business_id", job.business_id)
      .eq("source", "google")
      .eq("response_status", "ready")
      .eq("response_text", review.response_text)
      .is("response_published_at", null)
      .select("id")
      .maybeSingle();
    if (error || !reconciled) {
      return failPublication(job, "retryable_failed", "publication_local_reconcile_failed");
    }
    await finishPublication(job, "completed");
    return "completed";
  }

  // Fence immediately before the only Google write. A lost lease must never publish.
  if (!await renewPublicationLease(job)) return "skipped";

  try {
    const publication = await publishGoogleLocationReviewReply({
      accountId: connection.google_account_id!,
      encryptedRefreshToken: connection.encrypted_refresh_token!,
      locationId: connection.google_location_id!,
      replyText: responseText,
      reviewId: review.google_review_id,
    });

    const { data: published, error } = await admin
      .from("reviews")
      .update({
        response_published_at: publication.publishedAt,
        response_status: "responded",
      })
      .eq("id", job.review_id)
      .eq("business_id", job.business_id)
      .eq("source", "google")
      .eq("response_status", "ready")
      .eq("response_text", review.response_text)
      .is("response_published_at", null)
      .select("id")
      .maybeSingle();
    if (error || !published) {
      throw new Error("Automatic publication local save failed");
    }

    await finishPublication(job, "completed");
    return "completed";
  } catch (error) {
    const failure = publicationFailure(error);
    return failPublication(job, failure.status, failure.code);
  }
}
