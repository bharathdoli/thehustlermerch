/**
 * Shared styles/helpers for the admin panels.
 * Save as src/components/AdminUi.tsx
 * Single brand theme: white, black, grey and orange (src/lib/palette.ts).
 */

import type { ReactNode } from "react";
import { ORANGE, colors } from "@/src/lib/palette";

export { ORANGE, colors };

/* Forms */
export const adminFormClass = "flex flex-wrap items-end gap-3 p-4 sm:p-5";
export const adminFormStyle = { backgroundColor: colors.panel };

export const adminLabelClass =
  "block text-[11px] font-medium uppercase tracking-[0.2em]";

export const adminInputClass =
  "mt-1 w-full border px-3 py-2.5 text-base outline-none transition focus:border-[#0e0e0e] sm:text-sm";
export const adminInputStyle = {
  borderColor: colors.lineStrong,
  backgroundColor: colors.bg,
  color: colors.text,
};

/* Inputs inside table rows (edit mode) */
export const adminCellInputClass =
  "w-full border px-2 py-1.5 text-sm outline-none transition focus:border-[#0e0e0e]";

/* Primary (black) button */
export const adminPrimaryBtnClass =
  "min-h-[40px] w-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
export const adminPrimaryBtnStyle = {
  backgroundColor: colors.text,
  color: colors.bg,
};

/* Small text buttons in table rows */
export const adminRowBtnClass =
  "min-h-[32px] text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50";

/* Tables */
export const adminThClass =
  "py-2 pr-3 text-[11px] font-medium uppercase tracking-[0.2em]";
export const adminThStyle = { color: colors.textMuted };
export const adminHeadRowStyle = {
  borderBottom: `1px solid ${colors.lineStrong}`,
};
export const adminRowStyle = { borderBottom: `1px solid ${colors.line}` };

/* A labelled form field */
export function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`max-w-full ${className}`}>
      <label className={adminLabelClass} style={{ color: colors.textMuted }}>
        {label}
      </label>
      {children}
    </div>
  );
}