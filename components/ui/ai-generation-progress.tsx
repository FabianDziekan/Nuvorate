"use client";

import { useEffect, useState } from "react";

export type AiGenerationProgressStatus = "idle" | "running" | "complete";

type AiGenerationProgressProps = {
  className?: string;
  completeMessage?: string;
  messages: string[];
  status: AiGenerationProgressStatus;
  title: string;
  variant?: "light" | "dark";
};

export const analysisProgressMessages = [
  "Analizujemy opinie...",
  "Tworzymy podsumowanie...",
  "Finalizujemy analizę...",
];

export const responseProgressMessages = [
  "Analizujemy opinię...",
  "Tworzymy odpowiedź...",
  "Finalizujemy...",
];

export function AiGenerationProgress({
  className = "",
  completeMessage = "Gotowe",
  messages,
  status,
  title,
  variant = "light",
}: AiGenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (status === "idle") {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    if (status === "complete") {
      setProgress(100);
      setMessageIndex(messages.length - 1);
      return;
    }

    setProgress(8);
    setMessageIndex(0);

    const progressInterval = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress < 25) {
          return Math.min(25, currentProgress + 4);
        }

        if (currentProgress < 60) {
          return Math.min(60, currentProgress + 3);
        }

        if (currentProgress < 90) {
          return Math.min(90, currentProgress + 1.5);
        }

        return currentProgress;
      });
    }, 220);

    const messageInterval = window.setInterval(() => {
      setMessageIndex((currentIndex) =>
        Math.min(messages.length - 1, currentIndex + 1),
      );
    }, 1100);

    return () => {
      window.clearInterval(progressInterval);
      window.clearInterval(messageInterval);
    };
  }, [messages.length, status]);

  if (status === "idle") {
    return null;
  }

  const dark = variant === "dark";
  const currentMessage =
    status === "complete" ? completeMessage : messages[messageIndex];

  return (
    <div
      className={`${dark ? "border-white/10 bg-white/[0.04]" : "border-brand/10 bg-white"} rounded-2xl border p-4 transition duration-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold ${dark ? "text-white" : "text-ink"}`}>
          {title}
        </p>
        <p className={`text-[11px] font-semibold ${dark ? "text-[#B6B7FF]" : "text-brand"}`}>
          {Math.round(progress)}%
        </p>
      </div>
      <div
        className={`mt-3 h-2 overflow-hidden rounded-full ${
          dark ? "bg-white/10" : "bg-brand-soft"
        }`}
      >
        <div
          className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className={`mt-3 text-xs font-medium ${dark ? "text-white/45" : "text-black/45"}`}>
        {currentMessage}
      </p>
    </div>
  );
}
