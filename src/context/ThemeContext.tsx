"use client";

/**
 * TEMPORARY compatibility shim — the app has a single theme (src/lib/palette.ts).
 *
 * There is no ThemeProvider, no toggle and no dark mode any more.
 * Existing `useTheme()` and `SIGNAL` imports keep working so nothing breaks,
 * but new code should import from "@/src/lib/palette" instead:
 *
 *   import { ORANGE, usePalette } from "@/src/lib/palette";
 *
 * Once every file has been switched over, delete this file.
 */

import { ORANGE, colors } from "@/src/lib/palette";

export const SIGNAL = ORANGE;

export function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function useTheme() {
  return { colors: { ...colors, invert: colors.bg } };
}