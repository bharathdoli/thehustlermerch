"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/src/components/ProductCard";
import { getCategories, getProducts } from "@/src/lib/productdata";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

export default function ProductsPage() {
  const { colors } = useTheme();
  const categories = getCategories();
  const [activeSlug, setActiveSlug] = useState<string>("all");

  const products = useMemo(() => getProducts(activeSlug), [activeSlug]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Custom Merchandise</span>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl" style={{ color: colors.text }}>
        All Products
      </h1>
      <p className="mt-3 max-w-xl text-sm" style={{ color: colors.textMuted }}>
        Pick a category to browse styles, or scroll everything below. Every product ships with
        your logo — upload it on the product page before you check out.
      </p>

      {/* Category tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b pb-6" style={{ borderColor: colors.line }}>
        <button
          onClick={() => setActiveSlug("all")}
          className="border px-4 py-2 font-mono text-xs uppercase tracking-widest transition"
          style={
            activeSlug === "all"
              ? { borderColor: SIGNAL, backgroundColor: SIGNAL, color: "#131210" }
              : { borderColor: colors.lineStrong, color: colors.textMuted }
          }
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.categoryId}
            onClick={() => setActiveSlug(c.slug)}
            className="border px-4 py-2 font-mono text-xs uppercase tracking-widest transition"
            style={
              activeSlug === c.slug
                ? { borderColor: SIGNAL, backgroundColor: SIGNAL, color: "#131210" }
                : { borderColor: colors.lineStrong, color: colors.textMuted }
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <p className="mt-16 text-center font-mono text-sm" style={{ color: colors.textMuted }}>
          No products in this category yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}