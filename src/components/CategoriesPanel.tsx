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

type Category = {
  categoryId: string;
  categoryName: string;
  description: string | null;
  imageUrl: string | null;
};

export default function CategoriesPanel() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit state — which row is being edited, and its draft values
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchCategories() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load categories.");
      setCategories(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
      toast.error(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: name,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstFieldError = data.errors ? (Object.values(data.errors)[0] as string[]) : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to create category.");
      }
      setName("");
      setDescription("");
      setImageUrl("");
      await fetchCategories();
      toast.success("Category added.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create category.");
      toast.error(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.categoryId);
    setEditName(cat.categoryName);
    setEditDescription(cat.description ?? "");
    setEditImageUrl(cat.imageUrl ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    toast.info("Edit cancelled.");
  }

  async function saveEdit(categoryId: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: editName,
          description: editDescription || undefined,
          imageUrl: editImageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update category.");
      setEditingId(null);
      await fetchCategories();
      toast.success("Category updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(categoryId: string) {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    setDeletingId(categoryId);
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete category.");
      }
      await fetchCategories();
      toast.success("Category deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full min-w-0">
      {/* Create form */}
      <form onSubmit={handleCreate} className={adminFormClass} style={adminFormStyle}>
        <Field label="Category name" className="min-w-[180px] flex-1">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tote Bags"
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
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
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
          {creating ? "Adding..." : "Add category"}
        </button>
      </form>
      {createError && (
        <p className="mt-2 text-xs" style={{ color: ORANGE }}>
          {createError}
        </p>
      )}

      {/* List */}
      <div className="mt-6">
        {loading && (
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Loading categories...
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
                  <th className={adminThClass} style={adminThStyle}>Name</th>
                  <th className={adminThClass} style={adminThStyle}>Description</th>
                  <th className={adminThClass} style={adminThStyle}>Image</th>
                  <th className={`${adminThClass} text-right`} style={adminThStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.categoryId} style={adminRowStyle}>
                    {editingId === cat.categoryId ? (
                      <>
                        <td className="py-2 pr-3">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={adminCellInputClass}
                            style={adminInputStyle}
                          />
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
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            placeholder="https://..."
                            className={adminCellInputClass}
                            style={adminInputStyle}
                          />
                        </td>
                        <td className="space-x-3 whitespace-nowrap py-2 text-right">
                          <button
                            onClick={() => saveEdit(cat.categoryId)}
                            disabled={savingEdit}
                            className={adminRowBtnClass}
                            style={{ color: ORANGE }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={adminRowBtnClass}
                            style={{ color: colors.textMuted }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-3 font-medium">{cat.categoryName}</td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {cat.description || "—"}
                        </td>
                        <td className="py-2 pr-3" style={{ color: colors.textMuted }}>
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.categoryName}
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="space-x-3 whitespace-nowrap py-2 text-right">
                          <button
                            onClick={() => startEdit(cat)}
                            className={adminRowBtnClass}
                            style={{ color: colors.text }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.categoryId)}
                            disabled={deletingId === cat.categoryId}
                            className={adminRowBtnClass}
                            style={{ color: ORANGE }}
                          >
                            {deletingId === cat.categoryId ? "Deleting..." : "Delete"}
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

        {!loading && !error && categories.length === 0 && (
          <p className="mt-4 text-sm" style={{ color: colors.textMuted }}>
            No categories yet — add one above.
          </p>
        )}
      </div>
    </div>
  );
}