import { NextResponse } from "next/server";

import {
  claimAutomaticGooglePublicationJobs,
  processAutomaticGooglePublicationJob,
} from "@/lib/automatic-google-publication-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const AUTOMATIC_PUBLICATION_BATCH_SIZE = 5;

function isAuthorized(request: Request) {
  const secret = process.env.GOOGLE_REVIEW_SYNC_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let jobs;
  try {
    jobs = await claimAutomaticGooglePublicationJobs(AUTOMATIC_PUBLICATION_BATCH_SIZE);
  } catch {
    return NextResponse.json({ error: "Unable to prepare automatic Google publications." }, { status: 500 });
  }

  let completed = 0;
  let retryableFailed = 0;
  let terminalFailed = 0;
  let skipped = 0;
  for (const job of jobs) {
    try {
      const result = await processAutomaticGooglePublicationJob(job);
      if (result === "completed") completed += 1;
      else if (result === "retryable_failed") retryableFailed += 1;
      else if (result === "terminal_failed") terminalFailed += 1;
      else skipped += 1;
    } catch {
      retryableFailed += 1;
    }
  }

  return NextResponse.json({ claimed: jobs.length, completed, retryableFailed, terminalFailed, skipped, success: true });
}
