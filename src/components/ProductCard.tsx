"use client";

import Link from "next/link";
import { useState } from "react";
import { ORANGE, usePalette } from "@/src/lib/palette";

type ProductVariant = {
  variantId?: string;
  colour?: string;
  size?: string;
  price: number;
  stockQuantity?: number;
};

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

function CardImg({ src, alt }: { src: string; alt: string }) {
  const colors = usePalette();
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
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
      onError={() => setFailed(true)}
      loading="lazy"
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

function StarRating({ rating }: { rating: number }) {
  const colors = usePalette();

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);

        return (
          <svg
            key={i}
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill={filled ? ORANGE : "none"}
            stroke={filled ? ORANGE : colors.lineStrong}
            strokeWidth="1.5"
          >
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
        );
      })}
    </div>
  );
}

function getFromPrice(product: Product) {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const prices = product.variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

function getColours(product: Product) {
  if (!product.variants) {
    return [];
  }

  const seen = new Set<string>();

  return product.variants
    .filter((variant) => variant.colour)
    .filter((variant) => {
      const colour = variant.colour as string;

      if (seen.has(colour)) {
        return false;
      }

      seen.add(colour);
      return true;
    })
    .map((variant) => ({ name: variant.colour as string }));
}

export default function ProductCard({ product }: { product: Product }) {
  const colors = usePalette();

  const fromPrice = getFromPrice(product);
  const colours = getColours(product);

  const visibleColours = colours.slice(0, 6);
  const extraCount = colours.length - visibleColours.length;

  return (
    <Link href={`/products/${product.productId}`} className="group block">
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ backgroundColor: colors.panel }}
      >
        <CardImg src={product.productImage ?? ""} alt={product.productName} />
      </div>

      <div className="mt-3">
        <h3
          className="line-clamp-2 text-sm font-semibold leading-snug"
          style={{ color: colors.text }}
        >
          {product.productName}
        </h3>

        <div className="mt-1.5 flex items-center gap-2">
          <StarRating rating={product.rating ?? 0} />

          <span className="text-[11px]" style={{ color: colors.textMuted }}>
            ({product.reviewCount ?? 0})
          </span>
        </div>

        <div className="mt-1 text-sm font-semibold" style={{ color: ORANGE }}>
          {fromPrice !== null
            ? `From ₹${fromPrice.toLocaleString("en-IN")}`
            : "Price unavailable"}
        </div>

        {visibleColours.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {visibleColours.map((colour) => (
              <span
                key={colour.name}
                title={colour.name}
                className="flex h-5 items-center rounded-full border px-2 text-[10px] uppercase tracking-wider"
                style={{
                  borderColor: colors.lineStrong,
                  color: colors.textMuted,
                }}
              >
                {colour.name}
              </span>
            ))}

            {extraCount > 0 && (
              <span className="text-[10px]" style={{ color: colors.textMuted }}>
                +{extraCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}