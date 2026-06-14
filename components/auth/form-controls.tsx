import type { InputHTMLAttributes, ReactNode } from "react";

export function FormField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-ink">
        {label}
        {hint}
      </span>
      <input
        {...props}
        className="h-[52px] w-full rounded-2xl border border-black/10 bg-white px-4 text-base text-ink outline-none transition placeholder:text-black/25 focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </label>
  );
}

export function FormMessage({
  type,
  children,
}: {
  type: "error" | "success";
  children: ReactNode;
}) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
        type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </div>
  );
}
