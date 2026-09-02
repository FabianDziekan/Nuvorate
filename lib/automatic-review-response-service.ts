import "server-only";

import { randomUUID } from "node:crypto";

import { completeAiUsageReservation, releaseAiUsageReservation } from "@/lib/ai-usage";
import { generateReviewResponseText } from "@/lib/review-response-generation";
import { hasPlanCapability, normalizePlan, getAiLimit } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { openAIModel } from "@/lib/openai";

const LEASE_SECONDS = 10 * 60;

export type ClaimedAutomaticReviewResponseJob = {
  job_id: string;
  business_id: string;
  review_id: string;
  billing_owner_id: string;
  ai_usage_reservation_id?: string | null;
  lease_token: string;
};

export async function enqueueAutomaticReviewResponseJobs(businessId: string, reviewIds: string[]) {
  if (reviewIds.length === 0) return 0;
  const { data, error } = await createAdminClient().rpc("enqueue_automatic_review_response_jobs", {
    p_business_id: businessId,
    p_review_ids: reviewIds,
  });
  if (error) throw new Error("Automatic response enqueue failed");
  return Number(data ?? 0);
}

export async function claimAutomaticReviewResponseJobs(limit: number) {
  const { data, error } = await createAdminClient().rpc("claim_automatic_review_response_jobs", {
    p_lease_seconds: LEASE_SECONDS,
    p_lease_token: randomUUID(),
    p_limit: Math.min(Math.max(limit, 1), 25),
  });
  if (error) throw new Error("Automatic response claim failed");
  return (data ?? []) as ClaimedAutomaticReviewResponseJob[];
}

/** Claims exactly the requested eligible job; it never falls back to the global queue. */
export async function claimSpecificAutomaticReviewResponseJob(jobId: string) {
  const { data, error } = await createAdminClient().rpc("claim_specific_automatic_review_response_job", {
    p_job_id: jobId,
    p_lease_seconds: LEASE_SECONDS,
    p_lease_token: randomUUID(),
  });
  if (error) throw new Error("Specific automatic response claim failed");
  return ((data ?? []) as ClaimedAutomaticReviewResponseJob[])[0] ?? null;
}

async function finish(job: ClaimedAutomaticReviewResponseJob, status: "completed" | "skipped" | "failed", lastError?: string) {
  const { data, error } = await createAdminClient().rpc("finish_automatic_review_response_job", {
    p_job_id: job.job_id,
    p_last_error: lastError ?? null,
    p_lease_token: job.lease_token,
    p_status: status,
  });
  if (error || data !== true) throw new Error("Automatic response completion failed");
}

async function reserveForJob(job: ClaimedAutomaticReviewResponseJob, limit: number) {
  const { data, error } = await createAdminClient().rpc("reserve_ai_usage_for_automatic_review_job", {
    p_job_id: job.job_id,
    p_lease_token: job.lease_token,
    p_limit: limit,
  });
  if (error) throw new Error("Automatic response usage reservation failed");
  const row = Array.isArray(data) ? data[0] : data;
  return row as { reservation_id: string | null; reserved: boolean; already_completed: boolean } | null;
}

async function renewLease(job: ClaimedAutomaticReviewResponseJob) {
  const { data, error } = await createAdminClient().rpc("renew_automatic_review_response_job_lease", {
    p_job_id: job.job_id,
    p_lease_seconds: LEASE_SECONDS,
    p_lease_token: job.lease_token,
  });
  return !error && data === true;
}

async function setPublicationState(
  job: ClaimedAutomaticReviewResponseJob,
  publicationStatus: "not_requested" | "pending",
) {
  const { data, error } = await createAdminClient().rpc(
    "set_automatic_review_response_publication_state",
    {
      p_job_id: job.job_id,
      p_lease_token: job.lease_token,
      p_publication_status: publicationStatus,
    },
  );

  if (error || data !== true) {
    throw new Error("Automatic response publication handoff failed");
  }
}

/** A recovered job may already have completed its durable reservation. */
async function completeAutomaticReservationIfNeeded({
  admin,
  reservationId,
  billingOwnerId,
}: {
  admin: ReturnType<typeof createAdminClient>;
  reservationId: string;
  billingOwnerId: string;
}) {
  const { data: reservation, error } = await admin
    .from("ai_usage_reservations")
    .select("status")
    .eq("id", reservationId)
    .eq("user_id", billingOwnerId)
    .maybeSingle();

  if (error || !reservation) {
    throw new Error("Automatic response usage reservation lookup failed");
  }

  if (reservation.status === "completed") return;
  await completeAiUsageReservation(reservationId, billingOwnerId);
}

