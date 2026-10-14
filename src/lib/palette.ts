/**
 * Single brand theme: white, black, grey and orange.
 * Save as src/lib/palette.ts. No light/dark switching.
 */
export const ORANGE = "#F26522";

export const colors = {
  bg: "#ffffff",
  text: "#0e0e0e",
  textMuted: "#6b6b6b",
  line: "#e5e5e5",
  lineStrong: "#bdbdbd",
  panel: "#f2f2f2",
};

/** Kept as a hook so components can call it the same way as before. */
export function usePalette() {
  return colors;
}