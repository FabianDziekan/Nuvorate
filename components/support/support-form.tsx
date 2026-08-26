"use client";

import { FormEvent, useRef, useState } from "react";
import { supportAttachmentLimitBytes, supportCategories } from "@/lib/support-request";

const supportedAttachmentTypes = new Set(["image/png", "image/jpeg", "application/pdf"]);

export function SupportForm() {
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submissionInFlight = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const attachment = formData.get("attachment");
    if (attachment instanceof File && attachment.size > 0) {
      if (!supportedAttachmentTypes.has(attachment.type) || attachment.size > supportAttachmentLimitBytes) {
        setStatus({ type: "error", message: "Załącznik musi być plikiem PNG, JPG/JPEG lub PDF i mieć maksymalnie 5 MB." });
        return;
      }
    }

    submissionInFlight.current = true;
    setSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/support", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        setStatus({ type: "error", message: typeof payload?.error === "string" ? payload.error : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę." });
        return;
      }
      form.reset();
      setStatus({ type: "success", message: "Zgłoszenie zostało wysłane" });
    } catch {
      setStatus({ type: "error", message: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę." });
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-7">
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Kategoria <span className="text-brand">*</span>
          <select name="category" required defaultValue="" className="h-11 rounded-xl border border-black/[0.1] bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15">
            <option value="" disabled>Wybierz kategorię</option>
            {supportCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Temat <span className="text-brand">*</span>
          <input name="subject" type="text" required maxLength={150} className="h-11 rounded-xl border border-black/[0.1] px-3 text-sm font-medium text-ink outline-none transition placeholder:text-black/30 focus:border-brand/50 focus:ring-2 focus:ring-brand/15" placeholder="Krótko opisz temat zgłoszenia" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Opis problemu <span className="text-brand">*</span>
          <textarea name="description" required minLength={10} maxLength={5000} rows={7} className="resize-y rounded-xl border border-black/[0.1] px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-black/30 focus:border-brand/50 focus:ring-2 focus:ring-brand/15" placeholder="Opisz pytanie lub problem. Im więcej szczegółów podasz, tym szybciej będziemy mogli pomóc." />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Załącznik <span className="font-normal text-black/40">— opcjonalnie</span>
          <input name="attachment" type="file" accept="image/png,image/jpeg,application/pdf" className="block w-full cursor-pointer rounded-xl border border-dashed border-black/[0.12] bg-[#FAFAFC] px-3 py-3 text-sm text-black/55 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand" />
          <span className="text-xs font-normal leading-5 text-black/40">PNG, JPG/JPEG lub PDF, maksymalnie 5 MB.</span>
        </label>
      </div>
      {status ? <p className={`mt-5 rounded-xl px-3 py-2.5 text-sm font-medium ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">{status.message}</p> : null}
      <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm leading-6 text-black/45">Odpowiedź otrzymasz drogą mailową.</p>
        <button type="submit" disabled={submitting} className="button-primary min-h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Wysyłanie…" : "Wyślij zgłoszenie"}
        </button>
      </div>
    </form>
  );
}
