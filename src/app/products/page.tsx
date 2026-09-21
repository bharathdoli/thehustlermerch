"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/src/components/ProductCard";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

/* -------------------------------------------------------------------- */
/* Types                                                                 */
/* -------------------------------------------------------------------- */

type ProductVariant = {
  variantId?: string;
  colour?: string;
  size?: string;
  price: number;
  stockQuantity?: number;
};

// Shape used internally by ProductCard.
type Product = {
  productId: string;
  categoryId?: string;
  productName: string;
  description?: string | null;
  productImage?: string | null;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
};

// Raw shape as it may come back from GET /api/products. Accepts both the
// lowercase keys returned by listProductUseCase and the capitalised keys
// returned by getProductUseCase, so the page keeps working either way.
type ProductApiResponse = {
  productId?: string;
  ProductId?: string;
  categoryId?: string;
  CategoryId?: string;
  productName?: string;
  ProductName?: string;
  description?: string | null;
  ProductDescription?: string | null;
  productImage?: string | null;
  ProductImage?: string | null;
  rating?: number | string;
  reviewCount?: number;
  variants?: ProductVariant[];
};

type Category = {
  categoryId: string;
  categoryName: string;
};

type CategoryApiResponse = {
  categoryId: string;
  categoryName: string;
};

/* -------------------------------------------------------------------- */
/* Normalizers                                                          */
/* -------------------------------------------------------------------- */

function normalizeProduct(raw: ProductApiResponse): Product {
  return {
    productId: (raw.productId ?? raw.ProductId ?? "") as string,
    categoryId: raw.categoryId ?? raw.CategoryId,
    productName: (raw.productName ?? raw.ProductName ?? "") as string,
    description: raw.description ?? raw.ProductDescription ?? null,
    productImage: raw.productImage ?? raw.ProductImage ?? null,
    rating: raw.rating !== undefined ? Number(raw.rating) : 0,
    reviewCount: raw.reviewCount ?? 0,
    variants: raw.variants ?? [],
  };
}

function normalizeCategory(raw: CategoryApiResponse): Category {
  return {
    categoryId: raw.categoryId,
    categoryName: raw.categoryName,
  };
}

/* -------------------------------------------------------------------- */
/* Skeleton loader                                                      */
/* -------------------------------------------------------------------- */

function ProductCardSkeleton() {
  const { colors } = useTheme();

  return (
    <div>
      <div
        className="aspect-[4/5] animate-pulse border"
        style={{ borderColor: colors.line, backgroundColor: colors.panel }}
      />
      <div
        className="mt-3 h-3 w-3/4 animate-pulse"
        style={{ backgroundColor: colors.panel }}
      />
      <div
        className="mt-2 h-3 w-1/2 animate-pulse"
        style={{ backgroundColor: colors.panel }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Page                                                                 */
/* -------------------------------------------------------------------- */

export default function ProductsPage() {
  const { colors } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setStatus("loading");

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        if (!productsRes.ok) {
          throw new Error(`Products request failed with ${productsRes.status}`);
        }

        if (!categoriesRes.ok) {
          throw new Error(
            `Categories request failed with ${categoriesRes.status}`
          );
        }

        const productsData: ProductApiResponse[] = await productsRes.json();
        const categoriesData: CategoryApiResponse[] = await categoriesRes.json();

        if (!cancelled) {
          setProducts(productsData.map(normalizeProduct));
          setCategories(categoriesData.map(normalizeCategory));
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === "all") {
      return products;
    }

    return products.filter(
      (product) => product.categoryId === activeCategoryId
    );
  }, [products, activeCategoryId]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <span
        className="font-mono text-[11px] tracking-[0.25em]"
        style={{ color: SIGNAL }}
      >
        Custom Merchandise
      </span>

      <h1
        className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl"
        style={{ color: colors.text }}
      >
        All Products
      </h1>

      <p className="mt-3 max-w-xl text-sm" style={{ color: colors.textMuted }}>
        Pick a category to browse styles, or scroll everything below. Every
        product ships with your logo — upload it on the product page before
        you check out.
      </p>

      {/* Category tabs */}
      <div
        className="mt-8 flex flex-wrap gap-2 border-b pb-6"
        style={{ borderColor: colors.line }}
      >
        <button
          onClick={() => setActiveCategoryId("all")}
          className="border px-4 py-2 font-mono text-xs uppercase tracking-widest transition"
          style={
            activeCategoryId === "all"
              ? {
                  borderColor: SIGNAL,
                  backgroundColor: SIGNAL,
                  color: "#131210",
                }
              : { borderColor: colors.lineStrong, color: colors.textMuted }
          }
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.categoryId}
            onClick={() => setActiveCategoryId(category.categoryId)}
            className="border px-4 py-2 font-mono text-xs uppercase tracking-widest transition"
            style={
              activeCategoryId === category.categoryId
                ? {
                    borderColor: SIGNAL,
                    backgroundColor: SIGNAL,
                    color: "#131210",
                  }
                : { borderColor: colors.lineStrong, color: colors.textMuted }
            }
          >
            {category.categoryName}
          </button>
        ))}
      </div>

      {/* Loading */}

      {status === "loading" && (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}

      {status === "error" && (
        <div
          className="mt-10 border px-6 py-14 text-center"
          style={{ borderColor: colors.line, backgroundColor: colors.panel }}
        >
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: SIGNAL }}
          >
            Something went wrong
          </p>
          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
            We couldn&apos;t load products right now. Refresh the page to try
            again.
          </p>
        </div>
      )}

      {/* Empty */}

      {status === "success" && filteredProducts.length === 0 && (
        <p
          className="mt-16 text-center font-mono text-sm"
          style={{ color: colors.textMuted }}
        >
          No products in this category yet.
        </p>
      )}

      {/* Grid */}

      {status === "success" && filteredProducts.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}