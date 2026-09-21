"use client";

/**
 * TheHustlerMerchandise — Home Page (v5 — live categories + live products)
 * -----------------------------------------------------------------------
 * Theme (dark/light + SIGNAL orange) lives in
 * `src/context/ThemeContext.tsx` and is shared with every other page.
 *
 * Categories:
 *   GET /api/categories
 *
 * Products:
 *   GET /api/products
 *
 * Everything else remains unchanged.
 * -----------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";
import { SIGNAL, hexToRgba, useTheme } from "@/src/context/ThemeContext";

/* -------------------------------------------------------------------- */
/*  Data types                                                          */
/* -------------------------------------------------------------------- */

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

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  product: string;
  location: string;
  verified: boolean;
  avatarSeed: string;
};

type InstagramPost = {
  id: string;
  image: string;
  caption: string;
  likes: string;
};

/* Live category shape — matches list-categories.usecase.ts */
type CategoryDTO = {
  categoryId: string;
  categoryName: string;
  description?: string | null;
  imageUrl?: string | null;
};

/* -------------------------------------------------------------------- */
/*  Reviews — unchanged                                                 */
/* -------------------------------------------------------------------- */

const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Aarav Mehta",
    rating: 5,
    text: "Heavier than anything from the mall brands. The hoodie held up through an entire winter of daily wear and still looks new.",
    product: "Graveyard Shift Hoodie",
    location: "Mumbai, MH",
    verified: true,
    avatarSeed: "aarav",
  },
  {
    id: "r2",
    author: "Simran Kaur",
    rating: 5,
    text: "Ordered custom prints for our whole team of 14. Proof came in a day, print matched it exactly, delivered in under a week.",
    product: "Custom Merch",
    location: "Chandigarh, PB",
    verified: true,
    avatarSeed: "simran",
  },
  {
    id: "r3",
    author: "Rohan Iyer",
    rating: 4,
    text: "Great fabric, sizing runs slightly large — go one size down. Otherwise exactly as pictured.",
    product: "No Days Off Tee",
    location: "Bengaluru, KA",
    verified: true,
    avatarSeed: "rohan",
  },
  {
    id: "r4",
    author: "Neha Kulkarni",
    rating: 5,
    text: "The cap is genuinely well built — stiff brim, no loose threads. Feels like it costs twice as much.",
    product: "Site Foreman Cap",
    location: "Pune, MH",
    verified: true,
    avatarSeed: "neha",
  },
  {
    id: "r5",
    author: "Karthik Reddy",
    rating: 5,
    text: "Small batch really shows. Stitching is clean and the print hasn't cracked after a dozen washes.",
    product: "Overtime Crewneck",
    location: "Hyderabad, TS",
    verified: true,
    avatarSeed: "karthik",
  },
  {
    id: "r6",
    author: "Ishita Bose",
    rating: 4,
    text: "Shipping took a day longer than quoted, but support kept me updated the whole way. Product's worth the wait.",
    product: "Ledger Zip Hoodie",
    location: "Kolkata, WB",
    verified: true,
    avatarSeed: "ishita",
  },
];


/* -------------------------------------------------------------------- */
/*  Small shared bits                                                    */
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

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
}) {
  const { colors } = useTheme();

  return (
    <div className="mb-8 flex items-end justify-between gap-4 border-b pb-5" style={{ borderColor: colors.line }}>
      <div>
        <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>
          {eyebrow}
        </span>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl" style={{ color: colors.text }}>
          {title}
        </h2>
      </div>
      {action && (
        <a href={action.href} className="hidden shrink-0 font-mono text-xs uppercase tracking-widest transition hover:opacity-100 sm:block" style={{ color: colors.textMuted }}>
          {action.label} →
        </a>
      )}
    </div>
  );
}

