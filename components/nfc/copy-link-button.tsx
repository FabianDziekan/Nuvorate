"use client";

import { useState } from "react";

export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      disabled={!value}
      className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? "Skopiowano" : "Kopiuj link"}
    </button>
  );
}
