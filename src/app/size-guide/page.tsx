"use client";

/**
 * Route: app/size-guide/page.tsx
 *
 * Static measurement reference. If you'd rather pull real per-product
 * measurements from the backend later, this is a fine placeholder
 * to ship first — swap the SIZE_CHART constant for an API call
 * against /api/products/[id] when that data exists.
 */

import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

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

function SizeTable({
  title,
  rows,
}: {
  title: string;
  rows: SizeRow[];
}) {
  const { colors } = useTheme();

  return (
    <div className="mt-8">
      <h2
        className="font-display text-xl uppercase tracking-tight
          sm:text-2xl"
        style={{ color: colors.text }}
      >
        {title}
      </h2>

      <div
        className="mt-4 overflow-x-auto border
          w-full max-w-full"
        style={{ borderColor: colors.line }}
      >
        <table className="w-full min-w-[420px] text-left font-mono text-xs">
          <thead>
            <tr style={{ backgroundColor: colors.panel }}>
              {["Size", "Chest (in)", "Length (in)", "Sleeve (in)"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 uppercase tracking-widest
                      whitespace-nowrap"
                    style={{ color: colors.textMuted }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.size}
                style={{
                  borderTop:
                    i === 0 ? "none" : `1px solid ${colors.line}`,
                }}
              >
                <td
                  className="px-4 py-3 font-bold"
                  style={{ color: SIGNAL }}
                >
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
  const { colors } = useTheme();

  return (
    <div
      className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20
        w-full min-w-0 break-words md:px-10 lg:py-24"
    >
      <span
        className="font-mono text-[11px] tracking-[0.25em]"
        style={{ color: SIGNAL }}
      >
        Support
      </span>

      <h1
        className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl
          break-words max-[380px]:text-3xl"
        style={{ color: colors.text }}
      >
        Size Guide
      </h1>

      <p
        className="mt-4 max-w-xl text-sm leading-relaxed"
        style={{ color: colors.textMuted }}
      >
        All measurements are in inches and taken flat, garment laid out. If you're between
        sizes, we generally recommend sizing up for a relaxed fit — most of our streetwear
        pieces are cut on the heavier, boxier side.
      </p>

      <SizeTable title="Tees & Crewnecks" rows={TSHIRT_SIZES} />
      <SizeTable title="Hoodies" rows={HOODIE_SIZES} />

      <div
        className="mt-10 border p-5 text-sm
          sm:p-6"
        style={{
          borderColor: colors.line,
          backgroundColor: colors.panel,
          color: colors.textMuted,
        }}
      >
        <p>
          <span style={{ color: colors.text, fontWeight: 600 }}>
            How to measure:
          </span>{" "}
          Chest — measure straight across, one inch below the armhole. Length — from the
          highest point of the shoulder to the hem. Sleeve — from the shoulder seam to the
          cuff.
        </p>
      </div>
    </div>
  );
}