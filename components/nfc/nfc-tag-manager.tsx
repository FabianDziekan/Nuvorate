"use client";

import { useActionState } from "react";
import {
  createNfcTag,
  toggleNfcTag,
  updateNfcTag,
} from "@/app/nfc/actions";
import { CopyLinkButton } from "@/components/nfc/copy-link-button";
import type { NfcTagActionState } from "@/lib/nfc-types";

type NfcTag = {
  destinationUrl: string;
  id: string;
  isActive: boolean;
  name: string;
  publicUrl: string;
};

const initialNfcTagActionState: NfcTagActionState = {};

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p className={`mt-4 text-sm font-medium ${error ? "text-red-600" : "text-emerald-600"}`} role={error ? "alert" : "status"}>
      {error ?? success}
    </p>
  );
}

const inputClassName = "mt-2 h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm text-ink outline-none transition placeholder:text-black/25 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function NfcTagManager({ tag }: { tag: NfcTag | null }) {
  const [createState, createAction, creating] = useActionState(createNfcTag, initialNfcTagActionState);
  const [updateState, updateAction, updating] = useActionState(updateNfcTag, initialNfcTagActionState);
  const [toggleState, toggleAction, toggling] = useActionState(toggleNfcTag, initialNfcTagActionState);

  if (!tag) {
    return (
      <form action={createAction} className="mt-5 space-y-4">
        <label className="block text-sm font-semibold">
          Nazwa plakietki
          <input className={inputClassName} defaultValue="Plakietka przy kasie" name="name" required maxLength={120} />
        </label>
        <label className="block text-sm font-semibold">
          Link Google do wystawienia opinii
          <input className={inputClassName} name="destinationUrl" type="url" inputMode="url" placeholder="https://g.page/r/..." required />
        </label>
        <Feedback {...createState} />
        <button type="submit" className="button-primary" disabled={creating}>
          {creating ? "Tworzenie linku..." : "Utwórz link NFC"}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
        <p className="break-all text-sm font-medium text-black/65">{tag.publicUrl}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <CopyLinkButton value={tag.publicUrl} />
          <a href={tag.publicUrl} target="_blank" rel="noreferrer" className="button-secondary justify-center">
            Testuj link
          </a>
        </div>
      </div>

      <form action={updateAction} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="tagId" value={tag.id} />
        <label className="block text-sm font-semibold">
          Nazwa plakietki
          <input className={inputClassName} defaultValue={tag.name} name="name" required maxLength={120} />
        </label>
        <label className="block text-sm font-semibold">
          Link Google do wystawienia opinii
          <input className={inputClassName} defaultValue={tag.destinationUrl} name="destinationUrl" type="url" required />
        </label>
        <div className="sm:col-span-2">
          <Feedback {...updateState} />
          <button type="submit" className="button-secondary mt-4" disabled={updating}>
            {updating ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </form>

      <form action={toggleAction} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{tag.isActive ? "Plakietka aktywna" : "Plakietka wyłączona"}</p>
          <p className="mt-1 text-xs text-black/45">{tag.isActive ? "Klienci po skanie przejdą do Google Reviews." : "Link nie zapisuje skanów ani nie przekierowuje klientów."}</p>
        </div>
        <input type="hidden" name="tagId" value={tag.id} />
        <input type="hidden" name="isActive" value={String(!tag.isActive)} />
        <button type="submit" className="button-secondary" disabled={toggling}>
          {toggling ? "Zapisywanie..." : tag.isActive ? "Wyłącz plakietkę" : "Włącz plakietkę"}
        </button>
        <Feedback {...toggleState} />
      </form>
    </div>
  );
}
