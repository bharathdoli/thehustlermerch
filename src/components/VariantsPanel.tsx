"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@/src/context/ToastContext";

type Product = { productId: string; productName: string };
type Variant = {
  variantId: string;
  productId: string;
  colour: string | null;
  size: string | null;
  price: string;
  stockQuantity: number;
};

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
      // alert(err instanceof Error ? err.message : "Failed to update variant.");
      toast.error(err instanceof Error ? err.message : "Failed to update variant.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(variantId: string) {
    if (!confirm("Delete this variant?")) return;
    setDeletingId(variantId);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/variants/${variantId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete variant.");
      }
      await fetchVariants(selectedProductId);
      toast.success("Variant deleted.");
    } catch (err) {
      // alert(err instanceof Error ? err.message : "Failed to delete variant.");
      toast.error(err instanceof Error ? err.message : "Failed to delete variant.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="max-w-xs w-full">
        <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Select product</label>
        <select
          value={selectedProductId}
          onChange={(e) => handleProductChange(e.target.value)}
          disabled={loadingProducts}
          className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">{loadingProducts ? "Loading..." : "Choose a product..."}</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.productName}
            </option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <>
          <form onSubmit={handleCreate} className="mt-6 flex flex-wrap items-end gap-3 border border-black/10 p-4">
            <div className="min-w-[120px] max-w-full">
              <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Colour</label>
              <input
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Black"
                className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="min-w-[100px] max-w-full">
              <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Size</label>
              <input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M"
                className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="min-w-[100px] max-w-full">
              <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Price (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="min-w-[100px] max-w-full">
              <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Stock</label>
              <input
                required
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest bg-orange-500 text-black disabled:opacity-50
                w-full min-h-[40px] sm:w-auto"
            >
              {creating ? "Adding..." : "Add Variant"}
            </button>
          </form>
          {createError && <p className="mt-2 font-mono text-xs text-red-600">{createError}</p>}

          <div className="mt-6">
            {loadingVariants && <p className="text-sm opacity-60">Loading variants...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loadingVariants && !error && (
              <div className="w-full overflow-x-auto">
              <table
                className="w-full border-collapse text-sm
                  min-w-[520px]"
              >
                <thead>
                  <tr className="border-b border-black/10 text-left font-mono text-[10px] uppercase tracking-widest opacity-60">
                    <th className="py-2">Colour</th>
                    <th className="py-2">Size</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.variantId} className="border-b border-black/5">
                      {editingId === v.variantId ? (
                        <>
                          <td className="py-2 pr-3">
                            <input
                              value={editColour}
                              onChange={(e) => setEditColour(e.target.value)}
                              className="w-20 border border-black/20 px-2 py-1 text-sm focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={editSize}
                              onChange={(e) => setEditSize(e.target.value)}
                              className="w-16 border border-black/20 px-2 py-1 text-sm focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 border border-black/20 px-2 py-1 text-sm focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-20 border border-black/20 px-2 py-1 text-sm focus:outline-none"
                            />
                          </td>
                          <td className="py-2 text-right space-x-2
                            whitespace-nowrap">
                            <button
                              onClick={() => saveEdit(v.variantId)}
                              disabled={savingEdit}
                              className="font-mono text-[10px] uppercase tracking-widest text-orange-600
                                min-h-[32px]"
                            >
                              Save
                            </button>
                            <button onClick={() => { setEditingId(null); toast.info("Edit cancelled."); }} className="font-mono text-[10px] uppercase tracking-widest opacity-60
                              min-h-[32px]">
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
                          <td className="py-2 text-right space-x-3
                            whitespace-nowrap">
                            <button onClick={() => startEdit(v)} className="font-mono text-[10px] uppercase tracking-widest text-orange-600
                              min-h-[32px]">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(v.variantId)}
                              disabled={deletingId === v.variantId}
                              className="font-mono text-[10px] uppercase tracking-widest text-red-600 disabled:opacity-50
                                min-h-[32px]"
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
              <p className="mt-4 text-sm opacity-60">No variants for this product yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}