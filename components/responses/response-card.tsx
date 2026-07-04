"use client";

import { useEffect, useState } from "react";
import {
  AiGenerationProgress,
  type AiGenerationProgressStatus,
  responseProgressMessages,
} from "@/components/ui/ai-generation-progress";

type ResponseStatus = "pending" | "ready" | "responded";

type ResponseCardProps = {
  authorName: string;
  content: string;
  createdAt: string;
  initialResponseText?: string | null;
  rating: number;
  reviewId: string;
  status: ResponseStatus;
};

type GeneratedResponsesEvent = CustomEvent<{
  generatedResponses: Array<{
    responseText: string;
    reviewId: string;
    status: ResponseStatus;
  }>;
}>;

const statusDetails: Record<ResponseStatus, { className: string; label: string }> = {
  pending: {
    className: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
    label: "Bez odpowiedzi",
  },
  ready: {
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    label: "Odpowiedź gotowa",
  },
  responded: {
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    label: "Odpowiedziano",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function readApiError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export function ResponseCard({
  authorName,
  content,
  createdAt,
  initialResponseText,
  rating,
  reviewId,
  status,
}: ResponseCardProps) {
  const trimmedInitialResponse =
    typeof initialResponseText === "string"
      ? initialResponseText.trim()
      : "";
  const [currentStatus, setCurrentStatus] = useState<ResponseStatus>(status);
  const [isEditorOpen, setIsEditorOpen] = useState(Boolean(trimmedInitialResponse));
  const [responseText, setResponseText] = useState(trimmedInitialResponse);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [progressStatus, setProgressStatus] =
    useState<AiGenerationProgressStatus>("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingResponded, setIsMarkingResponded] = useState(false);
  const details = statusDetails[currentStatus];

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    function handleGeneratedResponses(event: Event) {
      const generatedEvent = event as GeneratedResponsesEvent;
      const generatedResponse = generatedEvent.detail.generatedResponses.find(
        (response) => response.reviewId === reviewId,
      );

      if (!generatedResponse) {
        return;
      }

      setResponseText(generatedResponse.responseText);
      setCurrentStatus("ready");
      setIsEditorOpen(true);
      setToast("✓ Odpowiedź wygenerowana");
    }

    window.addEventListener(
      "nuvorate:responses-generated",
      handleGeneratedResponses,
    );

    return () => {
      window.removeEventListener(
        "nuvorate:responses-generated",
        handleGeneratedResponses,
      );
    };
  }, [reviewId]);

  async function handleGenerate() {
    setError("");
    setIsGenerating(true);
    setProgressStatus("running");

    try {
      const response = await fetch("/api/responses/generate", {
        body: JSON.stringify({ reviewId }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Nie udało się wygenerować odpowiedzi."),
        );
      }

      const data = await response.json();
      const generatedText =
        typeof data?.responseText === "string" ? data.responseText.trim() : "";

      if (!generatedText) {
        throw new Error("Nie udało się wygenerować odpowiedzi.");
      }

      setResponseText(generatedText);
      setCurrentStatus("ready");
      setIsEditorOpen(true);
      setToast("✓ Odpowiedź wygenerowana");
      setProgressStatus("complete");
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Nie udało się wygenerować odpowiedzi.",
      );
      setProgressStatus("idle");
    } finally {
      window.setTimeout(() => {
        setIsGenerating(false);
        setProgressStatus("idle");
      }, 300);
    }
  }

  async function handleSave() {
    if (!responseText.trim()) {
      setError("Wpisz treść odpowiedzi przed zapisem.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/responses/${reviewId}`, {
        body: JSON.stringify({ responseText }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Nie udało się zapisać."));
      }

      const data = await response.json();
      setResponseText(
        typeof data?.responseText === "string" ? data.responseText : responseText,
      );
      setCurrentStatus("ready");
      setIsEditorOpen(true);
      setToast("✓ Zapisano odpowiedź");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResponded() {
    setError("");
    setIsMarkingResponded(true);

    try {
      const response = await fetch(`/api/responses/${reviewId}/responded`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Nie udało się oznaczyć odpowiedzi."),
        );
      }

      setCurrentStatus("responded");
      setToast("✓ Oznaczono jako odpowiedziano");
    } catch (respondedError) {
      setError(
        respondedError instanceof Error
          ? respondedError.message
          : "Nie udało się oznaczyć odpowiedzi.",
      );
    } finally {
      setIsMarkingResponded(false);
    }
  }

  async function handleCopy() {
    if (!responseText) {
      return;
    }

    await navigator.clipboard.writeText(responseText);
    setToast("✓ Skopiowano do schowka");
  }

  return (
    <article className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-5 shadow-[0_8px_30px_rgba(15,15,16,0.025)] transition duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-card">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-brand shadow-sm">
            {authorName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{authorName}</p>
            <p className="mt-0.5 text-[11px] text-black/35">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${details.className}`}>
            {details.label}
          </span>
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm ${
              rating <= 2 ? "bg-red-50 text-red-600" : "bg-brand-soft text-brand"
            }`}
          >
            {rating.toLocaleString("pl-PL", {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            })}{" "}
            ★
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-black/60">{content}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#4D4EE8] disabled:cursor-wait disabled:opacity-60"
        >
          {responseText ? "Wygeneruj ponownie" : "Wygeneruj odpowiedź"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError("");
            setIsEditorOpen(true);
            if (!responseText) {
              setResponseText("");
            }
          }}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand"
        >
          Napisz ręcznie
        </button>
        <button
          type="button"
          disabled={!responseText}
          onClick={handleCopy}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          Kopiuj
        </button>
      </div>

      {isGenerating && (
        <AiGenerationProgress
          className="mt-4"
          messages={responseProgressMessages}
          status={progressStatus}
          title="Generowanie odpowiedzi..."
        />
      )}

      {toast && (
        <div className="mt-4 rounded-xl border border-brand/10 bg-brand-soft p-3 text-xs font-semibold leading-5 text-brand transition duration-300">
          {toast}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium leading-5 text-red-600">
          {error}
        </div>
      )}

      {responseText && (
        <div className="mt-5 rounded-2xl border border-brand/10 bg-brand-soft/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                Proponowana odpowiedź
              </p>
              <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-brand shadow-sm">
                AI
              </span>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-black/40 shadow-sm">
              {currentStatus === "responded" ? "Odpowiedź zapisana" : "Gotowa do użycia"}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/65">
            {responseText}
          </p>
        </div>
      )}

      {isEditorOpen && (
        <div className="mt-4 transition duration-300">
          <textarea
            name="responseText"
            value={responseText}
            onChange={(event) => setResponseText(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white p-4 text-sm leading-6 text-ink outline-none transition duration-200 placeholder:text-black/30 focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
            placeholder="Wpisz odpowiedź dla klienta..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-black/35">
              Odpowiedź możesz edytować przed użyciem poza NuvoRate.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving ? "Zapisywanie..." : "Zapisz"}
              </button>
              <button
                type="button"
                disabled={isMarkingResponded}
                onClick={handleResponded}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60"
              >
                {isMarkingResponded
                  ? "Oznaczanie..."
                  : "Oznacz jako odpowiedziano"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
