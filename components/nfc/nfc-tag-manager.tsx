"use client";

import { useActionState, useState } from "react";
import { createNfcTag, toggleNfcTag, updateNfcTag } from "@/app/nfc/actions";
import { CopyLinkButton } from "@/components/nfc/copy-link-button";
import type { NfcTagActionState } from "@/lib/nfc-types";

export type NfcTagSummary = {
  id: string;
  name: string;
  destinationUrl: string;
  publicUrl: string;
  isActive: boolean;
  scansLast30Days: number;
  scansTotal: number;
  lastScanLabel: string;
};

const initialState: NfcTagActionState = {};
const inputClass = "mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

function Feedback({ state }: { state: NfcTagActionState }) {
  return state.error || state.success ? <p role={state.error ? "alert" : "status"} className={`mt-3 text-sm font-medium ${state.error ? "text-red-600" : "text-emerald-600"}`}>{state.error ?? state.success}</p> : null;
}

function TagStatus({ active }: { active: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-black/[0.05] text-black/45"}`}>{active ? "Aktywna" : "Wyłączona"}</span>;
}

function NfcGlyph() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5"><path d="M3.5 9a12 12 0 0 1 17 0" /><path d="M6.75 12.5a7.5 7.5 0 0 1 10.5 0" /><path d="M10 16a3 3 0 0 1 4 0" /></svg>;
}

