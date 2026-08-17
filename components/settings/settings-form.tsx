"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings } from "@/app/settings/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type SettingsFormProps = { business: { industry: string; name: string }; firstName: string; responseTone: string };
type MobileSection = "owner" | "business" | "tone" | null;

const responseToneOptions = [
  { label: "Profesjonalny", value: "professional" },
  { label: "Przyjazny", value: "friendly" },
  { label: "Krótki", value: "short" },
  { label: "Premium", value: "premium" },
];

const initialState = { ok: false, error: "", message: "" };

function MobileRow({ label, value, open, onClick }: { label: string; value: string; open: boolean; onClick: () => void }) {
  return <button type="button" className="flex w-full items-center gap-3 px-4 py-4 text-left min-[769px]:hidden" onClick={onClick} aria-expanded={open}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-semibold text-brand" aria-hidden="true">{label.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{label}</span><span className="mt-0.5 block truncate text-xs text-black/45">{value}</span></span><span className={`text-brand transition-transform duration-200 ${open ? "rotate-90" : ""}`} aria-hidden="true">›</span></button>;
}

function MobileSave({ pending }: { pending: boolean }) {
  return <button type="submit" disabled={pending} className="mt-4 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4D4EE8] disabled:cursor-wait disabled:opacity-65 min-[769px]:hidden">{pending ? "Zapisywanie..." : "Zapisz zmiany"}</button>;
}

export function SettingsForm({ business, firstName, responseTone }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);
  const [toast, setToast] = useState("");
  const [openSection, setOpenSection] = useState<MobileSection>(null);
  const toneLabel = responseToneOptions.find((option) => option.value === responseTone)?.label ?? "Profesjonalny";
  const toggle = (section: Exclude<MobileSection, null>) => setOpenSection((current) => current === section ? null : section);

  useEffect(() => {
    if (!state?.ok) return;
    setToast(state.message || "Ustawienia zapisane");
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [state]);

  return <form action={formAction} className="space-y-6 max-[768px]:space-y-4">
    {toast ? <div className="rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand shadow-sm">{toast}</div> : null}
    {state?.error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">{state.error}</div> : null}

    <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35 max-[768px]:block">Profil</p>
    <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card min-[769px]:p-5 sm:p-6">
      <MobileRow label="Dane właściciela" value={firstName || "Uzupełnij imię"} open={openSection === "owner"} onClick={() => toggle("owner")} />
      <div className={`overflow-hidden min-[769px]:block ${openSection === "owner" ? "max-[768px]:block" : "max-[768px]:hidden"}`}>
        <div className="border-t border-black/[0.06] p-4 min-[769px]:border-0 min-[769px]:p-0">
          <div className="hidden flex-col gap-2 min-[769px]:flex"><p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">Konto</p><h2 className="text-xl font-semibold tracking-tight">Dane właściciela</h2><p className="max-w-2xl text-sm leading-6 text-black/45">Imię wykorzystujemy w powitaniu i elementach konta, aby panel był bardziej osobisty.</p></div>
          <label className="block max-w-md space-y-2 min-[769px]:mt-6"><span className="text-xs font-semibold text-black/45">Imię</span><input name="firstName" defaultValue={firstName} className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10" maxLength={40} minLength={2} placeholder="Fabian" required /></label>
          <MobileSave pending={isPending} />
        </div>
      </div>
    </section>

    <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card min-[769px]:p-5 sm:p-6">
      <MobileRow label="Dane firmy" value={business.name || "Uzupełnij dane firmy"} open={openSection === "business"} onClick={() => toggle("business")} />
      <div className={`overflow-hidden min-[769px]:block ${openSection === "business" ? "max-[768px]:block" : "max-[768px]:hidden"}`}>
        <div className="border-t border-black/[0.06] p-4 min-[769px]:border-0 min-[769px]:p-0">
          <div className="hidden flex-col gap-2 min-[769px]:flex"><p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">Profil firmy</p><h2 className="text-xl font-semibold tracking-tight">Dane widoczne w NuvoRate</h2><p className="max-w-2xl text-sm leading-6 text-black/45">Te informacje pomagają dopasować panel, odpowiedzi i przyszłe automatyzacje do Twojej firmy.</p></div>
          <div className="grid gap-4 min-[769px]:mt-6 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-semibold text-black/45">Nazwa firmy</span><input name="name" defaultValue={business.name} className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10" required /></label><label className="space-y-2"><span className="text-xs font-semibold text-black/45">Branża</span><input name="industry" defaultValue={business.industry} className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10" required /></label></div>
          <MobileSave pending={isPending} />
        </div>
      </div>
    </section>

    <p className="hidden pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35 max-[768px]:block">Odpowiedzi</p>
    <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-card min-[769px]:p-5 sm:p-6">
      <MobileRow label="Domyślny ton komunikacji" value={toneLabel} open={openSection === "tone"} onClick={() => toggle("tone")} />
      <div className={`overflow-hidden min-[769px]:block ${openSection === "tone" ? "max-[768px]:block" : "max-[768px]:hidden"}`}>
        <div className="border-t border-black/[0.06] p-4 min-[769px]:border-0 min-[769px]:p-0">
          <div className="hidden min-[769px]:block"><p className="text-xs font-medium uppercase tracking-[0.12em] text-black/35">Styl odpowiedzi</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Domyślny ton komunikacji</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">Wybrany styl będzie domyślnie używany podczas generowania odpowiedzi na opinie.</p></div>
          <label className="block max-w-md space-y-2 min-[769px]:mt-5"><span className="text-xs font-semibold text-black/45">Preferowany styl</span><select name="responseTone" defaultValue={responseTone} className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-sm outline-none transition focus:border-brand/30 focus:bg-white focus:ring-4 focus:ring-brand/10">{responseToneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <MobileSave pending={isPending} />
        </div>
      </div>
    </section>

    <div className="min-[769px]:hidden"><p className="mb-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35">Wygląd</p><ThemeToggle /></div>
    <div className="max-[768px]:hidden"><ThemeToggle /></div>
    <div className="sticky bottom-4 z-10 hidden justify-end min-[769px]:flex"><button type="submit" disabled={isPending} className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-[#4D4EE8] disabled:cursor-wait disabled:opacity-65">{isPending ? "Zapisywanie..." : "Zapisz ustawienia"}</button></div>
  </form>;
}
