"use client";

import { useActionState, useEffect, useState } from "react";
import { generateReviewResponse } from "@/app/dashboard/review-response-actions";
import {
  AiGenerationProgress,
  responseProgressMessages,
} from "@/components/ui/ai-generation-progress";
import type { GenerateReviewResponseState } from "./review-response-state";

function SubmitButton({
  hasResponse,
  pending,
  responseText,
  setToast,
}: {
  hasResponse: boolean;
  pending: boolean;
  responseText: string;
  setToast: (toast: string) => void;
}) {
  async function handleCopy() {
    if (!responseText) {
      return;
    }

    await navigator.clipboard.writeText(responseText);
    setToast("Skopiowano odpowiedź");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
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
        {hasResponse && (
          <button
            type="button"
            disabled={pending}
            onClick={handleCopy}
            className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/50 transition hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60"
          >
            Kopiuj
          </button>
        )}
      </div>
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
  const [toast, setToast] = useState("");
  const responseText =
    typeof state.responseText === "string" ? state.responseText.trim() : "";
  const error = typeof state.error === "string" ? state.error.trim() : "";

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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
      {toast && (
        <div className="mt-3 rounded-xl border border-brand/10 bg-brand-soft p-3 text-xs font-semibold leading-5 text-brand">
          {toast}
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
          <SubmitButton
            hasResponse={Boolean(responseText)}
            pending={isPending}
            responseText={responseText}
            setToast={setToast}
          />
        </form>
      )}
    </>
  );
}
