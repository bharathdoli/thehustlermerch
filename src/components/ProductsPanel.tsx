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
  adminCellInputClass,
  adminPrimaryBtnClass,
  adminPrimaryBtnStyle,
  adminRowBtnClass,
  adminThClass,
  adminThStyle,
  adminHeadRowStyle,
  adminRowStyle,
} from "@/src/components/AdminUi";

type Category = { categoryId: string; categoryName: string };
type Product = {
  productId: string;
  categoryId: string;
  productName: string;
  description: string | null;
  productImage: string | null;
  rating: number | null;
  reviewCount: number | null;
};

export default function ProductsPanel() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState("");
  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editReviewCount, setEditReviewCount] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [prodRes, catRes] = await Promise.all([fetch("/api/products"), fetch("/api/categories")]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (!prodRes.ok) throw new Error(prodData.message ?? "Failed to load products.");
      if (!catRes.ok) throw new Error(catData.message ?? "Failed to load categories.");
      setProducts(Array.isArray(prodData) ? prodData : prodData.data ?? []);
      setCategories(Array.isArray(catData) ? catData : catData.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
      toast.error(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function categoryName(id: string) {
    return categories.find((c) => c.categoryId === id)?.categoryName ?? "—";
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!categoryId) {
      setCreateError("Select a category.");
      toast.error("Select a category.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          productName,
          description: description || undefined,
          productImage: productImage || undefined,
          rating: rating ? Number(rating) : undefined,
          reviewCount: reviewCount ? Number(reviewCount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstFieldError = data.errors ? (Object.values(data.errors)[0] as string[]) : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to create product.");
      }
      setProductName("");
      setDescription("");
      setProductImage("");
      setRating("");
      setReviewCount("");
      setCategoryId("");
      await fetchAll();
      toast.success("Product added.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create product.");
      toast.error(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.productId);
    setEditName(p.productName);
    setEditDescription(p.description ?? "");
    setEditImage(p.productImage ?? "");
    setEditRating(p.rating != null ? String(p.rating) : "");
    setEditReviewCount(p.reviewCount != null ? String(p.reviewCount) : "");
  }

  async function saveEdit(productId: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: editName,
          description: editDescription || undefined,
          productImage: editImage || undefined,
          rating: editRating ? Number(editRating) : undefined,
          reviewCount: editReviewCount ? Number(editReviewCount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update product.");
      setEditingId(null);
      await fetchAll();
      toast.success("Product updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product? This will also affect its variants.")) return;
    setDeletingId(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete product.");
      }
      await fetchAll();
      toast.success("Product deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full min-w-0">
      <form onSubmit={handleCreate} className={adminFormClass} style={adminFormStyle}>
        <Field label="Category" className="min-w-[160px]">
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={adminInputClass}
            style={adminInputStyle}
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Product name" className="min-w-[180px] flex-1">
          <input
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Canvas Tote"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Description (optional)" className="min-w-[220px] flex-1">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Image URL (optional)" className="min-w-[220px] flex-1">
          <input
            value={productImage}
            onChange={(e) => setProductImage(e.target.value)}
            placeholder="https://..."
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Rating (optional)" className="min-w-[100px]">
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="4.5"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Review count" className="min-w-[120px]">
          <input
            type="number"
            step="1"
            min="0"
            value={reviewCount}
            onChange={(e) => setReviewCount(e.target.value)}
            placeholder="0"
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
          {creating ? "Adding..." : "Add product"}
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
            Loading products...
          </p>
        )}
        {error && (
          <p className="text-sm" style={{ color: ORANGE }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="text-left" style={adminHeadRowStyle}>
                  <th className={adminThClass} style={adminThStyle}>Name</th>
                  <th className={adminThClass} style={adminThStyle}>Category</th>
                  <th className={adminThClass} style={adminThStyle}>Description</th>
                  <th className={adminThClass} style={adminThStyle}>Image</th>
                  <th className={adminThClass} style={adminThStyle}>Rating</th>
                  <th className={adminThClass} style={adminThStyle}>Reviews</th>
                  <th className={`${adminThClass} text-right`} style={adminThStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productId} style={adminRowStyle}>
                    {editingId === p.productId ? (
                      <>
                        <td className="py-2 pr-3">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={adminCellInputClass}
                            style={adminInputStyle}
                          />
                        </td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {categoryName(p.categoryId)}
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className={adminCellInputClass}
                            style={adminInputStyle}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            placeholder="https://..."
                            className={adminCellInputClass}
                            style={adminInputStyle}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={editRating}
                            onChange={(e) => setEditRating(e.target.value)}
                            className={`${adminCellInputClass} !w-16`}
                            style={adminInputStyle}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={editReviewCount}
                            onChange={(e) => setEditReviewCount(e.target.value)}
                            className={`${adminCellInputClass} !w-16`}
                            style={adminInputStyle}
                          />
                        </td>
                        <td className="space-x-3 whitespace-nowrap py-2 text-right">
                          <button
                            onClick={() => saveEdit(p.productId)}
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
                        <td className="py-2 pr-3 font-medium">{p.productName}</td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {categoryName(p.categoryId)}
                        </td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {p.description || "—"}
                        </td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {p.productImage ? (
                            <img
                              src={p.productImage}
                              alt={p.productName}
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {p.rating ?? "—"}
                        </td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {p.reviewCount ?? "—"}
                        </td>
                        <td className="space-x-3 whitespace-nowrap py-2 text-right">
                          <button
                            onClick={() => startEdit(p)}
                            className={adminRowBtnClass}
                            style={{ color: colors.text }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.productId)}
                            disabled={deletingId === p.productId}
                            className={adminRowBtnClass}
                            style={{ color: ORANGE }}
                          >
                            {deletingId === p.productId ? "Deleting..." : "Delete"}
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

        {!loading && !error && products.length === 0 && (
          <p className="mt-4 text-sm" style={{ color: colors.textMuted }}>
            No products yet.
          </p>
        )}
      </div>
    </div>
  );
}