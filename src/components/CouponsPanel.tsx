"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@/src/context/ToastContext";
import {
  ORANGE,
  colors,
  Field,
  adminFormClass,
  adminFormStyle,
  adminInputClass,
  adminInputStyle,
  adminPrimaryBtnClass,
  adminPrimaryBtnStyle,
  adminRowBtnClass,
  adminThClass,
  adminThStyle,
  adminHeadRowStyle,
  adminRowStyle,
} from "@/src/components/AdminUi";

type Coupon = {
  couponId: string;
  code: string;
  type: "Flat" | "Percentage";
  value: string;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
};

export default function CouponsPanel() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [type, setType] = useState<"Flat" | "Percentage">("Flat");
  const [value, setValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCoupons() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load coupons.");
      setCoupons(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons.");
      toast.error(err instanceof Error ? err.message : "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value: Number(value),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstFieldError = data.errors ? (Object.values(data.errors)[0] as string[]) : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to create coupon.");
      }
      setCode("");
      setValue("");
      setMinOrderAmount("");
      setMaxDiscountAmount("");
      setUsageLimit("");
      await fetchCoupons();
      toast.success("Coupon created.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create coupon.");
      toast.error(err instanceof Error ? err.message : "Failed to create coupon.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    setTogglingId(coupon.couponId);
    try {
      const res = await fetch(`/api/coupons/${coupon.couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update coupon.");
      await fetchCoupons();
      toast.success(`Coupon ${coupon.code} ${coupon.isActive ? "deactivated" : "activated"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update coupon.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(couponId: string) {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(couponId);
    try {
      const res = await fetch(`/api/coupons/${couponId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete coupon.");
      }
      await fetchCoupons();
      toast.success("Coupon deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full min-w-0">
      <form onSubmit={handleCreate} className={adminFormClass} style={adminFormStyle}>
        <Field label="Code" className="min-w-[140px]">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Type" className="min-w-[120px]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "Flat" | "Percentage")}
            className={adminInputClass}
            style={adminInputStyle}
          >
            <option value="Flat">Flat (₹)</option>
            <option value="Percentage">Percentage (%)</option>
          </select>
        </Field>
        <Field label="Value" className="min-w-[100px]">
          <input
            required
            type="number"
            min="0"
            max={type === "Percentage" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Min order (optional)" className="min-w-[120px]">
          <input
            type="number"
            min="0"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        {type === "Percentage" && (
          <Field label="Max discount (optional)" className="min-w-[130px]">
            <input
              type="number"
              min="0"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              className={adminInputClass}
              style={adminInputStyle}
            />
          </Field>
        )}
        <Field label="Usage limit (optional)" className="min-w-[130px]">
          <input
            type="number"
            min="0"
            step="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <button
          type="submit"
          disabled={creating}
          className={adminPrimaryBtnClass}
          style={adminPrimaryBtnStyle}
        >
          {creating ? "Adding..." : "Add coupon"}
        </button>
      </form>
      {createError && (
        <p className="mt-2 text-xs" style={{ color: ORANGE }}>
          {createError}
        </p>
      )}

      <div className="mt-6">
        {loading && (
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Loading coupons...
          </p>
        )}
        {error && (
          <p className="text-sm" style={{ color: ORANGE }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="text-left" style={adminHeadRowStyle}>
                  <th className={adminThClass} style={adminThStyle}>Code</th>
                  <th className={adminThClass} style={adminThStyle}>Type</th>
                  <th className={adminThClass} style={adminThStyle}>Value</th>
                  <th className={adminThClass} style={adminThStyle}>Usage</th>
                  <th className={adminThClass} style={adminThStyle}>Status</th>
                  <th className={`${adminThClass} text-right`} style={adminThStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.couponId} style={adminRowStyle}>
                    <td className="py-2 pr-3 font-semibold">{c.code}</td>
                    <td className="py-2 pr-3">{c.type}</td>
                    <td className="py-2 pr-3">
                      {c.type === "Percentage" ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="py-2 pr-3">
                      {c.usageCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: c.isActive ? ORANGE : colors.textMuted }}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="space-x-3 whitespace-nowrap py-2 text-right">
                      <button
                        onClick={() => toggleActive(c)}
                        disabled={togglingId === c.couponId}
                        className={adminRowBtnClass}
                        style={{ color: colors.text }}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.couponId)}
                        disabled={deletingId === c.couponId}
                        className={adminRowBtnClass}
                        style={{ color: ORANGE }}
                      >
                        {deletingId === c.couponId ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && coupons.length === 0 && (
          <p className="mt-4 text-sm" style={{ color: colors.textMuted }}>
            No coupons yet.
          </p>
        )}
      </div>
    </div>
  );
}