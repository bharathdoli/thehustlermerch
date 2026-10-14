"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

const PENDING_CART_KEY = "hustler-pending-cart-item";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";

  const colors = usePalette();
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

    // Required-field check (needed because the form uses noValidate)
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
     * IMPORTANT: do NOT send a role from the frontend.
     * The backend must always create public registrations as "Customer".
     */
    try {
      const res = await fetch(`/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phoneNo }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Zod validation errors
        const firstFieldMessage = data.errors
          ? data.errors[Object.keys(data.errors)[0]]?.[0]
          : undefined;

        const message = firstFieldMessage ?? data.message ?? "Something went wrong.";

        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }
    } catch {
      setError("Could not reach the server. Please try again.");
      toast.error("Could not reach the server. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Account created successfully.");

    // Automatically log the newly created customer in.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created. Please log in.");
      toast.info("Account created. Please log in.");

      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    toast.success("Welcome! You're now logged in.");

    completeRedirect();
  }

  const labelClass = "text-[11px] font-medium uppercase tracking-[0.2em]";
  const inputClass =
    "mt-2 w-full border px-4 py-3 text-base outline-none transition focus:border-[#0e0e0e] sm:text-sm";
  const inputStyle = {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    color: colors.text,
  };

  const fields: {
    id: string;
    label: string;
    type: string;
    value: string;
    set: (v: string) => void;
    placeholder: string;
    autoComplete: string;
  }[] = [
    {
      id: "signup-name",
      label: "Full name",
      type: "text",
      value: name,
      set: setName,
      placeholder: "Your name",
      autoComplete: "name",
    },
    {
      id: "signup-email",
      label: "Email",
      type: "email",
      value: email,
      set: setEmail,
      placeholder: "you@email.com",
      autoComplete: "email",
    },
    {
      id: "signup-phone",
      label: "Phone number",
      type: "tel",
      value: phoneNo,
      set: setPhoneNo,
      placeholder: "10-digit mobile number",
      autoComplete: "tel",
    },
    {
      id: "signup-password",
      label: "Password",
      type: "password",
      value: password,
      set: setPassword,
      placeholder: "At least 8 characters",
      autoComplete: "new-password",
    },
    {
      id: "signup-confirm-password",
      label: "Confirm password",
      type: "password",
      value: confirmPassword,
      set: setConfirmPassword,
      placeholder: "Re-enter password",
      autoComplete: "new-password",
    },
  ];

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
          Join the crew
        </span>

        <h1
          className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          style={{ color: colors.text }}
        >
          Sign up
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 p-5 sm:p-6"
          style={{ backgroundColor: colors.panel }}
          noValidate
        >
          {fields.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className={labelClass}
                style={{ color: colors.textMuted }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                required
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          ))}

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
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: colors.textMuted }}>
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            style={{ color: ORANGE }}
            className="font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
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