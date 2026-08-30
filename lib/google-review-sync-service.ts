import "server-only";

import { GoogleReviewSyncError } from "@/lib/google-review-sync-error";
import { fetchGoogleLocationReviews } from "@/lib/google-reviews";
import { enqueueAutomaticReviewResponseJobs } from "@/lib/automatic-review-response-service";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SYNC_BATCH_SIZE = 25;
const MAX_SAFE_SYNC_ERROR_LENGTH = 240;
const SYNC_LEASE_SECONDS = 10 * 60;

export type ClaimedGoogleReviewConnection = {
  business_id: string;
  connection_id: string;
  encrypted_refresh_token: string;
  google_account_id: string | null;
  google_location_id: string | null;
  sync_lease_token: string;
};

function nonEmptyText(value: string | null, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function safeCreatedAt(value: string | null) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeSyncFailure(error: unknown) {
  if (error instanceof GoogleReviewSyncError) return error;

  const message = error instanceof Error ? error.message : "unknown error";
  const requiresReconnect =
    /Google token refresh failed \((400|401)\)/.test(message) ||
    /Google reviews request failed \((401|403)\)/.test(message) ||
    /Invalid encrypted Google token/.test(message);

  return new GoogleReviewSyncError(
    requiresReconnect
      ? "Połączenie Google wymaga ponownego połączenia."
      : "Nie udało się zsynchronizować opinii Google. Spróbujemy ponownie później.",
    { diagnosticCode: "sync_unknown_failed", requiresReconnect },
  );
}

export async function claimGoogleReviewSyncConnections({
  businessId,
  leaseSeconds,
  leaseToken,
  limit,
}: {
  businessId?: string;
  leaseSeconds: number;
  leaseToken: string;
  limit: number;
}) {
  const { data, error } = await createAdminClient().rpc("claim_google_review_sync_connections", {
    p_business_id: businessId ?? null,
    p_lease_seconds: leaseSeconds,
    p_lease_token: leaseToken,
    p_limit: Math.min(Math.max(limit, 1), MAX_SYNC_BATCH_SIZE),
  });

  if (error) {
    throw new GoogleReviewSyncError("Nie udało się przygotować synchronizacji Google.", {
      diagnosticCode: "sync_claim_failed",
    });
  }

  return (data ?? []) as ClaimedGoogleReviewConnection[];
}

export async function completeGoogleReviewSync(connection: ClaimedGoogleReviewConnection) {
  const { data, error } = await createAdminClient().rpc("complete_google_review_sync_connection", {
    p_connection_id: connection.connection_id,
    p_lease_token: connection.sync_lease_token,
  });

  if (error || data !== true) {
    throw new GoogleReviewSyncError("Nie udało się zakończyć synchronizacji Google.", {
      diagnosticCode: "sync_completion_failed",
    });
  }
}

async function renewGoogleReviewSyncLease(connection: ClaimedGoogleReviewConnection) {
  const { data, error } = await createAdminClient().rpc("renew_google_review_sync_connection", {
    p_connection_id: connection.connection_id,
    p_lease_seconds: SYNC_LEASE_SECONDS,
    p_lease_token: connection.sync_lease_token,
  });

  if (error || data !== true) {
    throw new GoogleReviewSyncError("Synchronizacja Google wygasła przed zapisaniem danych.", {
      diagnosticCode: "lease_renew_failed",
    });
  }
}

export async function failGoogleReviewSync(connection: ClaimedGoogleReviewConnection, error: unknown) {
  const failure = normalizeSyncFailure(error);
  const { data, error: completionError } = await createAdminClient().rpc("fail_google_review_sync_connection", {
    p_connection_id: connection.connection_id,
    p_last_error: failure.diagnosticCode.slice(0, MAX_SAFE_SYNC_ERROR_LENGTH),
    p_lease_token: connection.sync_lease_token,
    p_requires_reconnect: failure.requiresReconnect,
  });

  if (completionError || data !== true) {
    throw new GoogleReviewSyncError("Nie udało się zapisać stanu synchronizacji Google.", {
      diagnosticCode: "sync_failure_persist_failed",
    });
  }

  return failure;
}

export async function syncClaimedGoogleReviewConnection(connection: ClaimedGoogleReviewConnection) {
  if (!connection.google_account_id || !connection.google_location_id || !connection.encrypted_refresh_token) {
    throw new GoogleReviewSyncError("Połączenie Google wymaga ponownego połączenia.", {
      diagnosticCode: "google_connection_metadata_missing",
      requiresReconnect: true,
    });
  }

  try {
    const admin = createAdminClient();
    const result = await fetchGoogleLocationReviews({
      accountId: connection.google_account_id,
      encryptedRefreshToken: connection.encrypted_refresh_token,
      locationId: connection.google_location_id,
    });

    const reviewsToUpsert = result.reviews.flatMap((review) => {
      if (!review.googleReviewId || review.rating === null) return [];

      return [{
        author_name: nonEmptyText(review.author.displayName, "Użytkownik Google"),
        business_id: connection.business_id,
        content: nonEmptyText(review.comment, "Opinia bez treści."),
        created_at: safeCreatedAt(review.createdAt),
        google_review_id: review.googleReviewId,
        rating: review.rating,
        source: "google",
      }];
    });

    const reviewsWithGoogleReplies = result.reviews.flatMap((review) => {
      const replyText = review.ownerReply?.comment?.trim();

      if (!review.googleReviewId || review.rating === null || !replyText) return [];

      return [{
        author_name: nonEmptyText(review.author.displayName, "Użytkownik Google"),
        business_id: connection.business_id,
        content: nonEmptyText(review.comment, "Opinia bez treści."),
        created_at: safeCreatedAt(review.createdAt),
        google_review_id: review.googleReviewId,
        rating: review.rating,
        response_published_at: safeCreatedAt(review.ownerReply?.updatedAt ?? null),
        response_status: "responded",
        response_text: replyText,
        source: "google",
      }];
    });

    const googleReviewIdsInSync = result.reviews.flatMap((review) => (
      review.googleReviewId ? [review.googleReviewId] : []
    ));
    const googleReviewIdsWithOwnerReplies = new Set(reviewsWithGoogleReplies.map((review) => review.google_review_id));

    // A worker must still own a live lease immediately before it changes local
    // review state. This prevents a stale worker from writing after a newer one
    // has reclaimed an expired synchronization lease.
    await renewGoogleReviewSyncLease(connection);

    let newReviewIds: string[] = [];
    if (reviewsToUpsert.length > 0) {
      // INSERT ... ON CONFLICT DO NOTHING is the authoritative new-record
      // detector. Only rows inserted in this exact call are returned.
      const { data: insertedReviews, error: insertError } = await admin
        .from("reviews")
        .upsert(reviewsToUpsert, {
          ignoreDuplicates: true,
          onConflict: "business_id,google_review_id",
        })
        .select("id");
      if (insertError) {
        throw new GoogleReviewSyncError("Nie udało się zapisać opinii z Google.", {
          diagnosticCode: "reviews_upsert_failed",
        });
      }
      newReviewIds = (insertedReviews ?? []).map((review) => review.id);

      const { error: upsertError } = await admin
        .from("reviews")
        .upsert(reviewsToUpsert, { onConflict: "business_id,google_review_id" });

      if (upsertError) {
        throw new GoogleReviewSyncError("Nie udało się zapisać opinii z Google.", {
          diagnosticCode: "reviews_upsert_failed",
        });
      }
    }

    if (reviewsWithGoogleReplies.length > 0) {
      const { error: replyUpsertError } = await admin
        .from("reviews")
        .upsert(reviewsWithGoogleReplies, { onConflict: "business_id,google_review_id" });

      if (replyUpsertError) {
        throw new GoogleReviewSyncError("Nie udało się zapisać odpowiedzi z Google.", {
          diagnosticCode: "reply_sync_failed",
        });
      }
    }

    // Only reviews returned by the fully paginated Google response can prove that
    // a previously published reply was removed outside NuvoRate. Local drafts stay untouched.
    if (googleReviewIdsInSync.length > 0) {
      const { data: respondedGoogleReviews, error: respondedGoogleReviewsError } = await admin
        .from("reviews")
        .select("id, google_review_id")
        .eq("business_id", connection.business_id)
        .eq("source", "google")
        .eq("response_status", "responded")
        .in("google_review_id", googleReviewIdsInSync);

      if (respondedGoogleReviewsError) {
        throw new GoogleReviewSyncError("Nie udało się zsynchronizować odpowiedzi z Google.", {
          diagnosticCode: "reply_sync_failed",
        });
      }

      const repliesRemovedInGoogle = (respondedGoogleReviews ?? [])
        .filter((review) => review.google_review_id && !googleReviewIdsWithOwnerReplies.has(review.google_review_id))
        .map((review) => review.id);

      if (repliesRemovedInGoogle.length > 0) {
        const { error: replyRemovalSyncError } = await admin
          .from("reviews")
          .update({
            response_published_at: null,
            response_status: "ready",
          })
          .eq("business_id", connection.business_id)
          .eq("source", "google")
          .eq("response_status", "responded")
          .in("id", repliesRemovedInGoogle);

        if (replyRemovalSyncError) {
          throw new GoogleReviewSyncError("Nie udało się zsynchronizować odpowiedzi z Google.", {
            diagnosticCode: "reply_sync_failed",
          });
        }
      }
    }

    // Enqueue happens only after review and owner-reply state are synchronized.
    // The durable UNIQUE(review_id) job prevents retries from duplicating AI work.
    const { data: pendingEnqueueReviews, error: pendingEnqueueError } = await admin
      .from("reviews")
      .select("id")
      .eq("business_id", connection.business_id)
      .eq("source", "google")
      .eq("automatic_response_enqueue_pending", true);
    if (pendingEnqueueError) {
      throw new GoogleReviewSyncError("Nie udało się przygotować opinii z Google.", {
        diagnosticCode: "reviews_upsert_failed",
      });
    }
    const enqueueReviewIds = (pendingEnqueueReviews ?? []).map((review) => review.id);
    if (enqueueReviewIds.length > 0) {
      await enqueueAutomaticReviewResponseJobs(connection.business_id, enqueueReviewIds);
    }

    return {
      newReviewIds,
      skipped: result.reviews.length - reviewsToUpsert.length,
      synced: reviewsToUpsert.length,
    };
  } catch (error) {
    throw normalizeSyncFailure(error);
  }
}
