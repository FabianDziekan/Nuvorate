"use client";

import { createPortal } from "react-dom";
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
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
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

  useEffect(() => {
    if (!isMobileEditorOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [isMobileEditorOpen]);

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
      if (window.matchMedia("(max-width: 768px)").matches) {
        setIsMobileEditorOpen(true);
      }
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
    <article className="relative rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5 shadow-[0_8px_30px_rgba(15,15,16,0.025)] transition duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-card min-[769px]:p-5">
      <div className="flex flex-col justify-between gap-2 min-[769px]:gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-brand shadow-sm min-[769px]:h-10 min-[769px]:w-10">
            {authorName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{authorName}</p>
            <p className="mt-0.5 text-[11px] text-black/35">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 max-[768px]:absolute max-[768px]:right-3.5 max-[768px]:top-3.5">
          <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold min-[769px]:inline-flex ${details.className}`}>
            {details.label}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm min-[769px]:px-3 min-[769px]:py-1.5 min-[769px]:text-sm ${
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

      <p className="mt-3 line-clamp-2 pr-4 text-sm leading-5 text-black/60 min-[769px]:mt-5 min-[769px]:pr-0 min-[769px]:leading-6">{content}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 min-[769px]:mt-6">
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
          className="hidden h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand min-[769px]:inline-flex"
        >
          Napisz ręcznie
        </button>
        <button
          type="button"
          disabled={!responseText}
          onClick={handleCopy}
          className="hidden h-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-semibold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 min-[769px]:inline-flex"
        >
          Kopiuj
        </button>
        <button
          type="button"
          onClick={() => setIsMobileEditorOpen(true)}
          className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-black/[0.08] bg-white text-lg text-black/40 transition hover:border-brand/30 hover:text-brand min-[769px]:hidden"
          aria-label="Otwórz szczegóły odpowiedzi"
        >
          ›
        </button>
      </div>

      {isGenerating && (
        <AiGenerationProgress
          className="mt-4 min-[769px]:mt-4"
          messages={responseProgressMessages}
          status={progressStatus}
          title="Generowanie odpowiedzi..."
        />
      )}

      {toast && (
        <div className="mt-3 rounded-xl border border-brand/10 bg-brand-soft p-3 text-xs font-semibold leading-5 text-brand transition duration-300 min-[769px]:mt-4">
          {toast}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium leading-5 text-red-600 min-[769px]:mt-4">
          {error}
        </div>
      )}

      {isEditorOpen && (
        <div className="mt-4 hidden transition duration-300 min-[769px]:block">
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

      {isMobileEditorOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] bg-ink/20 min-[769px]:hidden"
              role="presentation"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) setIsMobileEditorOpen(false);
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-label={`Odpowiedź dla ${authorName}`}
                className="mobile-bottom-sheet-enter fixed inset-x-0 bottom-0 z-[111] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] border border-black/[0.06] bg-white shadow-[0_-16px_60px_rgba(15,15,16,0.2)]"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">Odpowiedź na opinię</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight">{authorName}</h2>
                    </div>
                    <button type="button" onClick={() => setIsMobileEditorOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-lg text-black/45 transition hover:bg-black/[0.04] hover:text-ink" aria-label="Zamknij szczegóły odpowiedzi">×</button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${details.className}`}>{details.label}</span>
                      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">{rating.toLocaleString("pl-PL", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} ★</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-black/60">{content}</p>
                  </div>
                  <textarea name="responseText" value={responseText} onChange={(event) => setResponseText(event.target.value)} rows={5} className="mt-4 w-full resize-none rounded-2xl border border-black/[0.08] bg-white p-4 text-sm leading-6 text-ink outline-none transition placeholder:text-black/30 focus:border-brand/30 focus:ring-4 focus:ring-brand/10" placeholder="Wpisz odpowiedź dla klienta..." />
                  {error ? <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium leading-5 text-red-600">{error}</div> : null}
                </div>
                <div className="flex flex-wrap gap-2 border-t border-black/[0.06] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
                  <button type="button" disabled={isSaving} onClick={handleSave} className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4D4EE8] disabled:cursor-wait disabled:opacity-60">{isSaving ? "Zapisywanie..." : "Zapisz"}</button>
                  <button type="button" disabled={isMarkingResponded} onClick={handleResponded} className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-black/55 transition hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60">{isMarkingResponded ? "Oznaczanie..." : "Odpowiedziano"}</button>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </article>
  );
}
