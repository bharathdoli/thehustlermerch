"use client";

import { useEffect, useState, type FormEvent } from "react";

type Category = {
  categoryId: string;
  categoryName: string;
  description: string | null;
  imageUrl: string | null;
};

export default function CategoriesPanel() {
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
        const firstFieldError = data.errors ? Object.values(data.errors)[0] as string[] : null;
        throw new Error(firstFieldError?.[0] ?? data.message ?? "Failed to create category.");
      }
      setName("");
      setDescription("");
      setImageUrl("");
      await fetchCategories();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create category.");
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update category.");
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Create form */}
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 border border-black/10 p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Category name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tote Bags"
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block font-mono text-[10px] uppercase tracking-widest opacity-60">Image URL (optional)</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full border border-black/20 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest bg-orange-500 text-black disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add Category"}
        </button>
      </form>
      {createError && <p className="mt-2 font-mono text-xs text-red-600">{createError}</p>}

      {/* List */}
      <div className="mt-6">
        {loading && <p className="text-sm opacity-60">Loading categories...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left font-mono text-[10px] uppercase tracking-widest opacity-60">
                <th className="py-2">Name</th>
                <th className="py-2">Description</th>
                <th className="py-2">Image</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.categoryId} className="border-b border-black/5">
                  {editingId === cat.categoryId ? (
                    <>
                      <td className="py-2 pr-3">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-black/20 px-2 py-1 text-sm focus:outline-none"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border border-black/20 px-2 py-1 text-sm focus:outline-none"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-black/20 px-2 py-1 text-sm focus:outline-none"
                        />
                      </td>
                      <td className="py-2 text-right space-x-2">
                        <button
                          onClick={() => saveEdit(cat.categoryId)}
                          disabled={savingEdit}
                          className="font-mono text-[10px] uppercase tracking-widest text-orange-600"
                        >
                          Save
                        </button>
                        <button onClick={cancelEdit} className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-3">{cat.categoryName}</td>
                      <td className="py-2 pr-3 opacity-70">{cat.description || "—"}</td>
                      <td className="py-2 pr-3 opacity-70">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.categoryName} className="h-8 w-8 object-cover" />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 text-right space-x-3">
                        <button
                          onClick={() => startEdit(cat)}
                          className="font-mono text-[10px] uppercase tracking-widest text-orange-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.categoryId)}
                          disabled={deletingId === cat.categoryId}
                          className="font-mono text-[10px] uppercase tracking-widest text-red-600 disabled:opacity-50"
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
        )}

        {!loading && !error && categories.length === 0 && (
          <p className="mt-4 text-sm opacity-60">No categories yet — add one above.</p>
        )}
      </div>
    </div>
  );
}