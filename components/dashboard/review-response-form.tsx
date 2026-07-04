"use client";

import { useActionState } from "react";
import { generateReviewResponse } from "@/app/dashboard/review-response-actions";
import {
  AiGenerationProgress,
  responseProgressMessages,
} from "@/components/ui/ai-generation-progress";
import type { GenerateReviewResponseState } from "./review-response-state";

function SubmitButton({
  hasResponse,
  pending,
}: {
  hasResponse: boolean;
  pending: boolean;
}) {
  return (
    <div>
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-semibold text-brand transition hover:text-[#4D4EE8] disabled:cursor-wait disabled:opacity-60"
      >
        {pending
          ? "Generowanie odpowiedzi..."
          : hasResponse
            ? "Wygeneruj ponownie"
            : "Wygeneruj odpowiedź"}
      </button>
      <AiGenerationProgress
        className="mt-3"
        messages={responseProgressMessages}
        status={pending ? "running" : "idle"}
        title="Generowanie odpowiedzi..."
      />
    </div>
  );
}

export function ReviewResponseForm({
  reviewId,
  initialResponseText,
  isReplyLimitReached = false,
}: {
  reviewId: string;
  initialResponseText?: string | null;
  isReplyLimitReached?: boolean;
}) {
  const trimmedInitialResponse =
    typeof initialResponseText === "string"
      ? initialResponseText.trim()
      : "";
  const initialState: GenerateReviewResponseState = {
    ok: Boolean(trimmedInitialResponse),
    responseText: trimmedInitialResponse || undefined,
  };
  const [state, formAction, isPending] = useActionState(
    generateReviewResponse,
    initialState,
  );
  const responseText =
    typeof state.responseText === "string" ? state.responseText.trim() : "";
  const error = typeof state.error === "string" ? state.error.trim() : "";

  return (
    <>
      {responseText && (
        <div className="mt-4 rounded-xl border border-brand/10 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">
            Proponowana odpowiedź
          </p>
          <p className="mt-2 text-xs leading-5 text-black/55">
            {responseText}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium leading-5 text-red-600">
          {error}
        </div>
      )}
      {isReplyLimitReached ? (
        <p className="mt-4 text-xs font-semibold text-black/35">
          Limit odpowiedzi wykorzystany
        </p>
      ) : (
        <form action={formAction} className="mt-4">
          <input type="hidden" name="reviewId" value={reviewId} />
          <SubmitButton hasResponse={Boolean(responseText)} pending={isPending} />
        </form>
      )}
    </>
  );
}
