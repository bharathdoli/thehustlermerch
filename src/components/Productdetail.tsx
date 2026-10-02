"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SIGNAL, hexToRgba, useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";

const QUANTITY_TIERS = [2, 5, 10, 15, 20, 50, 75, 100];
const PENDING_CART_KEY = "hustler-pending-cart-item";
/* Max design upload size (added) */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
type ProductVariant = {
  variantId: string;
  productId: string;
  colour?: string | null;
  size?: string | null;
  price: number | string;
  stockQuantity?: number;
};

type Product = {
  ProductId: string;
  CategoryId?: string | null;
  ProductName: string;
  ProductDescription?: string | null;
  ProductImage?: string | null;
  rating?: number | string;
  reviewCount?: number;
  variants?: ProductVariant[];
};

type Review = {
  rid: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    uname?: string | null;
  } | null;
};

type ReviewsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

/* -------------------------------------------------------------------------- */
/* Image                                                                      */
/* -------------------------------------------------------------------------- */

function DetailImg({
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

  if (!src || failed) {
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
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Rating                                                                     */
/* -------------------------------------------------------------------------- */

function StarRating({ rating }: { rating: number }) {
  const { theme } = useTheme();

  const emptyStroke =
    theme === "dark" ? "#5a5648" : "#c9c1af";

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);

        return (
          <svg
            key={i}
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill={filled ? SIGNAL : "none"}
            stroke={filled ? SIGNAL : emptyStroke}
            strokeWidth="1.5"
          >
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Review stars (smaller, used inside review cards)                          */
/* -------------------------------------------------------------------------- */

function ReviewStars({ rating }: { rating: number }) {
  const { theme } = useTheme();
  const emptyStroke = theme === "dark" ? "#5a5648" : "#c9c1af";

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);

        return (
          <svg
            key={i}
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill={filled ? SIGNAL : "none"}
            stroke={filled ? SIGNAL : emptyStroke}
            strokeWidth="1.5"
          >
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
        );
      })}
    </div>
  );
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/* Reviews section — public, no auth required                                */
/* -------------------------------------------------------------------------- */

