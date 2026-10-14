"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ORANGE, usePalette } from "@/src/lib/palette";
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
  const colors = usePalette();
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

  const pageBg = { backgroundColor: colors.bg, color: colors.text };

  if (status === "loading" || loading) {
    return (
      <div style={pageBg}>
        <div className="mx-auto w-full max-w-[1600px] px-4 py-12 text-sm sm:px-8 sm:py-16" style={{ color: colors.textMuted }}>
          Loading account...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // redirect effect above handles navigation
  }

  const labelClass = "text-[11px] font-medium uppercase tracking-[0.2em]";
  const inputClass =
    "mt-2 w-full border px-4 py-3 text-base outline-none transition focus:border-[#0e0e0e] sm:text-sm";
  const inputStyle = { borderColor: colors.lineStrong, backgroundColor: colors.bg, color: colors.text };

  return (
    <div style={pageBg} className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <span className="text-[11px] font-medium uppercase tracking-[0.25em]" style={{ color: ORANGE }}>
          Your account
        </span>
        <h1
          className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          style={{ color: colors.text }}
        >
          Profile
        </h1>

        {profile && (
          <form
            onSubmit={handleSave}
            className="mt-8 space-y-5 p-5 sm:p-6"
            style={{ backgroundColor: colors.panel }}
          >
            <div>
              <label htmlFor="uname" className={labelClass} style={{ color: colors.textMuted }}>
                Full name
              </label>
              <input
                id="uname"
                required
                value={uname}
                onChange={(e) => setUname(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass} style={{ color: colors.textMuted }}>
                Email
              </label>
              <input
                id="email"
                disabled
                value={profile.email}
                className={`${inputClass} cursor-not-allowed truncate opacity-60`}
                style={{ ...inputStyle, borderColor: colors.line }}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass} style={{ color: colors.textMuted }}>
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
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80 disabled:opacity-50 sm:w-auto"
              style={{ backgroundColor: colors.text, color: colors.bg }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}

        <div className="mt-14">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em]" style={{ color: ORANGE }}>
            Delivery
          </span>
          <h2
            className="mt-1.5 font-display text-3xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-4xl"
            style={{ color: colors.text }}
          >
            Address book
          </h2>
          <div className="mt-6">
            <AddressBook />
          </div>
        </div>
      </div>
    </div>
  );
}