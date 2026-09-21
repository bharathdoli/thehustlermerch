"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

type Address = {
  addressId: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

const emptyForm = {
  recipientName: "",
  recipientPhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressBook() {
  const { colors } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchAddresses() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customers/addresses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load addresses.");
      setAddresses(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/customers/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          landmark: form.landmark || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstFieldError = data.errors ? (Object.values(data.errors)[0] as string[]) : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to add address.");
      }
      setForm(emptyForm);
      setShowForm(false);
      await fetchAddresses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addressId: string) {
    if (!confirm("Delete this address?")) return;
    setDeletingId(addressId);
    try {
      const res = await fetch(`/api/customers/addresses/${addressId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete address.");
      }
      // If this was the default, the backend should promote another address —
      // refetching picks that up automatically.
      await fetchAddresses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  }

  async function setAsDefault(addressId: string) {
    try {
      const res = await fetch(`/api/customers/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to set default address.");
      await fetchAddresses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set default address.");
    }
  }

  const sorted = [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  return (
    <div>
      {loading && <p className="text-sm" style={{ color: colors.textMuted }}>Loading addresses...</p>}
      {error && <p className="font-mono text-xs" style={{ color: SIGNAL }}>{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {sorted.map((addr) => (
            <div key={addr.addressId} className="border p-4" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{addr.recipientName}</p>
                    {addr.isDefault && (
                      <span className="border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest" style={{ borderColor: SIGNAL, color: SIGNAL }}>
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>{addr.recipientPhone}</p>
                  <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    {addr.landmark ? ` (near ${addr.landmark})` : ""}
                  </p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setAsDefault(addr.addressId)}
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: SIGNAL }}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.addressId)}
                    disabled={deletingId === addr.addressId}
                    className="font-mono text-[10px] uppercase tracking-widest disabled:opacity-50"
                    style={{ color: colors.textMuted }}
                  >
                    {deletingId === addr.addressId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <p className="text-sm" style={{ color: colors.textMuted }}>No saved addresses yet.</p>
          )}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 border px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition"
          style={{ borderColor: colors.lineStrong, color: colors.text }}
        >
          + Add address
        </button>
      ) : (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 border p-4" style={{ borderColor: colors.line }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Recipient name</label>
              <input
                required
                value={form.recipientName}
                onChange={(e) => updateField("recipientName", e.target.value)}
                className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Recipient phone</label>
              <input
                required
                value={form.recipientPhone}
                onChange={(e) => updateField("recipientPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Address line 1</label>
            <input
              required
              value={form.addressLine1}
              onChange={(e) => updateField("addressLine1", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Address line 2 (optional)</label>
            <input
              value={form.addressLine2}
              onChange={(e) => updateField("addressLine2", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Landmark (optional)</label>
            <input
              value={form.landmark}
              onChange={(e) => updateField("landmark", e.target.value)}
              className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>City</label>
              <input
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>State</label>
              <input
                required
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Pincode</label>
              <input
                required
                value={form.pincode}
                onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="mt-1 w-full border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
              />
            </div>
          </div>

          {formError && <p className="font-mono text-[11px]" style={{ color: SIGNAL }}>{formError}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-50"
              style={{ backgroundColor: SIGNAL, color: "#131210" }}
            >
              {saving ? "Saving..." : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setFormError("");
              }}
              className="px-5 py-2.5 font-mono text-xs uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}