/** Processes one lease-owned job. Every eligibility condition is rechecked. */
export async function processAutomaticReviewResponseJob(job: ClaimedAutomaticReviewResponseJob) {
  if (!await renewLease(job)) return "skipped" as const;

  const admin = createAdminClient();
  const [{ data: review }, { data: settings }, { data: business }, { data: existingAiResponse }] = await Promise.all([
    admin.from("reviews").select("id, business_id, author_name, rating, content, response_status, response_text, response_generated_at, source").eq("id", job.review_id).eq("business_id", job.business_id).maybeSingle(),
    admin.from("business_response_settings").select("auto_generate, auto_publish, enabled_ratings, response_tone").eq("business_id", job.business_id).maybeSingle(),
    admin.from("businesses").select("id, name, owner_id").eq("id", job.business_id).maybeSingle(),
    admin.from("ai_review_responses").select("id").eq("review_id", job.review_id).maybeSingle(),
  ]);

  const planResult = business?.owner_id
    ? await admin.from("profiles").select("plan").eq("user_id", business.owner_id).maybeSingle()
    : { data: null };
  const plan = normalizePlan(planResult.data?.plan);
  const responseText = typeof review?.response_text === "string" ? review.response_text.trim() : "";
  const ratingEnabled = Number.isInteger(review?.rating) && Array.isArray(settings?.enabled_ratings)
    && settings.enabled_ratings.includes(Number(review?.rating));
  const automaticPublicationEnabled = Boolean(
    settings?.auto_generate && settings?.auto_publish && ratingEnabled,
  );

  // A crash after persisting an AI draft but before finishing the job must not
  // call OpenAI again. Complete the pre-existing reservation and terminally
  // complete the recovered job instead.
  if (review && responseText && review.response_status === "ready" && existingAiResponse?.id) {
    if (job.ai_usage_reservation_id) {
      await completeAutomaticReservationIfNeeded({
        admin,
        reservationId: job.ai_usage_reservation_id,
        billingOwnerId: job.billing_owner_id,
      });
    }
    await setPublicationState(
      job,
      automaticPublicationEnabled ? "pending" : "not_requested",
    );
    await finish(job, "completed");
    return "completed" as const;
  }

  if (
    !review || !business || business.owner_id !== job.billing_owner_id || review.source !== "google" ||
    review.response_status === "responded" || Boolean(responseText) || !settings?.auto_generate ||
    !ratingEnabled || !hasPlanCapability(plan, "automaticReviewResponses")
  ) {
    if (job.ai_usage_reservation_id) {
      await releaseAiUsageReservation(job.ai_usage_reservation_id, job.billing_owner_id);
    }
    await finish(job, "skipped");
    return "skipped" as const;
  }

  const reservation = await reserveForJob(job, getAiLimit(plan, "reply"));
  if (!reservation?.reserved || !reservation.reservation_id) {
    await finish(job, "skipped");
    return "skipped" as const;
  }

  if (reservation.already_completed) {
    await finish(job, "completed");
    return "completed" as const;
  }

  try {
    // Fence ownership immediately before the external side effect.
    if (!await renewLease(job)) return "skipped" as const;
    const generated = await generateReviewResponseText({
      businessName: business.name,
      idempotencyKey: `automatic-review-response:${job.job_id}`,
      responseTone: settings.response_tone,
      review: { author_name: review.author_name, content: review.content, rating: Number(review.rating) },
    });

    // Fence again after the external call. A stale worker must not write a draft.
    if (!await renewLease(job)) return "skipped" as const;

    // The conditional update avoids replacing a reply or draft created after the recheck.
    const { data: savedReview, error: reviewError } = await admin
      .from("reviews")
      .update({ response_generated_at: new Date().toISOString(), response_status: "ready", response_text: generated })
      .eq("id", job.review_id)
      .eq("business_id", job.business_id)
      .eq("source", "google")
      .eq("response_status", "pending")
      .is("response_text", null)
      .select("id")
      .maybeSingle();
    if (reviewError) throw new Error("Automatic response review save failed");
    if (!savedReview) {
      await releaseAiUsageReservation(reservation.reservation_id, job.billing_owner_id);
      await finish(job, "skipped");
      return "skipped" as const;
    }

    const { error: aiError } = await admin.from("ai_review_responses").upsert({
      business_id: job.business_id,
      model: openAIModel,
      response_text: generated,
      review_id: job.review_id,
    }, { onConflict: "review_id" });
    if (aiError) throw new Error("Automatic response AI record save failed");

    await completeAutomaticReservationIfNeeded({
      admin,
      reservationId: reservation.reservation_id,
      billingOwnerId: job.billing_owner_id,
    });
    await setPublicationState(
      job,
      automaticPublicationEnabled ? "pending" : "not_requested",
    );
    await finish(job, "completed");
    return "completed" as const;
  } catch (error) {
    await releaseAiUsageReservation(reservation.reservation_id, job.billing_owner_id);
    await finish(job, "failed", "generation_failed");
    throw error;
  }
}
