import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  claimGoogleReviewSyncConnections,
  completeGoogleReviewSync,
  failGoogleReviewSync,
  syncClaimedGoogleReviewConnection,
} from "@/lib/google-review-sync-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const AUTOMATIC_SYNC_BATCH_SIZE = 5;
const AUTOMATIC_SYNC_LEASE_SECONDS = 10 * 60;

function isAuthorized(request: Request) {
  const secret = process.env.GOOGLE_REVIEW_SYNC_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let connections;
  try {
    connections = await claimGoogleReviewSyncConnections({
      leaseSeconds: AUTOMATIC_SYNC_LEASE_SECONDS,
      leaseToken: randomUUID(),
      limit: AUTOMATIC_SYNC_BATCH_SIZE,
    });
  } catch {
    return NextResponse.json({ error: "Unable to prepare Google review synchronization." }, { status: 500 });
  }

  let synced = 0;
  let failed = 0;

  for (const connection of connections) {
    try {
      await syncClaimedGoogleReviewConnection(connection);
      await completeGoogleReviewSync(connection);
      synced += 1;
    } catch (error) {
      failed += 1;
      try {
        await failGoogleReviewSync(connection, error);
      } catch {
        // Do not stop the rest of the batch. The lease expires if its state cannot be persisted.
      }
    }
  }

  return NextResponse.json({
    claimed: connections.length,
    failed,
    success: true,
    synced,
  });
}
