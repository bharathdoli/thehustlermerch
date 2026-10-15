"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/src/context/ToastContext";
import {
  ORANGE,
  colors,
  Field,
  adminFormClass,
  adminFormStyle,
  adminInputClass,
  adminInputStyle,
  adminCellInputClass,
  adminPrimaryBtnClass,
  adminPrimaryBtnStyle,
  adminRowBtnClass,
  adminThClass,
  adminThStyle,
  adminHeadRowStyle,
  adminRowStyle,
} from "@/src/components/AdminUi";

type Product = { productId: string; productName: string };
type Variant = {
  variantId: string;
  productId: string;
  colour: string | null;
  size: string | null;
  price: string;
  stockQuantity: number;
};

/**
 * Custom dropdown used instead of a native <select>.
 * The native popup is drawn by the browser/OS and renders oversized on
 * mobile (wider than the control, huge text). This one stays the same
 * width and font size as the field.
 */
function ProductSelect({
  products,
  value,
  onChange,
  loading,
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = products.find((p) => p.productId === value);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  const itemClass = "cursor-pointer px-3 py-2 text-sm";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${adminInputClass} flex items-center justify-between gap-2 text-left`}
        style={adminInputStyle}
      >
        <span className="truncate">
          {loading ? "Loading..." : selected?.productName ?? "Choose a product..."}
        </span>
        <span aria-hidden className="text-[10px]">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto border shadow-md"
          style={{ background: "#fff", borderColor: "rgba(0,0,0,0.2)" }}
        >
          <li
            role="option"
            aria-selected={!value}
            onClick={() => pick("")}
            className={itemClass}
            style={{ color: colors.textMuted }}
          >
            Choose a product...
          </li>
          {products.map((p) => (
            <li
              key={p.productId}
              role="option"
              aria-selected={p.productId === value}
              onClick={() => pick(p.productId)}
              className={`${itemClass} hover:bg-black/5`}
              style={p.productId === value ? { background: "rgba(0,0,0,0.08)", fontWeight: 600 } : undefined}
            >
              {p.productName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function VariantsPanel() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [error, setError] = useState("");

  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editColour, setEditColour] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load products.");
        setProducts(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products.");
        toast.error(err instanceof Error ? err.message : "Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  async function fetchVariants(productId: string) {
    setLoadingVariants(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/variants`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load variants.");
      setVariants(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load variants.");
      toast.error(err instanceof Error ? err.message : "Failed to load variants.");
    } finally {
      setLoadingVariants(false);
    }
  }

  function handleProductChange(id: string) {
    setSelectedProductId(id);
    setVariants([]);
    if (id) fetchVariants(id);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colour: colour || undefined,
          size: size || undefined,
          price: Number(price),
          stockQuantity: Number(stockQuantity),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstFieldError = data.errors ? (Object.values(data.errors)[0] as string[]) : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to create variant.");
      }
      setColour("");
      setSize("");
      setPrice("");
      setStockQuantity("");
      await fetchVariants(selectedProductId);
      toast.success("Variant added.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create variant.");
      toast.error(err instanceof Error ? err.message : "Failed to create variant.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(v: Variant) {
    setEditingId(v.variantId);
    setEditColour(v.colour ?? "");
    setEditSize(v.size ?? "");
    setEditStock(String(v.stockQuantity));
    setEditPrice(String(v.price));
  }

  async function saveEdit(variantId: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colour: editColour || undefined,
          size: editSize || undefined,
          stockQuantity: Number(editStock),
          price: Number(editPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update variant.");
      setEditingId(null);
      await fetchVariants(selectedProductId);
      toast.success("Variant updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update variant.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(variantId: string) {
    if (!confirm("Delete this variant?")) return;
    setDeletingId(variantId);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/variants/${variantId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete variant.");
      }
      await fetchVariants(selectedProductId);
      toast.success("Variant deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete variant.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full min-w-0">
      <Field label="Select product" className="w-full max-w-xs">
        <ProductSelect
          products={products}
          value={selectedProductId}
          onChange={handleProductChange}
          loading={loadingProducts}
        />
      </Field>

      {selectedProductId && (
        <>
          <form
            onSubmit={handleCreate}
            className={`${adminFormClass} mt-6`}
            style={adminFormStyle}
          >
            <Field label="Colour" className="min-w-[120px]">
              <input
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Black"
                className={adminInputClass}
                style={adminInputStyle}
              />
            </Field>
            <Field label="Size" className="min-w-[100px]">
              <input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M"
                className={adminInputClass}
                style={adminInputStyle}
              />
            </Field>
            <Field label="Price (₹)" className="min-w-[100px]">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </Field>
            <Field label="Stock" className="min-w-[100px]">
              <input
                required
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
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
              {creating ? "Adding..." : "Add variant"}
            </button>
          </form>
          {createError && (
            <p className="mt-2 text-xs" style={{ color: ORANGE }}>
              {createError}
            </p>
          )}

          <div className="mt-6">
            {loadingVariants && (
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Loading variants...
              </p>
            )}
            {error && (
              <p className="text-sm" style={{ color: ORANGE }}>
                {error}
              </p>
            )}

            {!loadingVariants && !error && (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left" style={adminHeadRowStyle}>
                      <th className={adminThClass} style={adminThStyle}>Colour</th>
                      <th className={adminThClass} style={adminThStyle}>Size</th>
                      <th className={adminThClass} style={adminThStyle}>Price</th>
                      <th className={adminThClass} style={adminThStyle}>Stock</th>
                      <th className={`${adminThClass} text-right`} style={adminThStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr key={v.variantId} style={adminRowStyle}>
                        {editingId === v.variantId ? (
                          <>
                            <td className="py-2 pr-3">
                              <input
                                value={editColour}
                                onChange={(e) => setEditColour(e.target.value)}
                                className={`${adminCellInputClass} !w-24`}
                                style={adminInputStyle}
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                value={editSize}
                                onChange={(e) => setEditSize(e.target.value)}
                                className={`${adminCellInputClass} !w-16`}
                                style={adminInputStyle}
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className={`${adminCellInputClass} !w-24`}
                                style={adminInputStyle}
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                type="number"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className={`${adminCellInputClass} !w-24`}
                                style={adminInputStyle}
                              />
                            </td>
                            <td className="space-x-3 whitespace-nowrap py-2 text-right">
                              <button
                                onClick={() => saveEdit(v.variantId)}
                                disabled={savingEdit}
                                className={adminRowBtnClass}
                                style={{ color: ORANGE }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  toast.info("Edit cancelled.");
                                }}
                                className={adminRowBtnClass}
                                style={{ color: colors.textMuted }}
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 pr-3">{v.colour || "—"}</td>
                            <td className="py-2 pr-3">{v.size || "—"}</td>
                            <td className="py-2 pr-3">₹{v.price}</td>
                            <td className="py-2 pr-3">{v.stockQuantity}</td>
                            <td className="space-x-3 whitespace-nowrap py-2 text-right">
                              <button
                                onClick={() => startEdit(v)}
                                className={adminRowBtnClass}
                                style={{ color: colors.text }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(v.variantId)}
                                disabled={deletingId === v.variantId}
                                className={adminRowBtnClass}
                                style={{ color: ORANGE }}
                              >
                                {deletingId === v.variantId ? "Deleting..." : "Delete"}
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingVariants && !error && variants.length === 0 && (
              <p className="mt-4 text-sm" style={{ color: colors.textMuted }}>
                No variants for this product yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}