export function NfcTagManager({ tags }: { tags: NfcTagSummary[] }) {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<NfcTagSummary | null>(null);
  const [createState, createAction, creating] = useActionState(createNfcTag, initialState);
  const [updateState, updateAction, updating] = useActionState(updateNfcTag, initialState);
  const [toggleState, toggleAction, toggling] = useActionState(toggleNfcTag, initialState);
  const orderedTags = [...tags].sort((a, b) => b.scansLast30Days - a.scansLast30Days);

  return (
    <>
      <section className="mt-8 rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand"><NfcGlyph /></span><h2 className="mt-3 text-xl font-semibold tracking-tight">Plakietki NFC</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">Dodawaj plakietki, zapisuj na nich unikalne linki i sprawdzaj, które miejsca generują najwięcej skanów.</p></div>
          <button type="button" className="button-primary" onClick={() => setAdding(true)}>+ Dodaj plakietkę</button>
        </div>
        {orderedTags.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-black/[0.1] bg-[#FAFAFC] px-5 py-9 text-center"><p className="text-sm text-black/50">Nie masz jeszcze plakietek NFC.</p><button type="button" className="button-secondary mt-4" onClick={() => setAdding(true)}>Dodaj pierwszą plakietkę</button></div> : <div className="mt-6 divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">{orderedTags.map((tag) => <div key={tag.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4"><div className="min-w-[150px] flex-1"><p className="font-semibold">{tag.name}</p><div className="mt-2"><TagStatus active={tag.isActive} /></div></div><p className="text-sm text-black/55"><span className="font-semibold text-ink">{tag.scansLast30Days}</span> skanów / 30 dni</p><p className="text-sm text-black/45">{tag.scansTotal} łącznie</p><p className="text-sm text-black/45">Ostatni skan: {tag.lastScanLabel}</p><button type="button" className="button-secondary" onClick={() => setSelected(tag)}>Szczegóły</button></div>)}</div>}
      </section>

      {adding ? <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4" role="dialog" aria-modal="true" aria-label="Dodaj plakietkę NFC"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Dodaj plakietkę</h2><p className="mt-2 text-sm text-black/45">Utwórz indywidualny link NuvoRate dla wybranego miejsca.</p></div><button type="button" className="text-black/45 hover:text-ink" onClick={() => setAdding(false)} aria-label="Zamknij">×</button></div>{createState.createdTag ? <div className="mt-6"><p className="text-sm font-semibold text-emerald-600">Link dla „{createState.createdTag.name}” jest gotowy.</p><div className="mt-4 rounded-2xl bg-[#FAFAFC] p-4 break-all text-sm font-medium">{createState.createdTag.publicUrl}</div><div className="mt-4 flex flex-wrap gap-2"><CopyLinkButton value={createState.createdTag.publicUrl} /><a className="button-secondary" href={createState.createdTag.publicUrl} target="_blank" rel="noreferrer">Testuj link</a></div><ol className="mt-6 space-y-2 text-sm leading-6 text-black/55"><li>1. Otwórz aplikację do zapisu NFC na telefonie.</li><li>2. Wybierz pojedynczy rekord typu URL.</li><li>3. Wklej skopiowany link NuvoRate.</li><li>4. Zapisz go na plakietce.</li><li>5. Zbliż telefon i sprawdź przekierowanie do Google Reviews.</li></ol></div> : <form action={createAction} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Nazwa plakietki<input className={inputClass} name="name" defaultValue="Plakietka przy kasie" required maxLength={120} /></label><label className="block text-sm font-semibold">Link Google do wystawienia opinii<input className={inputClass} name="destinationUrl" type="url" placeholder="https://g.page/r/..." required /><span className="mt-2 block text-xs font-normal text-black/45">Wklej bezpośredni link Google, który otwiera formularz wystawienia opinii.</span></label><Feedback state={createState} /><button type="submit" className="button-primary" disabled={creating}>{creating ? "Tworzenie linku..." : "Utwórz link NFC"}</button></form>}</div></div> : null}

      {selected ? <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4" role="dialog" aria-modal="true" aria-label="Szczegóły plakietki"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><div><h2 className="text-xl font-semibold">{selected.name}</h2><div className="mt-2"><TagStatus active={selected.isActive} /></div></div><button type="button" className="text-black/45 hover:text-ink" onClick={() => setSelected(null)} aria-label="Zamknij">×</button></div><div className="mt-5 rounded-2xl bg-[#FAFAFC] p-4 break-all text-sm font-medium">{selected.publicUrl}<div className="mt-3 flex gap-2"><CopyLinkButton value={selected.publicUrl} /><a href={selected.publicUrl} target="_blank" rel="noreferrer" className="button-secondary">Testuj link</a></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Skany / 30 dni", selected.scansLast30Days], ["Skany łącznie", selected.scansTotal], ["Ostatni skan", selected.lastScanLabel]].map(([label, value]) => <div key={label as string} className="rounded-2xl bg-[#FAFAFC] p-4"><p className="text-xs text-black/40">{label as string}</p><p className="mt-2 text-sm font-semibold">{value as string | number}</p></div>)}</div><form action={updateAction} className="mt-5 grid gap-4 sm:grid-cols-2"><input type="hidden" name="tagId" value={selected.id} /><label className="text-sm font-semibold">Nazwa<input className={inputClass} name="name" defaultValue={selected.name} required /></label><label className="text-sm font-semibold">Link Google<input className={inputClass} name="destinationUrl" type="url" defaultValue={selected.destinationUrl} required /></label><div className="sm:col-span-2"><Feedback state={updateState} /><button className="button-secondary mt-3" disabled={updating}>Zapisz zmiany</button></div></form><form action={toggleAction} className="mt-5 border-t border-black/[0.06] pt-5" onSubmit={(event) => { if (selected.isActive && !window.confirm("Wyłączenie zatrzyma przekierowanie do Google Reviews i naliczanie nowych skanów. Fizyczna plakietka nadal będzie zawierała zapisany link, ale NuvoRate nie przekieruje klienta dalej.")) event.preventDefault(); }}><input type="hidden" name="tagId" value={selected.id} /><input type="hidden" name="isActive" value={String(!selected.isActive)} /><Feedback state={toggleState} /><button className="button-secondary mt-3" disabled={toggling}>{selected.isActive ? "Wyłącz plakietkę" : "Włącz plakietkę"}</button></form></div></div> : null}
    </>
  );
}