function ReviewsSection({ productId }: { productId: string }) {
  const { colors } = useTheme();
  const toast = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] =
    useState<ReviewsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);

        /*
         * Reviews are public — no credentials/auth sent here.
         * Anyone visiting the product page, logged in or not,
         * should be able to see them.
         */
        const response = await fetch(
          `/api/products/${productId}/reviews?page=1&limit=5`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            "Failed to load reviews."
          );
        }

        if (!cancelled) {
          setReviews(data?.data ?? []);
          setPagination(data?.pagination ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load reviews:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load reviews."
          );
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load reviews."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function loadMore() {
    if (!pagination || pagination.page >= pagination.totalPages) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = pagination.page + 1;

      const response = await fetch(
        `/api/products/${productId}/reviews?page=${nextPage}&limit=5`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Failed to load more reviews."
        );
      }

      setReviews((previous) => [
        ...previous,
        ...(data?.data ?? []),
      ]);

      setPagination(data?.pagination ?? null);
    } catch (err) {
      console.error("Failed to load more reviews:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load more reviews."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div
      className="mt-16 max-w-3xl border-t pt-8"
      style={{ borderColor: colors.line }}
    >
      <div
        className="flex items-center justify-between"
        style={{ flexWrap: "wrap", gap: "0.5rem" }}
      >
        <h2
          className="font-display text-2xl uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          Reviews
        </h2>

        {pagination && pagination.total > 0 && (
          <span
            className="font-mono text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {pagination.total} total
          </span>
        )}
      </div>

      {loading ? (
        <div
          className="mt-5 border p-6 text-center font-mono text-xs"
          style={{
            borderColor: colors.line,
            color: colors.textMuted,
          }}
        >
          Loading reviews...
        </div>
      ) : error ? (
        <div
          className="mt-5 border p-4 font-mono text-xs"
          style={{
            borderColor: SIGNAL,
            color: SIGNAL,
          }}
        >
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="mt-5 border p-6 text-center"
          style={{ borderColor: colors.line }}
        >
          <p
            className="text-sm"
            style={{ color: colors.textMuted }}
          >
            No reviews yet. Be the first to review this product.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.rid}
                className="border p-4"
                style={{
                  borderColor: colors.line,
                  backgroundColor: colors.panel,
                }}
              >
                <div
                  className="flex items-center justify-between gap-3"
                  style={{ flexWrap: "wrap" }}
                >
                  <div
                    className="flex items-center gap-3"
                    style={{ flexWrap: "wrap", minWidth: 0 }}
                  >
                    <ReviewStars rating={review.rating} />

                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      {review.user?.uname ?? "Anonymous"}
                    </span>
                  </div>

                  <span
                    className="font-mono text-[10px]"
                    style={{ color: colors.textMuted }}
                  >
                    {formatReviewDate(review.createdAt)}
                  </span>
                </div>

                {review.comment && (
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: colors.textMuted }}
                  >
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {pagination &&
            pagination.page < pagination.totalPages && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-5 w-full border py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:opacity-80 disabled:opacity-50"
                style={{
                  borderColor: SIGNAL,
                  color: SIGNAL,
                }}
              >
                {loadingMore
                  ? "Loading..."
                  : "Load More Reviews"}
              </button>
            )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Upload slot                                                                */
/* -------------------------------------------------------------------------- */

function UploadSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const { colors } = useTheme();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;

    /* Validate before reading (added) */
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP…).");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("That image is too large. Please keep it under 5 MB.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result as string);
      toast.success(`${label} uploaded.`);
    };

    reader.onerror = () => {
      toast.error(`Couldn't read the ${label.toLowerCase()} file. Please try again.`);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p
        className="font-mono text-[11px] uppercase tracking-widest"
        style={{ color: colors.textMuted }}
      >
        {label}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div
          className="relative mt-2 aspect-square w-full overflow-hidden border"
          style={{
            borderColor: colors.lineStrong,
            backgroundColor: colors.panel,
          }}
        >
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClickCapture={() => toast.info(`${label} removed.`)}
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition hover:opacity-80"
            style={{
              backgroundColor: hexToRgba(colors.bg, 0.8),
              color: colors.text,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex aspect-square w-full flex-col items-center justify-center gap-2 border border-dashed transition hover:opacity-90"
          style={{
            borderColor: colors.lineStrong,
            backgroundColor: colors.panel,
            color: colors.textMuted,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>

          <span className="font-mono text-[10px] uppercase tracking-widest">
            Click to upload
          </span>
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Product Detail                                                             */
/* -------------------------------------------------------------------------- */

export default function ProductDetail({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const variants = product.variants ?? [];

  /* ------------------------------------------------------------------------ */
  /* Product image                                                            */
  /* ------------------------------------------------------------------------ */

  const images = product.ProductImage
    ? [product.ProductImage]
    : [];

  const [activeImage, setActiveImage] = useState(0);

  /* ------------------------------------------------------------------------ */
  /* Real colours from backend                                                */
  /* ------------------------------------------------------------------------ */

  const colours = useMemo(() => {
    return Array.from(
      new Set(
        variants
          .map((variant) => variant.colour?.trim())
          .filter(Boolean)
      )
    ) as string[];
  }, [variants]);

  /* ------------------------------------------------------------------------ */
  /* Selected colour                                                          */
  /* ------------------------------------------------------------------------ */

  const [colour, setColour] = useState("");

  const selectedColour = colour || colours[0] || "";

  /* ------------------------------------------------------------------------ */
  /* Sizes for selected colour                                                */
  /* ------------------------------------------------------------------------ */

  const availableSizes = useMemo(() => {
    if (!selectedColour) {
      return Array.from(
        new Set(
          variants
            .map((variant) => variant.size?.trim())
            .filter(Boolean)
        )
      ) as string[];
    }

    return Array.from(
      new Set(
        variants
          .filter(
            (variant) => variant.colour === selectedColour
          )
          .map((variant) => variant.size?.trim())
          .filter(Boolean)
      )
    ) as string[];
  }, [variants, selectedColour]);

  /* ------------------------------------------------------------------------ */
  /* Size allocation                                                          */
  /*                                                                          */
  /* Example:                                                                */
  /* 2 Pcs -> M:1 L:1                                                        */
  /* 5 Pcs -> M:2 L:2 XL:1                                                   */
  /* ------------------------------------------------------------------------ */

  const [sizeQuantities, setSizeQuantities] = useState<
    Record<string, number>
  >({});

  const selectedSizeTotal = useMemo(() => {
    return Object.values(sizeQuantities).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  }, [sizeQuantities]);

  /* ------------------------------------------------------------------------ */
  /* Quantity tier                                                            */
  /* ------------------------------------------------------------------------ */

  const [quantityTier, setQuantityTier] = useState(
    QUANTITY_TIERS[0]
  );

  /* ------------------------------------------------------------------------ */
  /* Uploads                                                                  */
  /* ------------------------------------------------------------------------ */

  const [frontImage, setFrontImage] =
    useState<string | null>(null);

  const [backImage, setBackImage] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Cart state                                                               */
  /* ------------------------------------------------------------------------ */

  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Find variant                                                             */
  /* ------------------------------------------------------------------------ */

  function findVariant(
    selectedColourValue: string,
    selectedSizeValue: string
  ) {
    return variants.find(
      (variant) =>
        variant.colour === selectedColourValue &&
        variant.size === selectedSizeValue
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Colour change                                                            */
  /* ------------------------------------------------------------------------ */

  function handleColourChange(newColour: string) {
    setColour(newColour);

    // Reset size allocation because the available variants changed.
    setSizeQuantities({});

    if (selectedSizeTotal > 0 && newColour !== selectedColour) {
      toast.info(`Colour changed to ${newColour}. Please pick your sizes again.`);
    }

    setCartError(null);
    setJustAdded(false);
  }

  /* ------------------------------------------------------------------------ */
  /* Change quantity for individual size                                      */
  /* ------------------------------------------------------------------------ */

  function changeSizeQuantity(
    size: string,
    delta: number
  ) {
    /*
     * Pre-checks (added) so that toasts are fired outside the
     * state updater (updaters must stay free of side effects).
     */
    if (delta > 0) {
      const currentQty = sizeQuantities[size] ?? 0;
      const nextQty = Math.max(0, currentQty + delta);
      const othersTotal = selectedSizeTotal - currentQty;

      if (othersTotal + nextQty > quantityTier) {
        toast.info(
          `You've already selected all ${quantityTier} pieces. Remove one to change sizes.`
        );
        return;
      }

      const checkVariant = findVariant(selectedColour, size);

      if (
        checkVariant?.stockQuantity !== undefined &&
        nextQty > checkVariant.stockQuantity
      ) {
        toast.error(
          `Only ${checkVariant.stockQuantity} in stock for size ${size}.`
        );
        return;
      }

      if (othersTotal + nextQty === quantityTier) {
        toast.success("Size allocation complete.");
      }
    }

    setSizeQuantities((previous) => {
      const current = previous[size] ?? 0;
      const next = Math.max(0, current + delta);

      const otherSizesTotal = Object.entries(previous)
        .filter(([existingSize]) => existingSize !== size)
        .reduce(
          (sum, [, quantity]) => sum + quantity,
          0
        );

      // Never allow allocation above the selected tier.
      if (otherSizesTotal + next > quantityTier) {
        return previous;
      }

      const variant = findVariant(
        selectedColour,
        size
      );

      // Never allow allocation above variant stock.
      if (
        variant?.stockQuantity !== undefined &&
        next > variant.stockQuantity
      ) {
        return previous;
      }

      return {
        ...previous,
        [size]: next,
      };
    });

    setCartError(null);
    setJustAdded(false);
  }

  /* ------------------------------------------------------------------------ */
  /* Change quantity tier                                                     */
  /* ------------------------------------------------------------------------ */

  function selectTier(tier: number) {
    setQuantityTier(tier);

    // Start fresh when changing total quantity.
    setSizeQuantities({});

    if (tier !== quantityTier) {
      toast.info(
        selectedSizeTotal > 0
          ? `Quantity set to ${tier} pcs. Your size selection was reset.`
          : `Quantity set to ${tier} pcs.`
      );
    }

    setCartError(null);
    setJustAdded(false);
  }

  /* ------------------------------------------------------------------------ */
  /* Allocated variants                                                       */
  /* ------------------------------------------------------------------------ */

  const allocatedVariants = useMemo(() => {
    return Object.entries(sizeQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([size, quantity]) => {
        const variant = findVariant(
          selectedColour,
          size
        );

        return {
          size,
          quantity,
          variant,
        };
      })
      .filter(
        (
          item
        ): item is {
          size: string;
          quantity: number;
          variant: ProductVariant;
        } => Boolean(item.variant)
      );
  }, [sizeQuantities, selectedColour, variants]);

  /* ------------------------------------------------------------------------ */
  /* Price                                                                    */
  /* ------------------------------------------------------------------------ */

  const lowestPrice = useMemo(() => {
    const prices = variants
      .filter(
        (variant) =>
          !selectedColour ||
          variant.colour === selectedColour
      )
      .map((variant) => Number(variant.price))
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return 0;
    }

    return Math.min(...prices);
  }, [variants, selectedColour]);

  const allocatedTotal = useMemo(() => {
    return allocatedVariants.reduce(
      (sum, item) =>
        sum +
        Number(item.variant.price) * item.quantity,
      0
    );
  }, [allocatedVariants]);

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  const imagesUploaded = Boolean(
    frontImage && backImage
  );

  const hasVariants = variants.length > 0;

  const hasValidAllocation =
    selectedSizeTotal === quantityTier &&
    selectedSizeTotal > 0 &&
    allocatedVariants.length > 0;

  const hasEnoughStock = allocatedVariants.every(
    (item) =>
      item.variant.stockQuantity === undefined ||
      item.quantity <= item.variant.stockQuantity
  );

  const canAdd =
    hasVariants &&
    Boolean(selectedColour) &&
    hasValidAllocation &&
    hasEnoughStock &&
    imagesUploaded;

  /* ------------------------------------------------------------------------ */
  /* Add to cart                                                              */
  /* ------------------------------------------------------------------------ */

  async function handleAddToCart() {
    /* Explain why the order can't be added yet (added) */
    if (!canAdd && !addingToCart) {
      if (!hasVariants) {
        toast.error("No variants are available for this product.");
      } else if (!selectedColour) {
        toast.error("Please select a colour.");
      } else if (!hasValidAllocation) {
        toast.error(`Select exactly ${quantityTier} pieces across the available sizes.`);
      } else if (!hasEnoughStock) {
        toast.error("Selected quantity exceeds available stock.");
      } else if (!imagesUploaded) {
        toast.error("Upload both a front and back design.");
      }
    }

    if (!canAdd || addingToCart) {
      return;
    }

    setAddingToCart(true);
    setCartError(null);
    setJustAdded(false);

    const addedItemIds: string[] = [];

    try {
      /*
       * Each size is a different ProductVariant.
       *
       * Example:
       *
       * M -> variantId A -> quantity 1
       * L -> variantId B -> quantity 1
       *
       * Therefore we make one POST per selected variant.
       */

      for (const item of allocatedVariants) {
        const response = await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variantId: item.variant.variantId,
            quantity: item.quantity,
          }),
        });

        const data = await response
          .json()
          .catch(() => null);

        /*
         * Not logged in.
         */
        if (response.status === 401) {
          toast.info("Please log in to add items to your cart.");

          sessionStorage.setItem(
            PENDING_CART_KEY,
            JSON.stringify(
              allocatedVariants.map((item) => ({
                variantId: item.variant.variantId,
                quantity: item.quantity,
              }))
            )
          );
          router.push(
            `/login?redirect=${encodeURIComponent(
              `/products/${product.ProductId}`
            )}`
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            "Failed to add product to cart."
          );
        }

        /*
         * Backend returns the created/updated cart item.
         * Save the ID so that we can rollback if a later
         * variant fails.
         */
        if (data?.itemId) {
          addedItemIds.push(data.itemId);
        }
      }

      setJustAdded(true);
      toast.success(
        `${selectedSizeTotal} piece${selectedSizeTotal > 1 ? "s" : ""} added to your cart.`
      );

      /*
       * Give CartContext a chance to refresh when the cart
       * page mounts.
       */
      router.push("/cart");
      router.refresh();
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );

      /*
       * If multiple sizes were being added and one request
       * failed, try to remove the items that were already
       * added in this operation.
       */
      for (const itemId of addedItemIds) {
        try {
          await fetch(
            `/api/cart/items/${itemId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
        } catch {
          // Ignore rollback failure.
        }
      }

      setCartError(
        error instanceof Error
          ? error.message
          : "Failed to add product to cart."
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"
      data-pd=""
    >
      {/* Responsive safety net (added) */}
      <style>{`
        [data-pd] { overflow-x: clip; }
        [data-pd] h1, [data-pd] h2, [data-pd] p { overflow-wrap: anywhere; }
        [data-pd] img { max-width: 100%; }
      `}</style>

      {/* Breadcrumb */}

      <div
        className="mb-8 flex items-center gap-2 font-mono text-[11px] tracking-widest"
        style={{
          color: colors.textMuted,
          opacity: 0.7,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/products"
          className="transition hover:opacity-100"
          style={{ color: SIGNAL }}
        >
          All Products
        </Link>

        <span>/</span>

        <span style={{ color: colors.textMuted }}>
          {product.ProductName}
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* ================================================================== */}
        {/* Gallery                                                            */}
        {/* ================================================================== */}

        <div className="lg:col-span-6">
          <div
            className="relative aspect-[4/5] overflow-hidden border"
            style={{
              borderColor: colors.line,
              backgroundColor: colors.panel,
            }}
          >
            {images.length > 0 ? (
              <DetailImg
                src={images[activeImage]}
                alt={product.ProductName}
                className="h-full w-full object-cover grayscale"
              />
            ) : (
              <DetailImg
                src=""
                alt={product.ProductName}
                className="h-full w-full"
              />
            )}
          </div>

          {images.length > 1 && (
            <div
              className="mt-3 flex gap-2"
              style={{ overflowX: "auto" }}
            >
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setActiveImage(index)
                  }
                  className="relative h-16 w-16 shrink-0 overflow-hidden border transition"
                  style={{
                    borderColor:
                      index === activeImage
                        ? SIGNAL
                        : colors.line,
                    opacity:
                      index === activeImage
                        ? 1
                        : 0.6,
                  }}
                >
                  <DetailImg
                    src={image}
                    alt=""
                    className="h-full w-full object-cover grayscale"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Design uploads */}

          <div
            className="mt-6 border p-4"
            style={{
              borderColor: colors.line,
              backgroundColor: colors.panel,
            }}
          >
            <p
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: SIGNAL }}
            >
              Upload your design — front &amp; back required
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <UploadSlot
                label="Front Design"
                value={frontImage}
                onChange={setFrontImage}
              />

              <UploadSlot
                label="Back Design"
                value={backImage}
                onChange={setBackImage}
              />
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* Product information                                                */}
        {/* ================================================================== */}

        <div className="lg:col-span-6">
          <h1
            className="font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl"
            style={{ color: colors.text }}
          >
            {product.ProductName}
          </h1>

          {/* Rating */}

          <div
            className="mt-4 flex items-center gap-3"
            style={{ flexWrap: "wrap" }}
          >
            <StarRating
              rating={Number(product.rating ?? 0)}
            />

            <span
              className="text-sm"
              style={{ color: colors.textMuted }}
            >
              {Number(product.rating ?? 0)} (
              {product.reviewCount ?? 0} Reviews)
            </span>
          </div>

          {/* Description */}

          {product.ProductDescription && (
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: colors.textMuted }}
            >
              {product.ProductDescription}
            </p>
          )}

          {/* Price */}

          <div
            className="mt-5 flex items-center gap-3 border-t pt-5"
            style={{ borderColor: colors.line }}
          >
            <span
              className="font-mono text-2xl"
              style={{ color: colors.text }}
            >
              {lowestPrice > 0
                ? fmt(lowestPrice)
                : "Price unavailable"}
            </span>
          </div>

          <p
            className="mt-1 font-mono text-[11px]"
            style={{
              color: colors.textMuted,
              opacity: 0.7,
            }}
          >
            Per piece · Inclusive of all taxes
          </p>

          {/* ================================================================== */}
          {/* Colour                                                             */}
          {/* ================================================================== */}

          {colours.length > 0 && (
            <div className="mt-6">
              <p
                className="font-mono text-[11px] uppercase tracking-widest"
                style={{ color: colors.textMuted }}
              >
                Colour:{" "}
                <span style={{ color: colors.text }}>
                  {selectedColour}
                </span>
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {colours.map((item) => {
                  const active =
                    selectedColour === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        handleColourChange(item)
                      }
                      className="border px-5 py-2.5 font-mono text-xs uppercase transition hover:opacity-90"
                      style={
                        active
                          ? {
                            borderColor: SIGNAL,
                            backgroundColor: SIGNAL,
                            color: "#131210",
                          }
                          : {
                            borderColor:
                              colors.lineStrong,
                            color:
                              colors.textMuted,
                          }
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* Size allocation                                                    */}
          {/* ================================================================== */}

          {availableSizes.length > 0 && (
            <div className="mt-6">
              <div
                className="flex items-center justify-between"
                style={{ flexWrap: "wrap", gap: "0.25rem" }}
              >
                <p
                  className="font-mono text-[11px] uppercase tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  Size Allocation
                </p>

                <span
                  className="font-mono text-[11px]"
                  style={{
                    color:
                      selectedSizeTotal ===
                        quantityTier
                        ? SIGNAL
                        : colors.textMuted,
                  }}
                >
                  Selected: {selectedSizeTotal}/
                  {quantityTier}
                </span>
              </div>

              <div className="mt-3 border">
                {availableSizes.map((item) => {
                  const variant = findVariant(
                    selectedColour,
                    item
                  );

                  const currentQuantity =
                    sizeQuantities[item] ?? 0;

                  const stock =
                    variant?.stockQuantity;

                  const outOfStock =
                    stock !== undefined && stock <= 0;

                  const maxReached =
                    selectedSizeTotal >=
                    quantityTier &&
                    currentQuantity === 0;

                  return (
                    <div
                      key={item}
                      className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                      style={{
                        borderColor: colors.line,
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <span
                          className="font-mono text-sm"
                          style={{ color: colors.text }}
                        >
                          {item}
                        </span>

                        {stock !== undefined && (
                          <span
                            className="ml-3 font-mono text-[10px]"
                            style={{
                              color:
                                stock > 0
                                  ? colors.textMuted
                                  : SIGNAL,
                            }}
                          >
                            {stock > 0
                              ? `${stock} available`
                              : "Out of stock"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Decrease ${item}`}
                          disabled={
                            currentQuantity <= 0
                          }
                          onClick={() =>
                            changeSizeQuantity(
                              item,
                              -1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center border transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                          style={{
                            borderColor:
                              colors.lineStrong,
                            color: colors.text,
                          }}
                        >
                          −
                        </button>

                        <span
                          className="w-6 text-center font-mono text-sm"
                          style={{
                            color: colors.text,
                          }}
                        >
                          {currentQuantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item}`}
                          disabled={
                            !variant ||
                            outOfStock ||
                            maxReached ||
                            (stock !== undefined &&
                              currentQuantity >=
                              stock)
                          }
                          onClick={() =>
                            changeSizeQuantity(
                              item,
                              1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center border transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                          style={{
                            borderColor:
                              colors.lineStrong,
                            color: colors.text,
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress */}

              <div className="mt-3">
                <div
                  className="h-1.5 w-full overflow-hidden"
                  style={{
                    backgroundColor: colors.line,
                  }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedSizeTotal /
                          quantityTier) *
                        100
                      )}%`,
                      backgroundColor: SIGNAL,
                    }}
                  />
                </div>

                <p
                  className="mt-2 font-mono text-[10px]"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  {selectedSizeTotal ===
                    quantityTier
                    ? "Size allocation complete."
                    : `Select ${quantityTier -
                    selectedSizeTotal
                    } more piece${quantityTier -
                      selectedSizeTotal >
                      1
                      ? "s"
                      : ""
                    }.`}
                </p>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* Quantity tier                                                     */}
          {/* ================================================================== */}

          <div className="mt-6">
            <p
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Quantity: {quantityTier} Pcs
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {QUANTITY_TIERS.map((tier) => {
                const active =
                  quantityTier === tier;

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => selectTier(tier)}
                    className="border px-4 py-2 font-mono text-xs transition"
                    style={
                      active
                        ? {
                          borderColor: SIGNAL,
                          backgroundColor: SIGNAL,
                          color: "#131210",
                        }
                        : {
                          borderColor:
                            colors.lineStrong,
                          color:
                            colors.textMuted,
                        }
                    }
                  >
                    {tier === 2
                      ? "2 Pcs Sample"
                      : `${tier} Pcs`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================================== */}
          {/* Selected order summary                                            */}
          {/* ================================================================== */}

          {selectedSizeTotal > 0 && (
            <div
              className="mt-5 border p-4"
              style={{
                borderColor: colors.line,
                backgroundColor: colors.panel,
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ flexWrap: "wrap", gap: "0.25rem" }}
              >
                <span
                  className="font-mono text-[11px] uppercase tracking-widest"
                  style={{ color: colors.textMuted }}
                >
                  Your selection
                </span>

                <span
                  className="font-mono text-sm"
                  style={{ color: SIGNAL }}
                >
                  {selectedSizeTotal} /{" "}
                  {quantityTier} Pcs
                </span>
              </div>

              <div className="mt-3 space-y-1">
                {allocatedVariants.map(
                  ({ size, quantity, variant }) => (
                    <div
                      key={variant.variantId}
                      className="flex items-center justify-between font-mono text-xs"
                      style={{ flexWrap: "wrap", gap: "0.25rem" }}
                    >
                      <span
                        style={{
                          color: colors.textMuted,
                        }}
                      >
                        {selectedColour} · {size} ×{" "}
                        {quantity}
                      </span>

                      <span
                        style={{
                          color: colors.text,
                        }}
                      >
                        {fmt(
                          Number(variant.price) *
                          quantity
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              {allocatedTotal > 0 && (
                <div
                  className="mt-3 flex items-center justify-between border-t pt-3 font-mono text-sm"
                  style={{
                    borderColor: colors.line,
                  }}
                >
                  <span
                    style={{
                      color: colors.textMuted,
                    }}
                  >
                    Total
                  </span>

                  <span style={{ color: SIGNAL }}>
                    {fmt(allocatedTotal)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* Cart error                                                         */}
          {/* ================================================================== */}

          {cartError && (
            <div
              className="mt-4 border p-3 font-mono text-xs"
              style={{
                borderColor: SIGNAL,
                color: SIGNAL,
              }}
            >
              {cartError}
            </div>
          )}

          {/* ================================================================== */}
          {/* Add to cart                                                        */}
          {/* ================================================================== */}

          <button
            type="button"
            disabled={!canAdd || addingToCart}
            onClick={handleAddToCart}
            className="mt-8 w-full py-4 text-center font-mono text-sm font-bold uppercase tracking-widest transition"
            style={
              canAdd && !addingToCart
                ? {
                  backgroundColor: SIGNAL,
                  color: "#131210",
                  cursor: "pointer",
                }
                : {
                  backgroundColor: colors.line,
                  color: colors.textMuted,
                  cursor: "not-allowed",
                }
            }
          >
            {addingToCart
              ? "Adding to Cart..."
              : justAdded
                ? "Added to cart ✓"
                : "Add to Cart"}
          </button>

          {!canAdd && (
            <p
              className="mt-2 text-center font-mono text-[10px]"
              style={{
                color: colors.textMuted,
                opacity: 0.7,
              }}
            >
              {!hasVariants &&
                "No variants are available for this product. "}

              {hasVariants &&
                !selectedColour &&
                "Please select a colour. "}

              {selectedSizeTotal !== quantityTier &&
                `Select exactly ${quantityTier} pieces across the available sizes. `}

              {!hasEnoughStock &&
                "Selected quantity exceeds available stock. "}

              {!imagesUploaded &&
                "Upload both a front and back design."}
            </p>
          )}

          <div
            className="mt-4 border p-4 text-sm"
            style={{
              borderColor: colors.line,
              backgroundColor: colors.panel,
              color: colors.textMuted,
            }}
          >
            We&apos;ll send a design proof for your approval
            after the order is placed.
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Description                                                          */}
      {/* ==================================================================== */}

      {product.ProductDescription && (
        <div
          className="mt-16 max-w-3xl border-t pt-8"
          style={{ borderColor: colors.line }}
        >
          <h2
            className="font-display text-2xl uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Description
          </h2>

          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {product.ProductDescription}
          </p>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Reviews — public, visible to every visitor                          */}
      {/* ==================================================================== */}

      <ReviewsSection productId={product.ProductId} />
    </div>
  );
}