function StarRating({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
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
            width={size}
            height={size}
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

function StampTag({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <span
      className="absolute left-3 top-3 z-10 -rotate-3 border px-2 py-1 font-mono text-[10px] font-bold tracking-widest"
      style={{
        borderColor: colors.text,
        color: colors.text,
      }}
    >
      {children}
    </span>
  );
}

/** Diagonal hazard-stripe rule — unchanged */
function HazardRule({
  className = "",
}: {
  className?: string;
}) {
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

function Ticker() {
  const { colors } = useTheme();

  const items = [
    "NO DAYS OFF",
    "SELF MADE",
    "GRIND MODE: ON",
    "BUILT NOT GIVEN",
    "EAT THE COMPETITION",
    "24 / 7 MINDSET",
  ];

  const loop = [...items, ...items];

  return (
    <div>
      <HazardRule />

      <div
        className="relative overflow-hidden py-3"
        style={{ backgroundColor: colors.panel }}
      >
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap">
          {loop.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-mono text-xs tracking-[0.25em]"
              style={{ color: colors.textMuted }}
            >
              {item}
              <span style={{ color: SIGNAL }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      <HazardRule />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Hero — unchanged                                                     */
/* -------------------------------------------------------------------- */

function Hero() {
  const { colors } = useTheme();

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
      <div className="grid gap-10 md:grid-cols-2 md:items-center lg:grid-cols-12 lg:items-end">
        <div className="animate-[fade-up_0.7s_ease-out_both] lg:col-span-7">
          <span
            className="inline-flex items-center gap-2 border px-3 py-1 font-mono text-[11px] tracking-widest"
            style={{ borderColor: SIGNAL, color: SIGNAL }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: SIGNAL }}
            />
            DROP 004 · LIVE NOW
          </span>

          <h1
            className="mt-6 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-6xl sm:leading-[0.85] md:text-7xl lg:text-8xl xl:text-9xl"
            style={{ color: colors.text }}
          >
            Wear the
            <br />
            Grind<span style={{ color: SIGNAL }}>.</span>
          </h1>

          <p
            className="mt-6 max-w-md text-base"
            style={{ color: colors.textMuted }}
          >
            Streetwear for people who clock out and keep working. Heavyweight cotton, graphics
            earned the hard way, and custom merch for the teams building alongside you.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#products"
              className="px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
              style={{
                backgroundColor: SIGNAL,
                color: "#131210",
              }}
            >
              Shop the drop
            </a>

            <a
              href="#custom"
              className="border px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition"
              style={{
                borderColor: colors.lineStrong,
                color: colors.text,
              }}
            >
              Start customizing
            </a>
          </div>
        </div>

        <div className="relative animate-[fade-up_0.9s_ease-out_0.15s_both] lg:col-span-5">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden border"
            style={{ borderColor: colors.line }}
          >
            <Img
              src="https://picsum.photos/seed/hustler-hero/900/1100"
              alt="TheHustlerMerchandise latest drop"
              className="h-full w-full object-cover grayscale"
            />

            <div
              className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              style={{
                backgroundImage: `linear-gradient(to top, ${colors.bg}, transparent)`,
              }}
            />
          </div>

          <div
            className="absolute -bottom-4 -left-3 w-36 -rotate-3 border p-2.5 font-mono shadow-xl sm:-bottom-6 sm:-left-10 sm:w-56 sm:p-3"
            style={{
              borderColor: "#131210",
              backgroundColor: "#f3ede1",
            }}
          >
            <p className="text-[8px] tracking-widest text-[#131210]/50 sm:text-[9px]">
              WORK ORDER NO. 0004
            </p>

            <p className="mt-1 text-base font-bold leading-none text-[#131210] sm:text-lg">
              35% OFF
            </p>

            <p className="mt-1 text-[8px] tracking-widest text-[#131210]/50 sm:text-[9px]">
              AUTHORIZED · LIMITED RUN
            </p>
          </div>

          <div
            className="absolute -right-2 top-4 rotate-2 border px-2.5 py-1.5 font-mono text-[9px] tracking-widest backdrop-blur sm:-right-3 sm:top-6 sm:px-3 sm:py-2 sm:text-[10px]"
            style={{
              borderColor: colors.lineStrong,
              backgroundColor: hexToRgba(colors.bg, 0.8),
              color: colors.text,
            }}
          >
            25,000+ HUSTLERS
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Featured Categories — FIXED to match real /api/categories shape     */
/* -------------------------------------------------------------------- */

function FeaturedCategories() {
  const { colors } = useTheme();
  const [categories, setCategories] =
    useState<CategoryDTO[]>([]);

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setStatus("loading");

      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(
            `Request failed with ${res.status}`
          );
        }

        const raw = await res.json();
        const data: CategoryDTO[] = Array.isArray(raw)
          ? raw
          : raw.data ?? [];

        if (!cancelled) {
          setCategories(data.slice(0, 4));
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  if (
    status === "error" ||
    (status === "success" &&
      categories.length === 0)
  ) {
    return null;
  }

  return (
    <section
      id="categories"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8"
    >
      <SectionHeading
        eyebrow="Collections"
        title="Shop by category"
        action={{
          label: "View all",
          href: "/categories",
        }}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {status === "loading"
          ? Array.from({ length: 4 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse border"
                  style={{
                    borderColor: colors.line,
                    backgroundColor: colors.panel,
                  }}
                />
              )
            )
          : categories.map((cat, index) => {
              const fallbackImage = `https://picsum.photos/seed/hustler-cat-${cat.categoryId || index}/600/800`;

              return (
                <a
                  key={cat.categoryId || `category-${index}`}
                  href={`/categories#${cat.categoryId}`}
                  className="group relative block aspect-[3/4] overflow-hidden border"
                  style={{
                    borderColor: colors.line,
                    backgroundColor: colors.panel,
                  }}
                >
                  <Img
                    src={
                      cat.imageUrl ||
                      fallbackImage
                    }
                    alt={cat.categoryName}
                    className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `linear-gradient(to top, ${colors.bg}, ${hexToRgba(colors.bg, 0.1)}, transparent)`,
                    }}
                  />

                  <div className="absolute bottom-0 left-0 p-4">
                    <p
                      className="font-display text-xl uppercase tracking-tight"
                      style={{ color: colors.text }}
                    >
                      {cat.categoryName}
                    </p>

                    {cat.description && (
                      <p
                        className="mt-1 max-w-[85%] font-mono text-[10px] leading-relaxed"
                        style={{
                          color: colors.textMuted,
                        }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>
                </a>
              );
            })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Product card — UPDATED TO USE BACKEND PRODUCT                       */
/* -------------------------------------------------------------------- */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { colors } = useTheme();

  const price =
    product.variants &&
    product.variants.length > 0
      ? Math.min(
          ...product.variants.map(
            (variant) => Number(variant.price)
          )
        )
      : null;

  return (
    <div className="group">
      <div
        className="relative aspect-[4/5] overflow-hidden border"
        style={{
          borderColor: colors.line,
          backgroundColor: colors.panel,
        }}
      >
        <Img
          src={product.productImage || ""}
          alt={product.productName}
          className="h-full w-full object-cover grayscale transition duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
        />

        <a
          href={`/products/${product.productId}`}
          className="absolute inset-x-3 bottom-3 translate-y-3 py-2 text-center font-mono text-xs font-bold uppercase tracking-widest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          style={{
            backgroundColor: colors.text,
            color: colors.bg,
          }}
        >
          View Product
        </a>
      </div>

      <div className="mt-3">
        <h3
          className="text-sm font-medium leading-snug"
          style={{ color: colors.text }}
        >
          {product.productName}
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <StarRating
            rating={product.rating ?? 0}
          />

          <span
            className="font-mono text-[10px]"
            style={{ color: colors.textMuted }}
          >
            ({product.reviewCount ?? 0})
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2 font-mono text-sm">
          <span style={{ color: SIGNAL }}>
            {price !== null
              ? `₹${price.toLocaleString("en-IN")}`
              : "Price unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Featured Products — UPDATED                                        */
/* -------------------------------------------------------------------- */

function FeaturedProducts({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  return (
    <section
      id="products"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8"
    >
      <SectionHeading
        eyebrow="Drop 004"
        title="Featured products"
        action={{
          label: "Shop all",
          href: "/products",
        }}
      />

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse border"
                />
              )
            )
          : products
              .slice(0, 4)
              .map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                />
              ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Custom Merchandise — UNCHANGED                                     */
/* -------------------------------------------------------------------- */

function CustomMerch() {
  const { colors } = useTheme();

  const steps = [
    {
      n: "01",
      title: "Upload your design",
      desc: "Logo, artwork, or just an idea — send us what you've got.",
    },
    {
      n: "02",
      title: "Approve the mockup",
      desc: "We send a proof before anything goes to print. No surprises.",
    },
    {
      n: "03",
      title: "We print & ship",
      desc: "Small-batch production, PAN India delivery in 5–7 days.",
    },
  ];

  return (
    <section
      id="custom"
      className="py-16 sm:py-20"
      style={{ backgroundColor: colors.panel }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-2 md:items-center md:gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div
            className="relative aspect-[4/5] overflow-hidden border"
            style={{ borderColor: colors.line }}
          >
            <Img
              src="https://picsum.photos/seed/hustler-custom/900/1100"
              alt="Custom printed merchandise"
              className="h-full w-full object-cover grayscale"
            />

            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to top, ${hexToRgba(
                  colors.bg,
                  0.8
                )}, transparent)`,
              }}
            />

            <div
              className="absolute bottom-5 left-5 border px-4 py-2 font-mono text-xs font-bold tracking-widest"
              style={{
                borderColor: "#131210",
                backgroundColor: SIGNAL,
                color: "#131210",
              }}
            >
              MOQ: JUST 2 PIECES
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <span
            className="font-mono text-[11px] tracking-[0.25em]"
            style={{ color: SIGNAL }}
          >
            Print on demand
          </span>

          <h2
            className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
            style={{ color: colors.text }}
          >
            Your logo.
            <br />
            Your crew.
            <br />
            Our print.
          </h2>

          <p
            className="mt-5 max-w-lg"
            style={{ color: colors.textMuted }}
          >
            Building a team, a brand, or a side hustle? Get your logo or artwork printed on
            hoodies, tees, and caps with the same heavyweight materials as our main drops — no
            minimum order stress, no compromise on quality.
          </p>

          <div className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="flex gap-4 border-t pt-4 first:border-t-0 first:pt-0"
                style={{
                  borderColor:
                    i === 0
                      ? "transparent"
                      : colors.line,
                }}
              >
                <span
                  className="font-display text-2xl"
                  style={{ color: SIGNAL }}
                >
                  {s.n}
                </span>

                <div>
                  <p
                    className="font-medium"
                    style={{ color: colors.text }}
                  >
                    {s.title}
                  </p>

                  <p
                    className="text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="mt-8 inline-block px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
            style={{
              backgroundColor: SIGNAL,
              color: "#131210",
            }}
          >
            Start customizing
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Best Products — UPDATED TO USE BACKEND                             */
/* -------------------------------------------------------------------- */

function BestProducts({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const { colors } = useTheme();

  const scrollerRef =
    useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({
      left: dir * 320,
      behavior: "smooth",
    });
  };

  const sorted = [...products].sort(
    (a, b) =>
      (b.rating ?? 0) *
        (b.reviewCount ?? 0) -
      (a.rating ?? 0) *
        (a.reviewCount ?? 0)
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div
        className="mb-8 flex items-end justify-between gap-4 border-b pb-5"
        style={{ borderColor: colors.line }}
      >
        <div>
          <span
            className="font-mono text-[11px] tracking-[0.25em]"
            style={{ color: SIGNAL }}
          >
            Top rated
          </span>

          <h2
            className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl"
            style={{ color: colors.text }}
          >
            Best products
          </h2>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="h-9 w-9 border transition"
            style={{
              borderColor: colors.lineStrong,
              color: colors.textMuted,
            }}
          >
            ←
          </button>

          <button
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="h-9 w-9 border transition"
            style={{
              borderColor: colors.lineStrong,
              color: colors.textMuted,
            }}
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 4 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="relative w-[210px] shrink-0 snap-start sm:w-[240px]"
                >
                  <div
                    className="aspect-[3/4] animate-pulse border"
                    style={{
                      borderColor: colors.line,
                      backgroundColor: colors.panel,
                    }}
                  />
                </div>
              )
            )
          : sorted.map((product) => {
              const price =
                product.variants &&
                product.variants.length > 0
                  ? Math.min(
                      ...product.variants.map(
                        (variant) =>
                          Number(variant.price)
                      )
                    )
                  : null;

              return (
                <a
                  key={product.productId}
                  href={`/products/${product.productId}`}
                  className="relative w-[210px] shrink-0 snap-start sm:w-[240px]"
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden border"
                    style={{
                      borderColor: colors.line,
                      backgroundColor: colors.panel,
                    }}
                  >
                    <Img
                      src={
                        product.productImage ||
                        ""
                      }
                      alt={product.productName}
                      className="h-full w-full object-cover grayscale transition duration-500 hover:scale-105 hover:grayscale-0"
                    />
                  </div>

                  <p
                    className="mt-2 truncate text-xs"
                    style={{
                      color: colors.text,
                      opacity: 0.85,
                    }}
                  >
                    {product.productName}
                  </p>

                  <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                    <span style={{ color: SIGNAL }}>
                      {price !== null
                        ? `₹${price.toLocaleString(
                            "en-IN"
                          )}`
                        : "Price unavailable"}
                    </span>
                  </div>

                  <div className="mt-1">
                    <StarRating
                      rating={
                        product.rating ?? 0
                      }
                      size={12}
                    />
                  </div>
                </a>
              );
            })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Brand Story — unchanged                                             */
/* -------------------------------------------------------------------- */

function BrandStory() {
  const { colors } = useTheme();

  return (
    <section
      id="story"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8"
    >
      <div className="grid gap-10 md:grid-cols-2 md:items-center lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div
            className="relative aspect-[4/5] overflow-hidden border"
            style={{
              borderColor: colors.line,
              backgroundColor: colors.panel,
            }}
          >
            <Img
              src="https://picsum.photos/seed/hustler-founder/800/1000"
              alt="Founder of TheHustlerMerchandise"
              className="h-full w-full object-cover grayscale"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-7">
          <span
            className="font-mono text-[11px] tracking-[0.25em]"
            style={{ color: SIGNAL }}
          >
            Our story
          </span>

          <h2
            className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
            style={{ color: colors.text }}
          >
            Made for the ones
            <br />
            who don&apos;t clock out
          </h2>

          <p
            className="mt-6 max-w-xl"
            style={{ color: colors.textMuted }}
          >
            TheHustlerMerchandise started as a side hustle between late shifts and early
            mornings — printed one hoodie at a time for a crew that refused to settle. Every
            piece we drop is still designed the same way: heavyweight fabric, graphics that mean
            something, and small-batch runs so nothing feels mass-produced.
          </p>

          <p
            className="mt-4 max-w-xl"
            style={{ color: colors.textMuted }}
          >
            Today that same crew mentality runs the custom merch side of the business — printing
            for founders, creators, and teams who want gear that actually looks like it belongs
            on a shelf, not a stockroom.
          </p>

          <div
            className="mt-8 grid grid-cols-3 gap-3 border-t pt-6 sm:gap-6"
            style={{ borderColor: colors.line }}
          >
            <div>
              <p
                className="font-display text-2xl sm:text-3xl"
                style={{ color: SIGNAL }}
              >
                40K+
              </p>

              <p
                className="font-mono text-[10px] tracking-widest"
                style={{ color: colors.textMuted }}
              >
                Pieces shipped
              </p>
            </div>

            <div>
              <p
                className="font-display text-2xl sm:text-3xl"
                style={{ color: SIGNAL }}
              >
                4.8/5
              </p>

              <p
                className="font-mono text-[10px] tracking-widest"
                style={{ color: colors.textMuted }}
              >
                Avg. rating
              </p>
            </div>

            <div>
              <p
                className="font-display text-2xl sm:text-3xl"
                style={{ color: SIGNAL }}
              >
                100%
              </p>

              <p
                className="font-mono text-[10px] tracking-widest"
                style={{ color: colors.textMuted }}
              >
                Small-batch
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Reviews — unchanged                                                 */
/* -------------------------------------------------------------------- */

function ReviewCard({
  review,
}: {
  review: Review;
}) {
  const { colors } = useTheme();

  return (
    <div
      className="flex h-full flex-col justify-between border p-5"
      style={{
        borderColor: colors.line,
        backgroundColor: colors.panel,
      }}
    >
      <div>
        <StarRating rating={review.rating} />

        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          &ldquo;{review.text}&rdquo;
        </p>
      </div>

      <div
        className="mt-5 flex items-center gap-3 border-t pt-4"
        style={{ borderColor: colors.line }}
      >
        <Img
          src={`https://picsum.photos/seed/${review.avatarSeed}/80/80`}
          alt={review.author}
          className="h-9 w-9 rounded-full object-cover grayscale"
        />

        <div>
          <div className="flex items-center gap-1.5">
            <p
              className="text-xs font-medium"
              style={{ color: colors.text }}
            >
              {review.author}
            </p>

            {review.verified && (
              <span
                className="font-mono text-[9px]"
                style={{ color: SIGNAL }}
              >
                ✓ Verified
              </span>
            )}
          </div>

          <p
            className="font-mono text-[10px]"
            style={{ color: colors.textMuted }}
          >
            {review.product} · {review.location}
          </p>
        </div>
      </div>
    </div>
  );
}

function Reviews() {
  const { colors } = useTheme();

  return (
    <section
      className="py-16 sm:py-20"
      style={{
        backgroundColor: hexToRgba(
          colors.panel,
          0.4
        ),
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="25,000+ hustlers"
          title="What they're saying"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Instagram — unchanged                                               */
/* -------------------------------------------------------------------- */

const INSTAGRAM_URL = "https://www.instagram.com/thehustler.merchandise/?hl=en";

function InstagramSection() {
  const { colors } = useTheme();

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-10 md:grid-cols-2 md:items-center lg:grid-cols-12 lg:gap-16">
        {/* Photo */}

        <div className="lg:col-span-6">
          <div
            className="group relative aspect-[4/5] overflow-hidden border sm:aspect-[16/11]"
            style={{ borderColor: colors.line, backgroundColor: colors.panel }}
          >
            <Img
              src="https://picsum.photos/seed/hustler-ig-feature/1100/800"
              alt="Behind the scenes at TheHustlerMerchandise"
              className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
            />

            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to top, ${hexToRgba(colors.bg, 0.6)}, transparent 55%)`,
              }}
            />

            <div
              className="absolute -bottom-4 left-5 -rotate-2 border px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest sm:left-6"
              style={{
                borderColor: "#131210",
                backgroundColor: SIGNAL,
                color: "#131210",
              }}
            >
              ON THE FLOOR · @thehustler.merchandise
            </div>
          </div>
        </div>

        {/* Copy */}

        <div className="lg:col-span-6">
          <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>
            Follow along
          </span>

          <h2
            className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl"
            style={{ color: colors.text }}
          >
            Behind the
            <br />
            stitching
          </h2>

          <p className="mt-5 max-w-lg text-sm sm:text-base" style={{ color: colors.textMuted }}>
            Print runs, packed orders, and the crew making it happen — we post the process, not
            just the product. Follow along for early looks at new drops, restock alerts, and the
            odd 6am studio photo.
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
            style={{ backgroundColor: SIGNAL, color: "#131210" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#131210" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="#131210" stroke="none" />
            </svg>
            Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Footer — unchanged                                                  */
/* -------------------------------------------------------------------- */

function Footer() {
  const { colors } = useTheme();

  return (
    <footer
      className="border-t"
      style={{ borderColor: colors.line }}
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p
              className="font-display text-2xl uppercase tracking-tight"
              style={{ color: colors.text }}
            >
              The Hustler
              <span style={{ color: SIGNAL }}>
                .
              </span>
            </p>

            <p
              className="mt-3 max-w-xs text-sm"
              style={{ color: colors.textMuted }}
            >
              Streetwear for the self-made. Designed and printed in-house, shipped across India.
            </p>

            <form
              className="mt-6 flex max-w-xs border"
              style={{
                borderColor: colors.lineStrong,
              }}
              onSubmit={(e) =>
                e.preventDefault()
              }
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="w-full bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                style={{ color: colors.text }}
              />

              <button
                type="submit"
                className="shrink-0 whitespace-nowrap px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: SIGNAL,
                  color: "#131210",
                }}
              >
                Join
              </button>
            </form>

            <div
              className="mt-6 flex gap-4"
              style={{ color: colors.textMuted }}
            >
              {["Instagram", "X", "YouTube"].map(
                (s) => (
                  <a
                    key={s}
                    href="#"
                    className="font-mono text-[11px] tracking-widest transition hover:opacity-80"
                  >
                    {s}
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <p
              className="font-mono text-[11px] tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Shop
            </p>

            <ul
              className="mt-4 space-y-2 text-sm"
              style={{ color: colors.textMuted }}
            >
              <li>
                <a
                  href="#products"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Featured Products
                </a>
              </li>

              <li>
                <a
                  href="/categories"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Collections
                </a>
              </li>

              <li>
                <a
                  href="#custom"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Custom Merch
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Gift Cards
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p
              className="font-mono text-[11px] tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Support
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Track Order
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Size Guide
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  FAQs
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p
              className="font-mono text-[11px] tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Policies
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Shipping Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Returns & Exchanges
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition hover:opacity-80"
                  style={{ color: colors.text }}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row"
          style={{
            borderColor: colors.line,
            color: colors.textMuted,
          }}
        >
          <p>
            © {new Date().getFullYear()} TheHustlerMerchandise. All rights reserved.
          </p>

          <p className="font-mono text-[10px] tracking-widest">
            Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- */
/*  Page                                                                */
/* -------------------------------------------------------------------- */

export default function Home() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setProductsLoading(true);

        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(
            `Request failed with ${res.status}`
          );
        }

        const raw = await res.json();
        const data: Product[] = Array.isArray(raw)
          ? raw
          : raw.data ?? [];

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Hero />

      <Ticker />

      <FeaturedCategories />

      <FeaturedProducts
        products={products}
        loading={productsLoading}
      />

      <CustomMerch />

      <BestProducts
        products={products}
        loading={productsLoading}
      />

      <BrandStory />

      <Reviews />

      <InstagramSection />

      <Footer />

      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}