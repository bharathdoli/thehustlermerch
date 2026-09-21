"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uname, setUname] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load profile.");
        const p = data.data ?? data;
        setProfile(p);
        setUname(p.uname);
        setPhoneNo(p.phoneNo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [status]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);
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
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 text-sm opacity-60">Loading account...</div>;
  }

  if (status === "unauthenticated") {
    return null; // redirect effect above handles navigation
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Your account</span>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-tight" style={{ color: colors.text }}>
        Profile
      </h1>

      {error && <p className="mt-4 font-mono text-xs" style={{ color: SIGNAL }}>{error}</p>}

      {profile && (
        <form onSubmit={handleSave} className="mt-6 space-y-4 border p-5" style={{ borderColor: colors.line }}>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Full name
            </label>
            <input
              required
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Email
            </label>
            <input
              disabled
              value={profile.email}
              className="mt-2 w-full border px-4 py-3 text-sm opacity-60"
              style={{ borderColor: colors.line, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Phone number
            </label>
            <input
              required
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>

          {saveError && <p className="font-mono text-[11px]" style={{ color: SIGNAL }}>{saveError}</p>}
          {saveSuccess && <p className="font-mono text-[11px]" style={{ color: "#3a9d5c" }}>Saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-50"
            style={{ backgroundColor: SIGNAL, color: "#131210" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}

      <div className="mt-10">
        <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Delivery</span>
        <h2 className="mt-2 font-display text-2xl uppercase tracking-tight" style={{ color: colors.text }}>
          Address book
        </h2>
        <div className="mt-4">
          <AddressBook />
        </div>
      </div>
    </div>
  );
}