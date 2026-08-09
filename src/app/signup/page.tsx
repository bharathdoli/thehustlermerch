"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useCart } from "@/src/context/CartContext";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

const PENDING_CART_KEY = "hustler-pending-cart-item";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { signup } = useAuth();
  const { addToCart } = useCart();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [role, setRole] = useState<"Customer" | "Admin">("Customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function completeRedirect() {
    try {
      const pending = sessionStorage.getItem(PENDING_CART_KEY);
      if (pending) {
        addToCart(JSON.parse(pending));
        sessionStorage.removeItem(PENDING_CART_KEY);
        router.push("/cart");
        return;
      }
    } catch {
      // ignore
    }
    router.push(redirectTo);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password, phoneNo, role);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    completeRedirect();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Join the crew</span>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-tight" style={{ color: colors.text }}>Sign Up</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Phone number</label>
          <input
            type="tel"
            required
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            placeholder="10-digit mobile number"
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          />
        </div>

        {/* See note below about whether this should stay */}
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Account type</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "Customer" | "Admin")}
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          >
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {error && <p className="font-mono text-[11px]" style={{ color: SIGNAL }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-50"
          style={{ backgroundColor: SIGNAL, color: "#131210" }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center font-mono text-[11px]" style={{ color: colors.textMuted }}>
        Already have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} style={{ color: SIGNAL }} className="hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}