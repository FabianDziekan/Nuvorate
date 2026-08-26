export const supportCategories = [
  "Zwrot płatności",
  "Płatność lub subskrypcja",
  "Problem techniczny",
  "Google Business Profile",
  "NFC",
  "Konto i logowanie",
  "Pytanie o działanie NuvoRate",
  "Inne",
] as const;

export type SupportCategory = (typeof supportCategories)[number];

export const supportAttachmentLimitBytes = 5 * 1024 * 1024;

export function isSupportCategory(value: string): value is SupportCategory {
  return supportCategories.includes(value as SupportCategory);
}

export function isPaymentSupportCategory(category: SupportCategory) {
  return category === "Zwrot płatności" || category === "Płatność lub subskrypcja";
}

export function cleanSupportText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isAllowedSupportAttachment(file: File, bytes: Uint8Array) {
  const isPng = bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  const isJpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isPdf = bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";

  return (
    file.size > 0 &&
    file.size <= supportAttachmentLimitBytes &&
    ((isPng && file.type === "image/png") ||
      (isJpeg && (file.type === "image/jpeg" || file.type === "image/jpg")) ||
      (isPdf && file.type === "application/pdf"))
  );
}
