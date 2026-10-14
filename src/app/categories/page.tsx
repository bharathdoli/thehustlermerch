"use client";

/**
 * TheHustlerMerchandise — All Categories page
 * Fetches live categories from GET /api/categories.
 * Single brand theme: white, black, grey and orange (src/lib/palette.ts).
 */

import { useEffect, useState } from "react";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

/* -------------------------------------------------------------------- */
/* Types                                                                */
/* -------------------------------------------------------------------- */

// Shape used internally by the page/UI components.
type CategoryDTO = {
  categoryId: string;
  categoryName: string;
  categoryDescription?: string | null;
  categoryImage?: string | null;
};

// Raw shape as it may come back from GET /api/categories.
// We accept either `description`/`imageUrl` or
// `categoryDescription`/`categoryImage`.
type CategoryApiResponse = {
  categoryId: string;
  categoryName: string;
  description?: string | null;
  imageUrl?: string | null;
  categoryDescription?: string | null;
  categoryImage?: string | null;
};

function normalizeCategory(raw: CategoryApiResponse): CategoryDTO {
  return {
    categoryId: raw.categoryId,
    categoryName: raw.categoryName,
    categoryDescription: raw.categoryDescription ?? raw.description ?? null,
    categoryImage: raw.categoryImage ?? raw.imageUrl ?? null,
  };
}

/* -------------------------------------------------------------------- */
/* Shared bits                                                          */
/* -------------------------------------------------------------------- */

function Img({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const colors = usePalette();
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center`}
        style={{ backgroundColor: colors.panel }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: colors.textMuted }}
        >
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

/* -------------------------------------------------------------------- */
/* Category card                                                        */
/* -------------------------------------------------------------------- */

function CategoryCard({ category }: { category: CategoryDTO }) {
  const colors = usePalette();

  const fallbackImage = `https://picsum.photos/seed/hustler-cat-${category.categoryId}/600/800`;

  return (
    <a
      href={`/products?category=${category.categoryId}`}
      className="group relative block aspect-[3/4] overflow-hidden"
      style={{ backgroundColor: colors.panel }}
    >
      <Img
        src={category.categoryImage || fallbackImage}
        alt={category.categoryName}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      {/* white fade so the text stays readable */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(255,255,255,0.96), rgba(255,255,255,0.35) 45%, transparent 70%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p
          className="break-words font-display text-base font-black uppercase leading-[0.95] tracking-[-0.02em] sm:text-xl"
          style={{ color: colors.text }}
        >
          {category.categoryName}
        </p>

        {category.categoryDescription && (
          <p
            className="mt-1 line-clamp-2 max-w-[90%] text-[11px] leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {category.categoryDescription}
          </p>
        )}
      </div>
    </a>
  );
}

/* -------------------------------------------------------------------- */
/* Skeleton loader                                                      */
/* -------------------------------------------------------------------- */

function CategoryCardSkeleton() {
  const colors = usePalette();

  return (
    <div
      className="aspect-[3/4] animate-pulse"
      style={{ backgroundColor: colors.panel }}
    />
  );
}

/* -------------------------------------------------------------------- */
/* Page                                                                 */
/* -------------------------------------------------------------------- */

export default function CategoriesPage() {
  const colors = usePalette();
  const toast = useToast();

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Bumped by the "Try again" button to re-run the fetch.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setStatus("loading");

      try {
        const res = await fetch("/api/categories", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }

        const data: CategoryApiResponse[] = await res.json();
        const normalized = data.map(normalizeCategory);

        if (!cancelled) {
          setCategories(normalized);
          setStatus("success");

          // Only confirm after a manual retry, not on first load.
          if (reloadKey > 0) {
            toast.success("Categories loaded.");
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          toast.error("Couldn't load categories. Please try again.");
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, toast]);

  function handleRetry() {
    toast.info("Retrying...");
    setReloadKey((previous) => previous + 1);
  }

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-[70vh]">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 sm:py-16">
        <div className="mb-8 sm:mb-10">
          <span
            className="text-[11px] font-medium uppercase tracking-[0.25em]"
            style={{ color: ORANGE }}
          >
            Collections
          </span>

          <h1
            className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
            style={{ color: colors.text }}
          >
            All categories
          </h1>

          <p className="mt-4 max-w-lg text-sm" style={{ color: colors.textMuted }}>
            Browse every collection we print — hoodies, tees, headwear, and
            accessories, all heavyweight and small-batch.
          </p>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div
            className="px-4 py-10 text-center sm:px-6 sm:py-14"
            style={{ backgroundColor: colors.panel }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.25em]"
              style={{ color: ORANGE }}
            >
              Something went wrong
            </p>
            <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
              We couldn&apos;t load categories right now. Please try again.
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80"
              style={{ backgroundColor: colors.text, color: colors.bg }}
            >
              Try again
            </button>
          </div>
        )}

        {status === "success" && categories.length === 0 && (
          <div
            className="px-4 py-10 text-center sm:px-6 sm:py-14"
            style={{ backgroundColor: colors.panel }}
          >
            <p className="text-sm" style={{ color: colors.textMuted }}>
              No categories yet — check back soon.
            </p>
          </div>
        )}

        {status === "success" && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.categoryId} category={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}