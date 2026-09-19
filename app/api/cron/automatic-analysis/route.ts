import { NextResponse } from "next/server";

import {
  AUTOMATIC_ANALYSIS_BATCH_SIZE,
  claimAutomaticAnalysisSchedules,
  getDueAutomaticAnalysisScheduleCount,
  processAutomaticAnalysisSchedule,
} from "@/lib/automatic-business-analysis-worker";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.AUTOMATIC_ANALYSIS_WORKER_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  return Boolean(secret && authorization === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let schedules;
  let completed = 0;
  let failed = 0;
  let due = 0;
  let retried = 0;
  let skippedForLimit = 0;
  let skipped = 0;

  try {
    due = await getDueAutomaticAnalysisScheduleCount();
    schedules = await claimAutomaticAnalysisSchedules(AUTOMATIC_ANALYSIS_BATCH_SIZE);
  } catch {
    return NextResponse.json(
      { error: "Unable to prepare automatic analyses." },
      { status: 500 },
    );
  }

  for (const schedule of schedules) {
    try {
      const result = await processAutomaticAnalysisSchedule(schedule);
      if (result === "completed") completed += 1;
      else if (result === "retry") retried += 1;
      else if (result === "limit") skippedForLimit += 1;
      else skipped += 1;
    } catch {
      failed += 1;
    }
  }

  const summary = {
    claimed: schedules.length,
    completed,
    due,
    failed,
    retried,
    skipped,
    skippedForLimit,
  };
  console.info("Automatic analysis worker finished", summary);
  return NextResponse.json({ ...summary, success: true });
}
