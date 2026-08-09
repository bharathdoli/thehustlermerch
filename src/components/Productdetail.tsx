"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  findVariant,
  getCategoryById,
  getProductColours,
  getProductSizes,
  getRatingBreakdown,
  type Product,
  type Review,
} from "@/src/lib/productdata";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { SIGNAL, hexToRgba, useTheme } from "@/src/context/ThemeContext";

const QUANTITY_TIERS = [2, 5, 10, 15, 20, 50, 75, 100];
const PENDING_CART_KEY = "hustler-pending-cart-item";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function DetailImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className ?? ""} flex items-center justify-center`} style={{ backgroundColor: colors.panel }}>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: colors.textMuted }}>IMAGE UNAVAILABLE</span>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}

function StarRating({ rating }: { rating: number }) {
  const { theme } = useTheme();
  const emptyStroke = theme === "dark" ? "#5a5648" : "#c9c1af";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill={filled ? SIGNAL : "none"} stroke={filled ? SIGNAL : emptyStroke} strokeWidth="1.5">
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
        );
      })}
    </div>
  );
}

/** A single upload slot — click to browse, shows a preview + remove button once a file is chosen. */
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
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative mt-2 aspect-square w-full overflow-hidden border" style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel }}>
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition hover:opacity-80"
            style={{ backgroundColor: hexToRgba(colors.bg, 0.8), color: colors.text }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex aspect-square w-full flex-col items-center justify-center gap-2 border border-dashed transition hover:opacity-90"
          style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.textMuted }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-widest">Click to upload</span>
        </button>
      )}
    </div>
  );
}

function RatingBar({ star, percent, count }: { star: number; percent: number; count: number }) {
  const { colors } = useTheme();
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 font-mono text-[11px]" style={{ color: colors.textMuted }}>{star} star</span>
      <div className="h-2 flex-1 overflow-hidden" style={{ backgroundColor: colors.line }}>
        <div className="h-full" style={{ width: `${percent}%`, backgroundColor: SIGNAL }} />
      </div>
      <span className="w-10 text-right font-mono text-[11px]" style={{ color: colors.textMuted }}>{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { colors } = useTheme();
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [marked, setMarked] = useState(false);

  return (
    <div className="border-b py-6 last:border-b-0" style={{ borderColor: colors.line }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} />
          {review.verifiedPurchase && (
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: SIGNAL }}>
              Verified Purchase
            </span>
          )}
        </div>
        <span className="whitespace-nowrap font-mono text-[11px]" style={{ color: colors.textMuted, opacity: 0.7 }}>
          {review.date}
        </span>
      </div>

      <h3 className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>{review.title}</h3>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: colors.textMuted }}>{review.body}</p>

      <div className="mt-2 font-mono text-[11px]" style={{ color: colors.textMuted, opacity: 0.8 }}>
        {review.authorName}
        {review.size ? ` · Size ${review.size}` : ""}
        {review.colour ? ` · ${review.colour}` : ""}
      </div>

      <button
        type="button"
        onClick={() => {
          if (marked) return;
          setHelpful((h) => h + 1);
          setMarked(true);
        }}
        className="mt-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest transition hover:opacity-80"
        style={{ color: marked ? SIGNAL : colors.textMuted }}
      >
        👍 Helpful ({helpful})
      </button>
    </div>
  );
}

function ReviewsSection({ product }: { product: Product }) {
  const { colors } = useTheme();
  const [visibleCount, setVisibleCount] = useState(4);
  const breakdown = getRatingBreakdown(product);
  const reviews = product.reviews;

  return (
    <div className="mt-16 max-w-5xl border-t pt-8" style={{ borderColor: colors.line }}>
      <h2 className="font-display text-2xl uppercase tracking-tight" style={{ color: colors.text }}>
        Customer Reviews
      </h2>

      <div className="mt-6 grid gap-10 sm:grid-cols-12">
        {/* Summary */}
        <div className="sm:col-span-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl" style={{ color: colors.text }}>{product.rating}</span>
            <span className="font-mono text-sm" style={{ color: colors.textMuted }}>/ 5</span>
          </div>
          <div className="mt-1">
            <StarRating rating={product.rating} />
          </div>
          <p className="mt-1 font-mono text-[11px]" style={{ color: colors.textMuted, opacity: 0.7 }}>
            {product.reviewCount.toLocaleString("en-IN")} global ratings
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {breakdown.map((b) => (
              <RatingBar key={b.star} star={b.star} percent={b.percent} count={b.count} />
            ))}
          </div>
        </div>

        {/* Written reviews */}
        <div className="sm:col-span-8">
          {reviews.length === 0 ? (
            <p className="text-sm" style={{ color: colors.textMuted }}>No written reviews yet.</p>
          ) : (
            <>
              <div>
                {reviews.slice(0, visibleCount).map((r) => (
                  <ReviewCard key={r.reviewId} review={r} />
                ))}
              </div>
              {visibleCount < reviews.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + 4)}
                  className="mt-2 font-mono text-xs uppercase tracking-widest transition hover:opacity-80"
                  style={{ color: SIGNAL }}
                >
                  Show more reviews
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  const colours = getProductColours(product);
  const sizes = getProductSizes(product);
  const hasSizeChoice = sizes.length > 1;

  const [activeImage, setActiveImage] = useState(0);
  const [colour, setColour] = useState(colours[0]?.name ?? "");
  const [quantityTier, setQuantityTier] = useState(QUANTITY_TIERS[0]);
  const [sizeQty, setSizeQty] = useState<Record<string, number>>({});
  const [customText, setCustomText] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const selectedTotal = useMemo(() => Object.values(sizeQty).reduce((a, b) => a + b, 0), [sizeQty]);

  const activeVariant = useMemo(() => {
    const size = sizes[0];
    return findVariant(product, colour, size);
  }, [product, colour, sizes]);

  const unitPrice = activeVariant?.price ?? 0;
  const savePct = product.compareAtPrice ? Math.round(((product.compareAtPrice - unitPrice) / product.compareAtPrice) * 100) : 0;

  const category = getCategoryById(product.categoryId);

  function changeQty(size: string, delta: number) {
    setSizeQty((prev) => {
      const current = prev[size] ?? 0;
      const next = Math.max(0, current + delta);
      const others = selectedTotal - current;
      if (others + next > quantityTier) return prev; // can't exceed the chosen tier
      return { ...prev, [size]: next };
    });
  }

  function selectTier(tier: number) {
    setQuantityTier(tier);
    setSizeQty({});
  }

  const sizesAllocated = hasSizeChoice ? selectedTotal === quantityTier && selectedTotal > 0 : true;
  const imagesUploaded = Boolean(frontImage && backImage);
  const canAdd = sizesAllocated && imagesUploaded;

  function handleAddToCart() {
    if (!canAdd) return;

    const breakdown = hasSizeChoice ? sizeQty : { [sizes[0] ?? "One Size"]: quantityTier };

    const cartItem = {
      productId: product.productId,
      productName: product.productName,
      image: product.productImage ?? product.images[0],
      frontImage,
      backImage,
      colour,
      sizeBreakdown: breakdown,
      totalQuantity: hasSizeChoice ? selectedTotal : quantityTier,
      unitPrice,
      customText,
    };

    if (!isAuthenticated) {
      // Save the selections so login can finish the add-to-cart automatically.
      try {
        sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(cartItem));
      } catch {
        // ignore
      }
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product.productId}`)}`);
      return;
    }

    addToCart(cartItem);
    setJustAdded(true);
    router.push("/cart");
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 font-mono text-[11px] tracking-widest" style={{ color: colors.textMuted, opacity: 0.7 }}>
        <Link href="/products" className="transition hover:opacity-100" style={{ color: SIGNAL }}>All Products</Link>
        <span>/</span>
        {category && <span style={{ color: colors.textMuted }}>{category.name}</span>}
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden border" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
            <DetailImg src={product.images[activeImage]} alt={product.productName} className="h-full w-full object-cover grayscale" />
            {product.images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={() => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border transition hover:opacity-90"
                  style={{ borderColor: colors.lineStrong, backgroundColor: hexToRgba(colors.bg, 0.7), color: colors.text }}
                >
                  ←
                </button>
                <button
                  aria-label="Next image"
                  onClick={() => setActiveImage((i) => (i + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border transition hover:opacity-90"
                  style={{ borderColor: colors.lineStrong, backgroundColor: hexToRgba(colors.bg, 0.7), color: colors.text }}
                >
                  →
                </button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className="relative h-16 w-16 shrink-0 overflow-hidden border transition"
                  style={{
                    borderColor: i === activeImage ? SIGNAL : colors.line,
                    opacity: i === activeImage ? 1 : 0.6,
                  }}
                >
                  <DetailImg src={img} alt="" className="h-full w-full object-cover grayscale" />
                </button>
              ))}
            </div>
          )}

          {/* Design uploads */}
          <div className="mt-6 border p-4" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: SIGNAL }}>
              Upload your design — front &amp; back required
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <UploadSlot label="Front Design" value={frontImage} onChange={setFrontImage} />
              <UploadSlot label="Back Design" value={backImage} onChange={setBackImage} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-6">
          {category && <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>{category.name}</span>}
          <h1 className="mt-2 font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl" style={{ color: colors.text }}>
            {product.productName}
          </h1>

          {/* Highlights */}
          {product.highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.highlights.map((h) => (
                <span key={h} className="border px-3 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: hexToRgba(SIGNAL, 0.4), color: SIGNAL }}>
                  ✓ {h}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="mt-4 flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm" style={{ color: colors.textMuted }}>{product.rating} ({product.reviewCount} Reviews)</span>
          </div>
          <p className="mt-1 font-mono text-[11px]" style={{ color: colors.textMuted, opacity: 0.7 }}>{product.reviewCount * 4}+ Orders Delivered</p>

          {/* Price */}
          <div className="mt-5 flex items-center gap-3 border-t pt-5" style={{ borderColor: colors.line }}>
            {product.compareAtPrice && <span className="font-mono text-lg line-through" style={{ color: colors.textMuted, opacity: 0.6 }}>{fmt(product.compareAtPrice)}</span>}
            <span className="font-mono text-2xl" style={{ color: colors.text }}>{fmt(unitPrice)}</span>
            {savePct > 0 && (
              <span className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
                Save {savePct}%
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px]" style={{ color: colors.textMuted, opacity: 0.7 }}>Per piece · Inclusive of all taxes</p>

          {/* Custom text */}
          <div className="mt-6">
            <label className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Any text or customisation needed (optional)
            </label>
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Write here"
              className="mt-2 w-full border px-4 py-3 text-sm focus:outline-none"
              style={{ borderColor: colors.lineStrong, backgroundColor: colors.panel, color: colors.text }}
            />
          </div>

          {/* Quantity tiers */}
          <div className="mt-6">
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Quantity: {quantityTier} Pcs
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUANTITY_TIERS.map((tier) => {
                const active = quantityTier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => selectTier(tier)}
                    className="border px-4 py-2 font-mono text-xs transition"
                    style={
                      active
                        ? { borderColor: SIGNAL, backgroundColor: SIGNAL, color: "#131210" }
                        : { borderColor: colors.lineStrong, color: colors.textMuted }
                    }
                  >
                    {tier === 2 ? "2 Pcs Sample" : `${tier} Pcs`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size allocation */}
          {hasSizeChoice && (
            <>
              <div className="mt-4 border p-4" style={{ borderColor: hexToRgba(SIGNAL, 0.3), backgroundColor: hexToRgba(SIGNAL, 0.05) }}>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span style={{ color: SIGNAL }}>Select {quantityTier} piece{quantityTier > 1 ? "s" : ""}.</span>
                  <span style={{ color: colors.text }}>Selected: {selectedTotal}/{quantityTier}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden" style={{ backgroundColor: colors.line }}>
                  <div
                    className="h-full transition-all"
                    style={{ width: `${Math.min(100, (selectedTotal / quantityTier) * 100)}%`, backgroundColor: SIGNAL }}
                  />
                </div>
              </div>

              <div className="mt-3 divide-y border" style={{ borderColor: colors.line }}>
                {sizes.map((size) => (
                  <div key={size} className="flex items-center justify-between px-4 py-3" style={{ borderColor: colors.line }}>
                    <span className="font-mono text-sm" style={{ color: colors.text }}>{size}</span>
                    <div className="flex items-center gap-3">
                      <button
                        aria-label={`Decrease ${size}`}
                        onClick={() => changeQty(size, -1)}
                        className="flex h-8 w-8 items-center justify-center border transition hover:opacity-80"
                        style={{ borderColor: colors.lineStrong, color: colors.text }}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-mono text-sm" style={{ color: colors.text }}>{sizeQty[size] ?? 0}</span>
                      <button
                        aria-label={`Increase ${size}`}
                        onClick={() => changeQty(size, 1)}
                        className="flex h-8 w-8 items-center justify-center border transition hover:opacity-80"
                        style={{ borderColor: colors.lineStrong, color: colors.text }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Colour grid */}
          {colours.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Colour: {colour}</p>
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {colours.map((c) => (
                  <button key={c.name} onClick={() => setColour(c.name)} className="group flex flex-col items-center gap-1.5">
                    <span
                      className="h-14 w-14 rounded-full border-2 transition"
                      style={{ backgroundColor: c.hex, borderColor: colour === c.name ? SIGNAL : colors.lineStrong }}
                    />
                    <span className="font-mono text-[10px]" style={{ color: colors.textMuted }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!canAdd}
            onClick={handleAddToCart}
            className="mt-8 w-full py-4 text-center font-mono text-sm font-bold uppercase tracking-widest transition"
            style={
              canAdd
                ? { backgroundColor: SIGNAL, color: "#131210", cursor: "pointer" }
                : { backgroundColor: colors.line, color: colors.textMuted, cursor: "not-allowed" }
            }
          >
            {justAdded ? "Added to cart ✓" : "Add to Cart"}
          </button>
          {!canAdd && (
            <p className="mt-2 text-center font-mono text-[10px]" style={{ color: colors.textMuted, opacity: 0.7 }}>
              {!imagesUploaded && "Upload both a front and back design. "}
              {!sizesAllocated && `Allocate all ${quantityTier} pieces across sizes.`}
            </p>
          )}

          <div className="mt-4 border p-4 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.panel, color: colors.textMuted }}>
            We&apos;ll send a design proof for your approval after the order is placed.
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-16 max-w-3xl border-t pt-8" style={{ borderColor: colors.line }}>
          <h2 className="font-display text-2xl uppercase tracking-tight" style={{ color: colors.text }}>Description</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.textMuted }}>{product.description}</p>
        </div>
      )}

      {/* Reviews */}
      <ReviewsSection product={product} />
    </div>
  );
}