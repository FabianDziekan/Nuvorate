import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireActiveBusinessForUser } from "@/lib/active-business";
import {
  claimGoogleReviewSyncConnections,
  completeGoogleReviewSync,
  failGoogleReviewSync,
  syncClaimedGoogleReviewConnection,
} from "@/lib/google-review-sync-service";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MANUAL_SYNC_LEASE_SECONDS = 10 * 60;

export async function POST() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Zaloguj się, aby pobrać opinie Google." }, { status: 401 });
  }

  let businessId: string;
  try {
    businessId = (await requireActiveBusinessForUser(supabase, user.id, "id", "manage")).business.id;
  } catch {
    return NextResponse.json({ error: "Nie masz dostępu do aktywnej lokalizacji." }, { status: 403 });
  }

  let connection;
  try {
    const claimedConnections = await claimGoogleReviewSyncConnections({
      businessId,
      leaseSeconds: MANUAL_SYNC_LEASE_SECONDS,
      leaseToken: randomUUID(),
      limit: 1,
    });
    connection = claimedConnections[0];
  } catch {
    return NextResponse.json({ error: "Nie udało się przygotować synchronizacji Google. Spróbuj ponownie później." }, { status: 500 });
  }

  if (!connection) {
    return NextResponse.json({ error: "Brak aktywnego połączenia Google lub synchronizacja tej lokalizacji już trwa." }, { status: 409 });
  }

  try {
    const result = await syncClaimedGoogleReviewConnection(connection);
    await completeGoogleReviewSync(connection);

    return NextResponse.json({
      success: true,
      skipped: result.skipped,
      synced: result.synced,
    });
  } catch (error) {
    try {
      await failGoogleReviewSync(connection, error);
    } catch {
      // The original sync error stays private; the lease will expire safely if persistence failed.
    }

    return NextResponse.json({ error: "Nie udało się pobrać opinii z Google. Spróbuj ponownie później." }, { status: 502 });
  }
}
