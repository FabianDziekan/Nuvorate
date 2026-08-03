"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type BillingStatus = {
  isActivated: boolean;
};

export function CheckoutActivationStatus() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDelayed, setIsDelayed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Nie udało się sprawdzić statusu subskrypcji.");
      }

      const status = (await response.json()) as BillingStatus;

      if (status.isActivated) {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Checkout activation status check failed", error);
      setErrorMessage("Nie udało się sprawdzić statusu. Spróbuj ponownie.");
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void checkStatus();
    }, 2000);
    const delayedTimer = window.setTimeout(() => {
      setIsDelayed(true);
    }, 5000);
    const timeoutTimer = window.setTimeout(() => {
      setIsTimedOut(true);
      window.clearInterval(interval);
    }, 60000);

    void checkStatus();

    return () => {
      window.clearTimeout(delayedTimer);
      window.clearTimeout(timeoutTimer);
      window.clearInterval(interval);
    };
  }, [checkStatus]);

  return (
    <div className="mt-8 rounded-[28px] border border-brand/15 bg-brand-soft p-6 text-center sm:p-8">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
        Aktywujemy Twój plan...
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/55">
        {isTimedOut
          ? "Płatność została przyjęta, ale aktywacja trwa dłużej niż zwykle."
          : isDelayed
          ? "Płatność została przyjęta, ale aktywacja planu może potrwać chwilę."
          : "Czekamy na potwierdzenie płatności ze Stripe. To zwykle trwa kilka sekund."}
      </p>
      {errorMessage && (
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-brand">
          {errorMessage}
        </p>
      )}
      <button
        type="button"
        onClick={() => void checkStatus()}
        disabled={isChecking}
        className="button-primary mx-auto mt-6 w-fit px-6"
      >
        {isChecking ? "Sprawdzam..." : "Odśwież status"}
      </button>
      {isTimedOut && (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-black/45 sm:flex-row">
          <a href="mailto:kontakt@nuvorate.pl" className="hover:text-ink">
            Skontaktuj się z nami
          </a>
          <span className="hidden sm:inline">•</span>
          <span>Możesz też wylogować się poniżej.</span>
        </div>
      )}
    </div>
  );
}
