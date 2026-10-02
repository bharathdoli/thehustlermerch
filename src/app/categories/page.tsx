"use client";

/**
 * TheHustlerMerchandise — All Categories page
 * -----------------------------------------------------------------------
 * Fetches live categories from GET /api/categories and renders them using
 * the same dark/light + SIGNAL theme as the rest of the site.
 * -----------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import { SIGNAL, hexToRgba, useTheme } from "@/src/context/ThemeContext";
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
// listCategoriesUseCase currently returns `description` / `imageUrl`,
// while getCategoryUseCase returns `categoryDescription` / `categoryImage`.
// We accept either so the page keeps working regardless of which shape
// the API ends up returning.
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
    const { colors } = useTheme();
    const [failed, setFailed] = useState(false);

    if (failed || !src) {
        return (
            <div
                className={`${className ?? ""} flex items-center justify-center`}
                style={{ backgroundColor: colors.panel }}
            >
                <span
                    className="font-mono text-[10px] tracking-widest"
                    style={{ color: colors.textMuted }}
                >
                    IMAGE UNAVAILABLE
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

function HazardRule({ className = "" }: { className?: string }) {
    const { colors } = useTheme();

    return (
        <div
            className={`h-2 w-full ${className}`}
            style={{
                backgroundImage: `repeating-linear-gradient(135deg, ${SIGNAL} 0 10px, ${colors.bg} 10px 20px)`,
            }}
        />
    );
}

/* -------------------------------------------------------------------- */
/* Category card                                                        */
/* -------------------------------------------------------------------- */

function CategoryCard({ category }: { category: CategoryDTO }) {
    const { colors } = useTheme();

    const fallbackImage = `https://picsum.photos/seed/hustler-cat-${category.categoryId}/600/800`;

    return (
        <a
            href={`/products?category=${category.categoryId}`}
            className="group relative block aspect-[3/4] overflow-hidden border"
            style={{
                borderColor: colors.line,
                backgroundColor: colors.panel,
            }}
        >
            <Img
                src={category.categoryImage || fallbackImage}
                alt={category.categoryName}
                className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
            />

            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(to top, ${colors.bg}, ${hexToRgba(colors.bg, 0.1)}, transparent)`,
                }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p
                    className="break-words font-display text-base uppercase tracking-tight sm:text-xl"
                    style={{ color: colors.text }}
                >
                    {category.categoryName}
                </p>

                {category.categoryDescription && (
                    <p
                        className="mt-1 line-clamp-2 max-w-[90%] font-mono text-[10px] leading-relaxed"
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
    const { colors } = useTheme();

    return (
        <div
            className="aspect-[3/4] animate-pulse border"
            style={{
                borderColor: colors.line,
                backgroundColor: colors.panel,
            }}
        />
    );
}

/* -------------------------------------------------------------------- */
/* Page                                                                 */
/* -------------------------------------------------------------------- */

export default function CategoriesPage() {
    const { colors } = useTheme();
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
                const res = await fetch("/api/categories", {
                    cache: "no-store",
                });

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
        <div>
            <HazardRule />

            <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 sm:py-20">
                <div className="mb-8 border-b pb-6 sm:mb-10" style={{ borderColor: colors.line }}>
                    <span
                        className="font-mono text-[11px] tracking-[0.25em]"
                        style={{ color: SIGNAL }}
                    >
                        Collections
                    </span>

                    <h1
                        className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-5xl"
                        style={{ color: colors.text }}
                    >
                        All Categories
                    </h1>

                    <p className="mt-3 max-w-lg text-sm" style={{ color: colors.textMuted }}>
                        Browse every collection we print — hoodies, tees, headwear,
                        and accessories, all heavyweight and small-batch.
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
                        className="border px-4 py-10 text-center sm:px-6 sm:py-14"
                        style={{ borderColor: colors.line, backgroundColor: colors.panel }}
                    >
                        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: SIGNAL }}>
                            Something went wrong
                        </p>
                        <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                            We couldn&apos;t load categories right now. Please try again.
                        </p>

                        <button
                            type="button"
                            onClick={handleRetry}
                            className="mt-5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
                            style={{ backgroundColor: SIGNAL, color: "#131210" }}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {status === "success" && categories.length === 0 && (
                    <div
                        className="border px-4 py-10 text-center sm:px-6 sm:py-14"
                        style={{ borderColor: colors.line, backgroundColor: colors.panel }}
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

            <HazardRule />
        </div>
    );
}