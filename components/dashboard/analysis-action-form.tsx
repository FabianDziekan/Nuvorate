"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { generateBusinessAnalysis } from "@/app/dashboard/actions";
import {
  AiGenerationProgress,
  analysisProgressMessages,
  type AiGenerationProgressStatus,
} from "@/components/ui/ai-generation-progress";

type AnalysisActionFormProps = {
  buttonClassName?: string;
  hasSummary: boolean;
  isLimitReached?: boolean;
  progressClassName?: string;
  progressVariant?: "light" | "dark";
  redirectTo: string;
  showLimitDetails?: boolean;
  usageLabel?: string;
};

export function AnalysisActionForm({
  buttonClassName = "button-primary",
  hasSummary,
  isLimitReached = false,
  progressClassName = "mt-3",
  progressVariant = "light",
  redirectTo,
  showLimitDetails = true,
  usageLabel,
}: AnalysisActionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [progressStatus, setProgressStatus] =
    useState<AiGenerationProgressStatus>("idle");
  const [error, setError] = useState("");
  const isRunning = isPending || progressStatus === "running";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLimitReached) {
      return;
    }

    setError("");
    setProgressStatus("running");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        console.info("[NuvoRate analysis] before server action", {
          redirectTo,
        });
        await generateBusinessAnalysis(formData);
        console.info("[NuvoRate analysis] after server action", {
          redirectTo,
        });
        setProgressStatus("complete");
        router.refresh();

        window.setTimeout(() => {
          setProgressStatus("idle");
          formRef.current?.reset();
        }, 800);
      } catch (analysisError) {
        console.error("[NuvoRate analysis] server action failed", {
          error: analysisError,
          redirectTo,
        });
        setProgressStatus("idle");
        setError("Nie udało się wygenerować analizy. Spróbuj ponownie.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <AiGenerationProgress
        className={progressClassName}
        completeMessage="Analiza gotowa"
        messages={analysisProgressMessages}
        status={progressStatus}
        title={hasSummary ? "Odświeżamy analizę..." : "Generujemy analizę..."}
        variant={progressVariant}
      />
      {error && (
        <div
          className={`mt-3 rounded-xl border p-3 text-xs font-semibold leading-5 ${
            progressVariant === "dark"
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isRunning || isLimitReached}
        className={`${buttonClassName} ${progressStatus !== "idle" || error ? "mt-3" : ""} disabled:opacity-60 ${
          isLimitReached ? "cursor-not-allowed" : "disabled:cursor-wait"
        }`}
      >
        {isLimitReached
          ? "Limit analiz wykorzystany"
          : isRunning
          ? hasSummary
            ? "Odświeżanie analizy..."
            : "Generowanie analizy..."
          : hasSummary
            ? "Odśwież analizę"
            : "Wygeneruj analizę"}
      </button>
      {isLimitReached && showLimitDetails ? (
        <div
          className={`mt-3 rounded-xl border p-3 ${
            progressVariant === "dark"
              ? "border-white/10 bg-white/[0.04]"
              : "border-black/[0.06] bg-[#FAFAFC]"
          }`}
        >
          <p
            className={`text-xs leading-5 ${
              progressVariant === "dark" ? "text-white/55" : "text-black/45"
            }`}
          >
            {usageLabel ?? "Wykorzystano 1 z 1 analiz w tym miesiącu"}
          </p>
          <Link
            href="/checkout?plan=business"
            className="mt-2 inline-flex min-h-9 items-center justify-center rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white outline-none transition hover:bg-brand-dark focus-visible:ring-4 focus-visible:ring-brand/25"
          >
            Przejdź na Business
          </Link>
        </div>
      ) : null}
    </form>
  );
}
