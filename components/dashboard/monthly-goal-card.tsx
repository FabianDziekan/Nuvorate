"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateMonthlyReviewGoal } from "@/app/dashboard/actions";

type MonthlyGoalCardProps = {
  count: number;
  goal: number;
  helperText: string;
  progress: number;
  reached: boolean;
};

export function MonthlyGoalCard({
  count,
  goal,
  helperText,
  progress,
  reached,
}: MonthlyGoalCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(goal));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isPending, startTransition] = useTransition();

  function cancelEdit() {
    if (isPending) {
      return;
    }

    setIsEditing(false);
    setError("");
    setInputValue(String(goal));
  }

  function startEdit() {
    setIsEditing(true);
    setError("");
    setInputValue(String(goal));
  }

  function saveGoal() {
    const nextGoal = Number(inputValue);

    if (!Number.isFinite(nextGoal) || nextGoal < 1 || nextGoal > 1000) {
      setError("Podaj wartość od 1 do 1000.");
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await updateMonthlyReviewGoal(nextGoal);

      if (!result.success) {
        setError(result.error ?? "Podaj wartość od 1 do 1000.");
        return;
      }

      setIsEditing(false);
      setToast("Cel zapisany");
      router.refresh();
      window.setTimeout(() => setToast(""), 2200);
    });
  }

  return (
    <article
      role={isEditing ? undefined : "button"}
      tabIndex={isEditing ? undefined : 0}
      onClick={isEditing ? undefined : startEdit}
      onKeyDown={(event) => {
        if (isEditing) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startEdit();
        }
      }}
      className={`min-h-[188px] rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4 focus:outline-none focus:ring-4 focus:ring-brand/10 ${
        isEditing ? "" : "cursor-pointer hover:border-brand/30"
      }`}
    >
      {isEditing ? (
        <>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
            Cel miesiąca
          </p>
          <label
            className="mt-3 block space-y-2"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="text-xs font-semibold text-black/45">
              Miesięczny cel opinii
            </span>
            <input
              type="number"
              min={1}
              max={1000}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
            />
          </label>
          {error ? (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-black/45">
              Podaj wartość od 1 do 1000.
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                cancelEdit();
              }}
              disabled={isPending}
              className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-semibold text-black/50 hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                saveGoal();
              }}
              disabled={isPending}
              className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-[#4D4EE8] disabled:cursor-wait disabled:opacity-70"
            >
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/35">
            Cel miesiąca
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-lg font-semibold tracking-tight">
              {count} / {goal} opinii
            </p>
            {reached && (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                Cel osiągnięty
              </span>
            )}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.07]">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-black/45">{helperText}</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              startEdit();
            }}
            className="mt-2 text-xs font-semibold text-brand"
          >
            Edytuj cel
          </button>
          {toast ? (
            <p className="mt-2 text-xs font-semibold text-brand">{toast}</p>
          ) : null}
        </>
      )}
    </article>
  );
}
