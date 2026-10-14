"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

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

type FormKey = keyof typeof emptyForm;

export default function AddressBook() {
  const colors = usePalette();
  const toast = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  async function fetchAddresses() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/customers/addresses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load addresses.");
      setAddresses(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setLoadError(true);
      toast.error(err instanceof Error ? err.message : "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(key: FormKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();

    if (form.recipientPhone.length !== 10) {
      toast.error("Enter a 10-digit recipient phone number.");
      return;
    }
    if (form.pincode.length !== 6) {
      toast.error("Enter a 6-digit pincode.");
      return;
    }

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
      closeForm();
      toast.success("Address added.");
      await fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add address.");
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
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Failed to delete address.");
      }
      toast.success("Address deleted.");
      // Refetch so a promoted default address (if any) shows up.
      await fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  }

  async function setAsDefault(addressId: string) {
    setDefaultingId(addressId);
    try {
      const res = await fetch(`/api/customers/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Failed to set default address.");
      toast.success("Default address updated.");
      await fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set default address.");
    } finally {
      setDefaultingId(null);
    }
  }

  const sorted = [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  const inputStyle = {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    color: colors.text,
  };
  const inputClass =
    "mt-2 w-full border px-3 py-3 text-base outline-none transition focus:border-[#0e0e0e] sm:py-2.5 sm:text-sm";
  const labelClass = "text-[11px] font-medium uppercase tracking-[0.2em]";
  const outlineBtn =
    "border px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-70";

  return (
    <div>
      {loading && (
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Loading addresses...
        </p>
      )}

      {!loading && loadError && (
        <button
          onClick={fetchAddresses}
          className={outlineBtn}
          style={{ borderColor: colors.text, color: colors.text }}
        >
          Retry loading addresses
        </button>
      )}

      {!loading && !loadError && (
        <div className="space-y-3">
          {sorted.map((addr) => (
            <div
              key={addr.addressId}
              className="border p-4 sm:p-5"
              style={{
                borderColor: addr.isDefault ? colors.text : "transparent",
                backgroundColor: colors.panel,
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words text-sm font-semibold" style={{ color: colors.text }}>
                      {addr.recipientName}
                    </p>
                    {addr.isDefault && (
                      <span
                        className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                        style={{ backgroundColor: ORANGE }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                    {addr.recipientPhone}
                  </p>
                  <p className="mt-2 break-words text-sm" style={{ color: colors.textMuted }}>
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    {addr.landmark ? ` (near ${addr.landmark})` : ""}
                  </p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:items-end sm:gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setAsDefault(addr.addressId)}
                      disabled={defaultingId === addr.addressId}
                      className="py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-70 disabled:opacity-50"
                      style={{ color: ORANGE }}
                    >
                      {defaultingId === addr.addressId ? "Updating..." : "Make default"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.addressId)}
                    disabled={deletingId === addr.addressId}
                    className="py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-70 disabled:opacity-50"
                    style={{ color: colors.textMuted }}
                  >
                    {deletingId === addr.addressId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <p className="text-sm" style={{ color: colors.textMuted }}>
              No saved addresses yet.
            </p>
          )}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className={`mt-5 w-full sm:w-auto ${outlineBtn}`}
          style={{ borderColor: colors.text, color: colors.text }}
        >
          + Add address
        </button>
      ) : (
        <form
          onSubmit={handleAdd}
          className="mt-5 space-y-4 border p-4 sm:p-6"
          style={{ borderColor: colors.line }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ab-name" className={labelClass} style={{ color: colors.textMuted }}>
                Recipient name
              </label>
              <input
                id="ab-name"
                required
                autoComplete="name"
                value={form.recipientName}
                onChange={(e) => updateField("recipientName", e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="ab-phone" className={labelClass} style={{ color: colors.textMuted }}>
                Recipient phone
              </label>
              <input
                id="ab-phone"
                required
                inputMode="numeric"
                autoComplete="tel"
                value={form.recipientPhone}
                onChange={(e) => updateField("recipientPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ab-l1" className={labelClass} style={{ color: colors.textMuted }}>
              Address line 1
            </label>
            <input
              id="ab-l1"
              required
              autoComplete="address-line1"
              value={form.addressLine1}
              onChange={(e) => updateField("addressLine1", e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="ab-l2" className={labelClass} style={{ color: colors.textMuted }}>
              Address line 2 (optional)
            </label>
            <input
              id="ab-l2"
              autoComplete="address-line2"
              value={form.addressLine2}
              onChange={(e) => updateField("addressLine2", e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="ab-landmark" className={labelClass} style={{ color: colors.textMuted }}>
              Landmark (optional)
            </label>
            <input
              id="ab-landmark"
              value={form.landmark}
              onChange={(e) => updateField("landmark", e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ab-city" className={labelClass} style={{ color: colors.textMuted }}>
                City
              </label>
              <input
                id="ab-city"
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="ab-state" className={labelClass} style={{ color: colors.textMuted }}>
                State
              </label>
              <input
                id="ab-state"
                required
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="ab-pin" className={labelClass} style={{ color: colors.textMuted }}>
                Pincode
              </label>
              <input
                id="ab-pin"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.pincode}
                onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={closeForm}
              className={outlineBtn}
              style={{ borderColor: colors.lineStrong, color: colors.textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: colors.text, color: colors.bg }}
            >
              {saving ? "Saving..." : "Save address"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}