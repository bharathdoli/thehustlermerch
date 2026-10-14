"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/src/components/ProductCard";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

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
  const colors = usePalette();

  return (
    <div>
      <div
        className="aspect-[4/5] animate-pulse"
        style={{ backgroundColor: colors.panel }}
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
  const colors = usePalette();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

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
          throw new Error(`Categories request failed with ${categoriesRes.status}`);
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
          toast.error("We couldn't load products. Please try again.");
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

    return products.filter((product) => product.categoryId === activeCategoryId);
  }, [products, activeCategoryId]);

  // Toast feedback whenever a category tab is clicked (skips first render
  // and anything that happens before the data has loaded).
  const isFirstCategoryRender = useRef(true);

  useEffect(() => {
    if (isFirstCategoryRender.current) {
      isFirstCategoryRender.current = false;
      return;
    }

    if (status !== "success") return;

    if (activeCategoryId === "all") {
      toast.info(`Showing all products (${products.length})`);
      return;
    }

    const name =
      categories.find((c) => c.categoryId === activeCategoryId)?.categoryName ??
      "this category";

    if (filteredProducts.length === 0) {
      toast.info(`No products in ${name} yet.`);
    } else {
      toast.info(
        `Showing ${filteredProducts.length} ${
          filteredProducts.length === 1 ? "product" : "products"
        } in ${name}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId]);

  /* ---------- shared styles (same look as the account page) ---------- */
  const tabClass =
    "min-h-[40px] max-w-full break-words border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-80";
  const activeTab = {
    borderColor: colors.text,
    backgroundColor: colors.text,
    color: colors.bg,
  };
  const idleTab = {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    color: colors.textMuted,
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-[70vh]">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:px-8 sm:py-16 md:px-10 lg:px-12">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ color: ORANGE }}
        >
          Custom merchandise
        </span>

        <h1
          className="mt-1.5 break-words font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          style={{ color: colors.text }}
        >
          All products
        </h1>

        <p
          className="mt-4 max-w-xl text-sm sm:text-base"
          style={{ color: colors.textMuted }}
        >
          Pick a category to browse styles, or scroll everything below. Every
          product ships with your logo — upload it on the product page before you
          check out.
        </p>

        {/* Category tabs */}
        <div
          className="mt-8 flex flex-wrap gap-2 border-b pb-6 sm:gap-3"
          style={{ borderColor: colors.line }}
        >
          <button
            onClick={() => setActiveCategoryId("all")}
            className={tabClass}
            style={activeCategoryId === "all" ? activeTab : idleTab}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.categoryId}
              onClick={() => setActiveCategoryId(category.categoryId)}
              className={tabClass}
              style={activeCategoryId === category.categoryId ? activeTab : idleTab}
            >
              {category.categoryName}
            </button>
          ))}
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div
            className="mt-10 px-6 py-14 text-center sm:px-10"
            style={{ backgroundColor: colors.panel }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.25em]"
              style={{ color: ORANGE }}
            >
              Something went wrong
            </p>
            <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
              We couldn&apos;t load products right now. Refresh the page to try again.
            </p>

            <button
              onClick={() => {
                toast.info("Reloading products…");
                window.location.reload();
              }}
              className="mt-6 min-h-[40px] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80"
              style={{ backgroundColor: colors.text, color: colors.bg }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "success" && filteredProducts.length === 0 && (
          <p className="mt-16 text-center text-sm" style={{ color: colors.textMuted }}>
            No products in this category yet.
          </p>
        )}

        {/* Grid */}
        {status === "success" && filteredProducts.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}