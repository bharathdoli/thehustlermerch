// "use client";

// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function LoginPage() {

//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   async function login() {

//     const result = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });

//     if (result?.error) {
//       alert("Invalid Credentials");
//       return;
//     }

   

//     router.push("/dashboard");
//     router.refresh();
//   }

//   return (
//     <>
//       Email <input onChange={(e) => setEmail(e.target.value)} />

//       password  <input
//         type="password"
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <button onClick={login}>
//         Login
//       </button>
//     </>
//   );
// }

"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useCart } from "@/src/context/CartContext";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

const PENDING_CART_KEY = "hustler-pending-cart-item";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { login } = useAuth();
  const { addToCart } = useCart();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function completeRedirect() {
    // If the user was sent here from "Add to Cart", finish that action now.
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

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    completeRedirect();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Welcome back</span>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-tight" style={{ color: colors.text }}>Log In</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
          />
        </div>

        {error && <p className="font-mono text-[11px]" style={{ color: SIGNAL }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-50"
          style={{ backgroundColor: SIGNAL, color: "#131210" }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center font-mono text-[11px]" style={{ color: colors.textMuted }}>
        Don&apos;t have an account?{" "}
        <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} style={{ color: SIGNAL }} className="hover:underline">
          Sign up
        </Link>
      </p>
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