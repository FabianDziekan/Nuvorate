"use client";

import { useRouter } from "next/navigation";
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
  progressClassName?: string;
  progressVariant?: "light" | "dark";
  redirectTo: string;
};

export function AnalysisActionForm({
  buttonClassName = "button-primary",
  hasSummary,
  progressClassName = "mt-3",
  progressVariant = "light",
  redirectTo,
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
        setError("Nie udało się odświeżyć analizy");
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
        disabled={isRunning}
        className={`${buttonClassName} ${progressStatus !== "idle" || error ? "mt-3" : ""} disabled:cursor-wait disabled:opacity-70`}
      >
        {isRunning
          ? hasSummary
            ? "Odświeżanie analizy..."
            : "Generowanie analizy..."
          : hasSummary
            ? "Odśwież analizę"
            : "Wygeneruj analizę"}
      </button>
    </form>
  );
}
