"use client";

export function NfcAddTagButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => document.dispatchEvent(new Event("nfc:add-tag"))}
    >
      + Dodaj plakietkę
    </button>
  );
}
