"use client";

import { useEffect, useState, type FormEvent } from "react";

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
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create coupon.");
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update coupon.");
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 border border-black/10 p-4">
        <div className="min-w-[140px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "Flat" | "Percentage")}
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="Flat">Flat (₹)</option>
            <option value="Percentage">Percentage (%)</option>
          </select>
        </div>
        <div className="min-w-[100px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Value</label>
          <input
            required
            type="number"
            min="0"
            max={type === "Percentage" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Min order (optional)</label>
          <input
            type="number"
            min="0"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        {type === "Percentage" && (
          <div className="min-w-[130px]">
            <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Max discount (optional)</label>
            <input
              type="number"
              min="0"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        )}
        <div className="min-w-[130px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Usage limit (optional)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest bg-orange-500 text-black disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add Coupon"}
        </button>
      </form>
      {createError && <p className="mt-2 font-mono text-xs text-red-600">{createError}</p>}

      <div className="mt-6">
        {loading && <p className="text-sm opacity-60">Loading coupons...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left font-mono text-[10px] uppercase tracking-widest opacity-60">
                <th className="py-2">Code</th>
                <th className="py-2">Type</th>
                <th className="py-2">Value</th>
                <th className="py-2">Usage</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.couponId} className="border-b border-black/5">
                  <td className="py-2 pr-3 font-mono">{c.code}</td>
                  <td className="py-2 pr-3">{c.type}</td>
                  <td className="py-2 pr-3">{c.type === "Percentage" ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="py-2 pr-3">
                    {c.usageCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={c.isActive ? "text-green-600" : "text-red-600"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2 text-right space-x-3">
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={togglingId === c.couponId}
                      className="font-mono text-[10px] uppercase tracking-widest text-orange-600"
                    >
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(c.couponId)}
                      disabled={deletingId === c.couponId}
                      className="font-mono text-[10px] uppercase tracking-widest text-red-600 disabled:opacity-50"
                    >
                      {deletingId === c.couponId ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && coupons.length === 0 && <p className="mt-4 text-sm opacity-60">No coupons yet.</p>}
      </div>
    </div>
  );
}