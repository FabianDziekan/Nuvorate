import { NextResponse } from "next/server";

import { claimAutomaticReviewResponseJobs, processAutomaticReviewResponseJob } from "@/lib/automatic-review-response-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const AUTOMATIC_RESPONSE_BATCH_SIZE = 5;

function isAuthorized(request: Request) {
  const secret = process.env.GOOGLE_REVIEW_SYNC_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let jobs;
  try {
    jobs = await claimAutomaticReviewResponseJobs(AUTOMATIC_RESPONSE_BATCH_SIZE);
  } catch {
    return NextResponse.json({ error: "Unable to prepare automatic review responses." }, { status: 500 });
  }

  let completed = 0;
  let failed = 0;
  let skipped = 0;
  for (const job of jobs) {
    try {
      const result = await processAutomaticReviewResponseJob(job);
      if (result === "completed") completed += 1;
      else skipped += 1;
    } catch {
      failed += 1;
    }
  }
  return NextResponse.json({ claimed: jobs.length, completed, failed, skipped, success: true });
}
