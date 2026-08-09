"use client";

/**
 * Shared black/white theme system for TheHustlerMerchandise.
 *
 * This is the same theme code that used to live inline in the Home page —
 * it's been pulled out here so every page/component (Header, Cart, Login,
 * Signup, Product pages, etc.) can share one <ThemeProvider> and one
 * useTheme() hook instead of each page having its own disconnected theme.
 *
 * IMPORTANT: mount <ThemeProvider> once, near the root of the app
 * (e.g. in app/layout.tsx, wrapping {children}), not per-page. See the
 * note at the bottom of this file for the exact snippet to add there.
 */

import { createContext, useContext, useEffect, useState } from "react";

export const SIGNAL = "#ff5a1f"; // safety orange — fixed in both themes, never touched

export type ThemeName = "dark" | "light";

export type ThemeColors = {
  bg: string; // page background
  panel: string; // card / panel background
  panelAlt: string; // slightly stronger panel (tickers, stamps bg)
  text: string; // primary text / foreground
  textMuted: string; // secondary text (derived via alpha)
  line: string; // hairline borders (derived via alpha)
  lineStrong: string; // more visible borders (derived via alpha)
  invert: string; // opposite of `text` — for text sitting on `text`-colored fills
};

const THEME: Record<ThemeName, { bg: string; panel: string; panelAlt: string; text: string }> = {
  dark: {
    bg: "#131210", // INK
    panel: "#1d1b18", // CONCRETE
    panelAlt: "#131210",
    text: "#f3ede1", // PAPER
  },
  light: {
    bg: "#f3ede1", // PAPER
    panel: "#e6ded0",
    panelAlt: "#ffffff",
    text: "#131210", // INK
  },
};

export function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function colorsFor(theme: ThemeName): ThemeColors {
  const t = THEME[theme];
  return {
    bg: t.bg,
    panel: t.panel,
    panelAlt: t.panelAlt,
    text: t.text,
    textMuted: hexToRgba(t.text, 0.55),
    line: hexToRgba(t.text, 0.1),
    lineStrong: hexToRgba(t.text, 0.25),
    invert: theme === "dark" ? "#131210" : "#f3ede1",
  };
}

const ThemeContext = createContext<{
  theme: ThemeName;
  colors: ThemeColors;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("hustler-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) window.localStorage.setItem("hustler-theme", theme);
    // Drives the plain-CSS body/html defaults in globals.css — see the
    // [data-theme="..."] rules there. Components still read colors from
    // useTheme() directly; this just covers untouched defaults (body bg,
    // default text color, scrollbars, etc).
    document.documentElement.dataset.theme = theme;
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const colors = colorsFor(theme);

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      <div style={{ backgroundColor: colors.bg, transition: "background-color 0.3s ease", minHeight: "100%" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be called inside <ThemeProvider>");
  return ctx;
}

/** Floating toggle button. Render this once, globally (Header is a good spot). */
export function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle black/white theme"
      className="fixed right-5 top-20 z-50 flex items-center gap-2 border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur transition sm:right-8 sm:top-24"
      style={{
        borderColor: colors.lineStrong,
        backgroundColor: hexToRgba(colors.invert === "#131210" ? "#131210" : "#f3ede1", 0.9),
        color: colors.invert,
      }}
    >
      <span className="relative flex h-4 w-8 items-center rounded-full transition-colors" style={{ backgroundColor: SIGNAL }}>
        <span
          className="absolute h-3 w-3 rounded-full bg-current transition-transform"
          style={{ color: colors.invert, transform: isDark ? "translateX(3px)" : "translateX(17px)" }}
        />
      </span>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

/* -------------------------------------------------------------------- *
 *  app/layout.tsx integration (do this once):
 *
 *  import { ThemeProvider } from "@/src/context/ThemeContext";
 *
 *  export default function RootLayout({ children }) {
 *    return (
 *      <html lang="en">
 *        <body className="font-sans">
 *          <ThemeProvider>
 *            <AuthProvider>
 *              <CartProvider>
 *                <Header />
 *                {children}
 *              </CartProvider>
 *            </AuthProvider>
 *          </ThemeProvider>
 *        </body>
 *      </html>
 *    );
 *  }
 * -------------------------------------------------------------------- */