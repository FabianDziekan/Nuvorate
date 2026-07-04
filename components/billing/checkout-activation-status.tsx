"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CheckoutActivationStatus() {
  const router = useRouter();
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      router.refresh();
    }, 2500);

    const delayedTimer = window.setTimeout(() => {
      setIsDelayed(true);
    }, 5000);

    return () => {
      window.clearTimeout(refreshTimer);
      window.clearTimeout(delayedTimer);
    };
  }, [router]);

  return (
    <div className="mt-8 rounded-[28px] border border-brand/15 bg-brand-soft p-6 text-center sm:p-8">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
        Aktywujemy Twój plan...
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/55">
        {isDelayed
          ? "Płatność została przyjęta, ale aktywacja planu może potrwać chwilę."
          : "Czekamy na potwierdzenie płatności ze Stripe. To zwykle trwa kilka sekund."}
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="button-primary mx-auto mt-6 w-fit px-6"
      >
        Odśwież status
      </button>
    </div>
  );
}
