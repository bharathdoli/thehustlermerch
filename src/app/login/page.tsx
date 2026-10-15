"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

const PENDING_CART_KEY = "hustler-pending-cart-item";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const colors = usePalette();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function completeRedirect() {
    try {
      const pending = sessionStorage.getItem(PENDING_CART_KEY);

      if (pending) {
        const pendingItems = JSON.parse(pending);

        for (const item of pendingItems) {
          const response = await fetch("/api/cart", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variantId: item.variantId,
              quantity: item.quantity,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to restore cart item.");
          }
        }

        sessionStorage.removeItem(PENDING_CART_KEY);
        toast.success("Your saved items were added to the cart.");

        router.push("/cart");
        router.refresh();
        return;
      }
    } catch (err) {
      console.error("Failed to restore pending cart:", err);
      toast.error(
        "We couldn't restore the item you were adding. Please add it again."
      );
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      const message = "Enter your email and password.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const message = "Invalid email or password.";
        setError(message);
        toast.error(message);
        return;
      }

      // Fetch the freshly-created session to check the user's role.
      const session = await getSession();
      toast.success("Logged in successfully.");

      if (session?.user?.role === "Admin") {
        toast.info("Redirecting to admin dashboard...");
        router.push("/admin");
        router.refresh();
        return;
      }

      await completeRedirect();
    } catch (err) {
      console.error("Login failed:", err);
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[11px] font-medium uppercase tracking-[0.2em]";
  // Note: top margin (mt-2) is applied separately so the password
  // wrapper can own it and keep the eye icon centered on the input.
  const inputClass =
    "w-full border px-4 py-3 text-base outline-none transition focus:border-[#0e0e0e] sm:text-sm";
  const inputStyle = {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    color: colors.text,
  };

  return (
    <div
      className="flex min-h-[70vh] w-full flex-col justify-center"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div className="mx-auto flex w-full max-w-md flex-col overflow-x-hidden px-4 py-10 sm:px-8 sm:py-16">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ color: ORANGE }}
        >
          Welcome back
        </span>

        <h1
          className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          style={{ color: colors.text }}
        >
          Log in
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 p-5 sm:p-6"
          style={{ backgroundColor: colors.panel }}
          noValidate
        >
          <div>
            <label
              htmlFor="login-email"
              className={labelClass}
              style={{ color: colors.textMuted }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className={`${inputClass} mt-2`}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className={labelClass}
              style={{ color: colors.textMuted }}
            >
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputClass} pr-12`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition hover:opacity-70"
                style={{ color: colors.textMuted }}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs" style={{ color: ORANGE }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: colors.text, color: colors.bg }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: colors.textMuted }}>
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
            style={{ color: ORANGE }}
            className="font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}