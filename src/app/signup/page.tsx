"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";

const PENDING_CART_KEY = "hustler-pending-cart-item";
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";

  const { colors } = useTheme();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

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
            headers: {
              "Content-Type": "application/json",
            },
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
    } catch (error) {
      console.error("Failed to restore pending cart:", error);
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

    // Extra: required-field check (needed because the form uses noValidate)
    if (!name.trim() || !email.trim() || !phoneNo.trim() || !password) {
      setError("Please fill in all the fields.");
      toast.error("Please fill in all the fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      toast.error("Passwords don't match.");
      return;
    }

    // Extra validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/^\d{10}$/.test(phoneNo.trim())) {
      setError("Enter a valid 10-digit phone number.");
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    /*
     * Register the user.
     *
     * IMPORTANT:
     * Do NOT send a role from the frontend.
     * The backend must always create public registrations
     * as "Customer".
     */
    try {
      const res = await fetch(`/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Zod validation errors
        if (data.errors) {
          const firstField = Object.keys(data.errors)[0];
          const firstMessage = data.errors[firstField]?.[0];

          setError(
            firstMessage ??
            data.message ??
            "Something went wrong."
          );
        } else {
          setError(
            data.message ??
            "Something went wrong."
          );
        }

        toast.error(
          (data.errors &&
            data.errors[Object.keys(data.errors)[0]]?.[0]) ||
            data.message ||
            "Something went wrong."
        );

        setLoading(false);
        return;
      }
    } catch {
      setError(
        "Could not reach the server. Please try again."
      );

      toast.error("Could not reach the server. Please try again.");

      setLoading(false);
      return;
    }

    toast.success("Account created successfully.");

    /*
     * Automatically log the newly created customer in.
     */
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created. Please log in.");
      toast.info("Account created. Please log in.");

      router.push(
        `/login?redirect=${encodeURIComponent(redirectTo)}`
      );

      return;
    }

    toast.success("Welcome! You're now logged in.");

    completeRedirect();
  }

  return (
    <div
      className="
        mx-auto
        flex
        min-h-[70vh]
        w-full
        max-w-md
        flex-col
        justify-center
        overflow-x-hidden
        px-4
        py-10
        sm:px-8
        sm:py-16
      "
    >
      {/* Heading */}
      <span
        className="font-mono text-[11px] tracking-[0.25em]"
        style={{ color: SIGNAL }}
      >
        Join the crew
      </span>

      <h1
        className="
          mt-2
          font-display
          text-3xl
          uppercase
          tracking-tight
          sm:text-4xl
        "
        style={{ color: colors.text }}
      >
        Sign Up
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        noValidate
      >
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="
              font-mono
              text-[11px]
              uppercase
              tracking-widest
            "
            style={{ color: colors.textMuted }}
          >
            Full name
          </label>

          <input
            id="signup-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="
              mt-2
              w-full
              border
              px-4
              py-3
              text-base
              sm:text-sm
              focus:outline-none
            "
            style={{
              borderColor: colors.lineStrong,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="
              font-mono
              text-[11px]
              uppercase
              tracking-widest
            "
            style={{ color: colors.textMuted }}
          >
            Email
          </label>

          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="
              mt-2
              w-full
              border
              px-4
              py-3
              text-base
              sm:text-sm
              focus:outline-none
            "
            style={{
              borderColor: colors.lineStrong,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="signup-phone"
            className="
              font-mono
              text-[11px]
              uppercase
              tracking-widest
            "
            style={{ color: colors.textMuted }}
          >
            Phone number
          </label>

          <input
            id="signup-phone"
            type="tel"
            required
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            className="
              mt-2
              w-full
              border
              px-4
              py-3
              text-base
              sm:text-sm
              focus:outline-none
            "
            style={{
              borderColor: colors.lineStrong,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="
              font-mono
              text-[11px]
              uppercase
              tracking-widest
            "
            style={{ color: colors.textMuted }}
          >
            Password
          </label>

          <input
            id="signup-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="
              mt-2
              w-full
              border
              px-4
              py-3
              text-base
              sm:text-sm
              focus:outline-none
            "
            style={{
              borderColor: colors.lineStrong,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="
              font-mono
              text-[11px]
              uppercase
              tracking-widest
            "
            style={{ color: colors.textMuted }}
          >
            Confirm password
          </label>

          <input
            id="signup-confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Re-enter password"
            autoComplete="new-password"
            className="
              mt-2
              w-full
              border
              px-4
              py-3
              text-base
              sm:text-sm
              focus:outline-none
            "
            style={{
              borderColor: colors.lineStrong,
              backgroundColor: colors.panel,
              color: colors.text,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            className="font-mono text-[11px]"
            style={{ color: SIGNAL }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-3
            py-3.5
            font-mono
            text-xs
            font-bold
            uppercase
            tracking-widest
            transition
            hover:brightness-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          style={{
            backgroundColor: SIGNAL,
            color: "#131210",
          }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      {/* Login */}
      <p
        className="
          mt-6
          text-center
          font-mono
          text-[11px]
        "
        style={{ color: colors.textMuted }}
      >
        Already have an account?{" "}

        <Link
          href={`/login?redirect=${encodeURIComponent(
            redirectTo
          )}`}
          style={{ color: SIGNAL }}
          className="hover:underline"
        >
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