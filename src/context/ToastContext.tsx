"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const SUCCESS = "#3a9d5c";
const DURATION = 4000;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, kind, message }].slice(-MAX_VISIBLE));
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss]
  );

  // Stable reference, safe to use inside effects without re-triggering them.
  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push]
  );

  const accent = (k: ToastKind) =>
    k === "success" ? SUCCESS : k === "error" ? SIGNAL : colors.textMuted;

  return (
    <ToastContext.Provider value={api}>
      {children}

      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .toast-item { animation: toast-in 160ms ease-out; }
        @media (prefers-reduced-motion: reduce) { .toast-item { animation: none; } }
      `}</style>

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col gap-2 px-4 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-96 sm:px-0"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className="toast-item pointer-events-auto flex items-start gap-3 border-l-4 border-y border-r p-3 shadow-lg"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.line,
              borderLeftColor: accent(t.kind),
              color: colors.text,
            }}
          >
            <p className="min-w-0 flex-1 break-words text-sm">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 px-1 font-mono text-sm leading-none"
              style={{ color: colors.textMuted }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}