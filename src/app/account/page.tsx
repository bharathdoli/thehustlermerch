"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import AddressBook from "@/src/app/account/AddressBook";

type Profile = {
  uname: string;
  email: string;
  phoneNo: string;
};

export default function AccountPage() {
  const { status } = useSession();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [uname, setUname] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.info("Please sign in to view your account.");
      router.push("/login?redirect=/account");
    }
  }, [status, router, toast]);

  useEffect(() => {
    if (status !== "authenticated") return;
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load profile.");
        const p = data.data ?? data;
        setProfile(p);
        setUname(p.uname);
        setPhoneNo(p.phoneNo);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [status, toast]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();

    if (phoneNo.length !== 10) {
      toast.error("Enter a 10-digit phone number.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uname, phoneNo }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstFieldError = data.errors ? (Object.values(data.errors)[0] as string[]) : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to update profile.");
      }
      setProfile(data.data ?? data);
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 text-sm opacity-60 sm:px-8 sm:py-16">
        Loading account...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // redirect effect above handles navigation
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Your account</span>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl" style={{ color: colors.text }}>
        Profile
      </h1>

      {profile && (
        <form onSubmit={handleSave} className="mt-6 space-y-4 border p-4 sm:p-5" style={{ borderColor: colors.line }}>
          <div>
            <label htmlFor="uname" className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Full name
            </label>
            <input
              id="uname"
              required
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              className="mt-2 w-full border px-4 py-3 text-base focus:outline-none sm:text-sm"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>
          <div>
            <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Email
            </label>
            <input
              id="email"
              disabled
              value={profile.email}
              className="mt-2 w-full truncate border px-4 py-3 text-base opacity-60 sm:text-sm"
              style={{ borderColor: colors.line, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>
          <div>
            <label htmlFor="phone" className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Phone number
            </label>
            <input
              id="phone"
              required
              inputMode="numeric"
              autoComplete="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              className="mt-2 w-full border px-4 py-3 text-base focus:outline-none sm:text-sm"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-50 sm:w-auto"
            style={{ backgroundColor: SIGNAL, color: "#131210" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}

      <div className="mt-10">
        <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Delivery</span>
        <h2 className="mt-2 font-display text-xl uppercase tracking-tight sm:text-2xl" style={{ color: colors.text }}>
          Address book
        </h2>
        <div className="mt-4">
          <AddressBook />
        </div>
      </div>
    </div>
  );
}