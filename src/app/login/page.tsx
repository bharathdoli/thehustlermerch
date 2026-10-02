"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";

const PENDING_CART_KEY = "hustler-pending-cart-item";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { colors } = useTheme();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const inputClass =
    "mt-2 w-full border px-4 py-3 text-base focus:outline-none sm:text-sm";

  return (
    <div
      className="flex min-h-[60dvh] w-full flex-col justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="mx-auto flex w-full max-w-md flex-col overflow-x-hidden px-4 py-10 sm:px-8 sm:py-16">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Welcome back
        </span>

        <h1
          className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl"
          style={{ color: colors.text }}
        >
          Log In
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="font-mono text-[11px] uppercase tracking-widest"
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
              className={inputClass}
              style={{
                borderColor: colors.lineStrong,
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputClass}
              style={{
                borderColor: colors.lineStrong,
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            />
          </div>

          {error && (
            <p className="font-mono text-[11px]" style={{ color: SIGNAL }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: SIGNAL, color: "#131210" }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p
          className="mt-6 text-center font-mono text-[11px]"
          style={{ color: colors.textMuted }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
            style={{ color: SIGNAL }}
            className="hover:underline"
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