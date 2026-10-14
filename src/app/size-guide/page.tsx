"use client";

/**
 * Route: app/size-guide/page.tsx
 *
 * Static measurement reference. If you'd rather pull real per-product
 * measurements from the backend later, swap the size constants for an API
 * call against /api/products/[id] when that data exists.
 */

import { ORANGE, usePalette } from "@/src/lib/palette";

type SizeRow = {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
};

const TSHIRT_SIZES: SizeRow[] = [
  { size: "S", chest: "36", length: "27", sleeve: "8" },
  { size: "M", chest: "38", length: "28", sleeve: "8.5" },
  { size: "L", chest: "40", length: "29", sleeve: "9" },
  { size: "XL", chest: "42", length: "30", sleeve: "9.5" },
  { size: "XXL", chest: "44", length: "31", sleeve: "10" },
];

const HOODIE_SIZES: SizeRow[] = [
  { size: "S", chest: "40", length: "26", sleeve: "24" },
  { size: "M", chest: "42", length: "27", sleeve: "24.5" },
  { size: "L", chest: "44", length: "28", sleeve: "25" },
  { size: "XL", chest: "46", length: "29", sleeve: "25.5" },
  { size: "XXL", chest: "48", length: "30", sleeve: "26" },
];

function SizeTable({ title, rows }: { title: string; rows: SizeRow[] }) {
  const colors = usePalette();

  return (
    <div className="mt-10">
      <h2
        className="font-display text-2xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-3xl"
        style={{ color: colors.text }}
      >
        {title}
      </h2>

      <div
        className="mt-4 w-full max-w-full overflow-x-auto border"
        style={{ borderColor: colors.line }}
      >
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: colors.panel }}>
              {["Size", "Chest (in)", "Length (in)", "Sleeve (in)"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em]"
                  style={{ color: colors.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.size}
                style={{
                  borderTop: i === 0 ? "none" : `1px solid ${colors.line}`,
                }}
              >
                <td className="px-4 py-3 font-bold" style={{ color: ORANGE }}>
                  {row.size}
                </td>
                <td className="px-4 py-3" style={{ color: colors.text }}>
                  {row.chest}
                </td>
                <td className="px-4 py-3" style={{ color: colors.text }}>
                  {row.length}
                </td>
                <td className="px-4 py-3" style={{ color: colors.text }}>
                  {row.sleeve}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeGuidePage() {
  const colors = usePalette();

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-[70vh]">
      <div className="mx-auto w-full min-w-0 max-w-3xl break-words px-4 py-10 sm:px-8 sm:py-16 md:px-10">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ color: ORANGE }}
        >
          Support
        </span>

        <h1
          className="mt-1.5 break-words font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] max-[380px]:text-3xl sm:text-6xl"
          style={{ color: colors.text }}
        >
          Size guide
        </h1>

        <p
          className="mt-4 max-w-xl text-sm leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          All measurements are in inches and taken flat, garment laid out. If
          you&apos;re between sizes, we generally recommend sizing up for a relaxed
          fit — most of our streetwear pieces are cut on the heavier, boxier side.
        </p>

        <SizeTable title="Tees & crewnecks" rows={TSHIRT_SIZES} />
        <SizeTable title="Hoodies" rows={HOODIE_SIZES} />

        <div
          className="mt-10 p-5 text-sm leading-relaxed sm:p-6"
          style={{ backgroundColor: colors.panel, color: colors.textMuted }}
        >
          <p>
            <span style={{ color: colors.text, fontWeight: 600 }}>How to measure:</span>{" "}
            Chest — measure straight across, one inch below the armhole. Length —
            from the highest point of the shoulder to the hem. Sleeve — from the
            shoulder seam to the cuff.
          </p>
        </div>
      </div>
    </div>
  );
}