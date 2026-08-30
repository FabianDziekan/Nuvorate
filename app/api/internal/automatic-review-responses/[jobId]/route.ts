import { NextResponse } from "next/server";

import {
  claimSpecificAutomaticReviewResponseJob,
  processAutomaticReviewResponseJob,
} from "@/lib/automatic-review-response-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isAuthorized(request: Request) {
  const secret = process.env.GOOGLE_REVIEW_SYNC_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  if (!UUID_PATTERN.test(jobId)) {
    return NextResponse.json({ error: "Invalid automatic response job." }, { status: 400 });
  }

  let job;
  try {
    job = await claimSpecificAutomaticReviewResponseJob(jobId);
  } catch {
    return NextResponse.json({ error: "Unable to prepare the requested automatic response job." }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ error: "The requested automatic response job is unavailable." }, { status: 409 });
  }

  try {
    const result = await processAutomaticReviewResponseJob(job);
    return NextResponse.json({ claimed: 1, completed: result === "completed" ? 1 : 0, failed: 0, skipped: result === "skipped" ? 1 : 0, success: true });
  } catch {
    return NextResponse.json({ claimed: 1, completed: 0, failed: 1, skipped: 0, success: true });
  }
}
