"use client";

/**
 * TheHustlerMerchandise — Home Page (v7 — toasts + full responsive pass)
 * -----------------------------------------------------------------------
 * Theme (dark/light + SIGNAL orange) lives in
 * `src/context/ThemeContext.tsx` and is shared with every other page.
 *
 * Categories:  GET /api/categories
 * Products:    GET /api/products
 *
 * v7 changes (search for "TOAST" and "RESPONSIVE" comments):
 *  - Self-contained toast system (ToastProvider / useToast / ToastViewport)
 *  - Toasts on: category load error, product load error, newsletter
 *    validation + success, track-order login prompt, contact form
 *    success / error
 *  - Responsive fixes across Hero, SectionHeading, ProductCard,
 *    BestProducts, Instagram, Contact, Footer
 * -----------------------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

/* Live category shape — matches list-categories.usecase.ts */
type CategoryDTO = {
  categoryId: string;
  categoryName: string;
  description?: string | null;
  imageUrl?: string | null;
};

/* -------------------------------------------------------------------- */
/*  TOAST — provider, hook, viewport                                    */
/* -------------------------------------------------------------------- */

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<{ toast: ToastFn }>({
  toast: () => {},
});

function useToast() {
  return useContext(ToastContext);
}

const TOAST_DURATION_MS = 4500;
const MAX_TOASTS = 3;

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, type = "info") => {
      const id = ++idRef.current;

      setToasts((prev) => {
        // Don't stack identical messages (e.g. React strict-mode double effects)
        if (prev.some((x) => x.message === message && x.type === type)) {
          return prev;
        }
        return [...prev.slice(-(MAX_TOASTS - 1)), { id, type, message }];
      });

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), TOAST_DURATION_MS)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  const { colors } = useTheme();

  const accent = (type: ToastType) =>
    type === "error" ? "#ef4444" : type === "success" ? SIGNAL : colors.lineStrong;

  const icon = (type: ToastType) =>
    type === "error" ? "!" : type === "success" ? "✓" : "i";

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-6"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_0.25s_ease-out_both] items-start gap-3 border-l-4 border px-4 py-3 shadow-2xl sm:w-auto sm:min-w-[300px]"
          style={{
            backgroundColor: colors.panel,
            borderColor: colors.lineStrong,
            borderLeftColor: accent(t.type),
            color: colors.text,
          }}
        >
          <span
            aria-hidden
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
            style={{
              backgroundColor: accent(t.type),
              color: "#131210",
            }}
          >
            {icon(t.type)}
          </span>

          <p className="flex-1 break-words text-sm leading-snug">
            {t.message}
          </p>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(t.id)}
            className="-mr-1 shrink-0 px-1 font-mono text-base leading-none transition hover:opacity-100"
            style={{ color: colors.textMuted }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

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
/*  FAQ data                                                            */
/* -------------------------------------------------------------------- */

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does shipping take?",
    a: "Standard orders ship within 5–7 business days across India. Custom merch orders may take slightly longer depending on print volume and proof approval time.",
  },
  {
    q: "Can I get my own design printed?",
    a: "Yes — head to the Custom Merch section, upload your artwork, and we'll send you a proof before anything goes to print. Minimum order is just 2 pieces.",
  },
  {
    q: "What sizes do you offer?",
    a: "Most product lines run from S through XXL. Check the Size Guide (linked in the footer) for detailed chest, length, and sleeve measurements per product.",
  },
  {
    q: "What's your return and exchange policy?",
    a: "Unworn, unwashed items can be returned or exchanged within 7 days of delivery. Full details are on the Returns & Exchanges page.",
  },
  {
    q: "How do I track an existing order?",
    a: "Log in and open the Orders page from your account, or use the Track Order link in the footer — it'll take you straight there if you're signed in.",
  },
  {
    q: "Do you ship outside India?",
    a: "Right now we only ship within India. We're working on international shipping — follow us on Instagram for updates.",
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
          className="px-2 text-center font-mono text-[9px] tracking-widest sm:text-[10px]"
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

/* RESPONSIVE: the "View all / Shop all" action is now visible on mobile too
   (it used to be `hidden sm:block`), and the title block can shrink. */
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
    <div
      className="mb-6 flex items-end justify-between gap-3 border-b pb-4 sm:mb-8 sm:gap-4 sm:pb-5"
      style={{ borderColor: colors.line }}
    >
      <div className="min-w-0">
        <span
          className="font-mono text-[10px] tracking-[0.25em] sm:text-[11px]"
          style={{ color: SIGNAL }}
        >
          {eyebrow}
        </span>
        <h2
          className="mt-2 font-display text-2xl uppercase tracking-tight min-[400px]:text-3xl sm:text-4xl"
          style={{ color: colors.text }}
        >
          {title}
        </h2>
      </div>
      {action && (
        <a
          href={action.href}
          className="shrink-0 whitespace-nowrap pb-1 font-mono text-[10px] uppercase tracking-widest transition hover:opacity-100 sm:text-xs"
          style={{ color: colors.textMuted }}
        >
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

/** Diagonal hazard-stripe rule — unchanged */
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
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-6 whitespace-nowrap sm:gap-10">
          {loop.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-6 font-mono text-[10px] tracking-[0.25em] sm:gap-10 sm:text-xs"
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
/*  Hero                                                                 */
/*  RESPONSIVE: smaller headline on narrow phones, full-width CTAs on    */
/*  mobile, hero image capped on phones so it doesn't fill the screen.   */
/* -------------------------------------------------------------------- */

function Hero() {
  const { colors } = useTheme();

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-12 pt-10 min-[400px]:px-5 sm:px-8 sm:pb-10 sm:pt-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center lg:grid-cols-12 lg:items-end">
        <div className="animate-[fade-up_0.7s_ease-out_both] lg:col-span-7">
          <span
            className="inline-flex items-center gap-2 border px-3 py-1 font-mono text-[10px] tracking-widest sm:text-[11px]"
            style={{ borderColor: SIGNAL, color: SIGNAL }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: SIGNAL }}
            />
            DROP 004 · LIVE NOW
          </span>

          <h1
            className="mt-5 font-display text-[2.75rem] uppercase leading-[0.9] tracking-tight min-[400px]:text-5xl sm:mt-6 sm:text-6xl sm:leading-[0.85] md:text-6xl lg:text-8xl xl:text-9xl"
            style={{ color: colors.text }}
          >
            Wear the
            <br />
            Grind<span style={{ color: SIGNAL }}>.</span>
          </h1>

          <p
            className="mt-5 max-w-md text-sm sm:mt-6 sm:text-base"
            style={{ color: colors.textMuted }}
          >
            Streetwear for people who clock out and keep working. Heavyweight cotton, graphics
            earned the hard way, and custom merch for the teams building alongside you.
          </p>

          <div className="mt-7 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap sm:mt-8 sm:gap-4">
            <a
              href="#products"
              className="px-7 py-3 text-center font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
              style={{
                backgroundColor: SIGNAL,
                color: "#131210",
              }}
            >
              Shop the drop
            </a>

            <a
              href="#custom"
              className="border px-7 py-3 text-center font-mono text-xs font-bold uppercase tracking-widest transition"
              style={{
                borderColor: colors.lineStrong,
                color: colors.text,
              }}
            >
              Start customizing
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs animate-[fade-up_0.9s_ease-out_0.15s_both] min-[480px]:max-w-sm md:max-w-none lg:col-span-5">
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
            className="absolute -bottom-4 -left-2 w-32 -rotate-3 border p-2.5 font-mono shadow-xl min-[400px]:-left-3 min-[400px]:w-36 sm:-bottom-6 sm:-left-10 sm:w-56 sm:p-3"
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
/*  Featured Categories                                                  */
/*  TOAST: error toast when categories fail to load (previously the      */
/*  section just silently disappeared).                                  */
/* -------------------------------------------------------------------- */

function FeaturedCategories() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

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

        const raw = await res.json();
        const data: CategoryDTO[] = Array.isArray(raw) ? raw : raw.data ?? [];

        if (!cancelled) {
          setCategories(data.slice(0, 4));
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          toast(
            "Couldn't load collections. Please refresh the page.",
            "error"
          );
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (
    status === "error" ||
    (status === "success" && categories.length === 0)
  ) {
    return null;
  }

  return (
    <section
      id="categories"
      className="mx-auto max-w-7xl px-4 py-12 min-[400px]:px-5 sm:px-8 sm:py-16"
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
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse border"
                style={{
                  borderColor: colors.line,
                  backgroundColor: colors.panel,
                }}
              />
            ))
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
                    src={cat.imageUrl || fallbackImage}
                    alt={cat.categoryName}
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
                      className="font-display text-base uppercase leading-tight tracking-tight min-[400px]:text-lg sm:text-xl"
                      style={{ color: colors.text }}
                    >
                      {cat.categoryName}
                    </p>

                    {cat.description && (
                      <p
                        className="mt-1 line-clamp-2 max-w-[90%] font-mono text-[9px] leading-relaxed sm:text-[10px]"
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
/*  Product card                                                        */
/*  RESPONSIVE: "View Product" bar used to appear on hover only, which   */
/*  never fires on touch screens. It's now always visible below md and   */
/*  hover-reveal from md up. The product name is also a link.            */
/* -------------------------------------------------------------------- */

function ProductCard({ product }: { product: Product }) {
  const { colors } = useTheme();

  const price =
    product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((variant) => Number(variant.price)))
      : null;

  return (
    <div className="group min-w-0">
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
          className="absolute inset-x-2 bottom-2 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest transition duration-300 sm:inset-x-3 sm:bottom-3 sm:text-xs md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          style={{
            backgroundColor: colors.text,
            color: colors.bg,
          }}
        >
          View Product
        </a>
      </div>

      <div className="mt-3">
        <a href={`/products/${product.productId}`}>
          <h3
            className="line-clamp-2 text-sm font-medium leading-snug"
            style={{ color: colors.text }}
          >
            {product.productName}
          </h3>
        </a>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <StarRating rating={product.rating ?? 0} size={12} />

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
/*  Featured Products                                                   */
/* -------------------------------------------------------------------- */

function FeaturedProducts({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const { colors } = useTheme();

  return (
    <section
      id="products"
      className="mx-auto max-w-7xl px-4 py-12 min-[400px]:px-5 sm:px-8 sm:py-16"
    >
      <SectionHeading
        eyebrow="Drop 004"
        title="Featured products"
        action={{
          label: "Shop all",
          href: "/products",
        }}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse border"
                style={{
                  borderColor: colors.line,
                  backgroundColor: colors.panel,
                }}
              />
            ))
          : products
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Custom Merchandise                                                  */
/*  RESPONSIVE: tighter paddings, image capped on mobile, full-width     */
/*  CTA on phones.                                                       */
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
      className="py-12 sm:py-20"
      style={{ backgroundColor: colors.panel }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 min-[400px]:px-5 sm:px-8 md:grid-cols-2 md:items-center md:gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div
            className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden border md:max-w-none"
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
              className="absolute bottom-4 left-4 border px-3 py-2 font-mono text-[10px] font-bold tracking-widest sm:bottom-5 sm:left-5 sm:px-4 sm:text-xs"
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
            className="font-mono text-[10px] tracking-[0.25em] sm:text-[11px]"
            style={{ color: SIGNAL }}
          >
            Print on demand
          </span>

          <h2
            className="mt-3 font-display text-3xl uppercase leading-[0.95] tracking-tight min-[400px]:text-4xl sm:text-5xl"
            style={{ color: colors.text }}
          >
            Your logo.
            <br />
            Your crew.
            <br />
            Our print.
          </h2>

          <p
            className="mt-5 max-w-lg text-sm sm:text-base"
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
                  borderColor: i === 0 ? "transparent" : colors.line,
                }}
              >
                <span
                  className="font-display text-2xl"
                  style={{ color: SIGNAL }}
                >
                  {s.n}
                </span>

                <div className="min-w-0">
                  <p className="font-medium" style={{ color: colors.text }}>
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
            href="/products"
            className="mt-8 block px-7 py-3 text-center font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 sm:inline-block"
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
/*  Best Products                                                       */
/*  RESPONSIVE: narrower cards on small phones so the next card peeks    */
/*  in (signals swipe), scroll-padding so snapping respects the gutter.  */
/* -------------------------------------------------------------------- */

function BestProducts({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const { colors } = useTheme();

  const scrollerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sorted = [...products].sort(
    (a, b) =>
      (b.rating ?? 0) * (b.reviewCount ?? 0) -
      (a.rating ?? 0) * (a.reviewCount ?? 0)
  );

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();

    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, products.length]);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-best-card]");
    const amount = firstCard
      ? firstCard.getBoundingClientRect().width + 16
      : 320;

    el.scrollBy({
      left: dir * amount,
      behavior: "smooth",
    });
  };

  const cardWidth =
    "w-[160px] min-[400px]:w-[200px] sm:w-[240px]";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 min-[400px]:px-5 sm:px-8 sm:py-16">
      <div
        className="mb-6 flex items-end justify-between gap-3 border-b pb-4 sm:mb-8 sm:gap-4 sm:pb-5"
        style={{ borderColor: colors.line }}
      >
        <div className="min-w-0">
          <span
            className="font-mono text-[10px] tracking-[0.25em] sm:text-[11px]"
            style={{ color: SIGNAL }}
          >
            Top rated
          </span>

          <h2
            className="mt-2 font-display text-2xl uppercase tracking-tight min-[400px]:text-3xl sm:text-4xl"
            style={{ color: colors.text }}
          >
            Best products
          </h2>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            onClick={() => scroll(-1)}
            className="h-9 w-9 border transition disabled:cursor-not-allowed"
            style={{
              borderColor: colors.lineStrong,
              color: colors.textMuted,
              opacity: canScrollLeft ? 1 : 0.35,
            }}
          >
            ←
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            disabled={!canScrollRight}
            onClick={() => scroll(1)}
            className="h-9 w-9 border transition disabled:cursor-not-allowed"
            style={{
              borderColor: colors.lineStrong,
              color: colors.textMuted,
              opacity: canScrollRight ? 1 : 0.35,
            }}
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] min-[400px]:-mx-5 min-[400px]:scroll-px-5 min-[400px]:px-5 sm:mx-0 sm:scroll-px-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`relative shrink-0 snap-start ${cardWidth}`}
              >
                <div
                  className="aspect-[3/4] animate-pulse border"
                  style={{
                    borderColor: colors.line,
                    backgroundColor: colors.panel,
                  }}
                />
              </div>
            ))
          : sorted.map((product) => {
              const price =
                product.variants && product.variants.length > 0
                  ? Math.min(
                      ...product.variants.map((variant) =>
                        Number(variant.price)
                      )
                    )
                  : null;

              return (
                <a
                  key={product.productId}
                  data-best-card
                  href={`/products/${product.productId}`}
                  className={`relative shrink-0 snap-start ${cardWidth}`}
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden border"
                    style={{
                      borderColor: colors.line,
                      backgroundColor: colors.panel,
                    }}
                  >
                    <Img
                      src={product.productImage || ""}
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
                        ? `₹${price.toLocaleString("en-IN")}`
                        : "Price unavailable"}
                    </span>
                  </div>

                  <div className="mt-1">
                    <StarRating rating={product.rating ?? 0} size={12} />
                  </div>
                </a>
              );
            })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Brand Story                                                         */
/*  RESPONSIVE: image capped on phones, smaller paddings.               */
/* -------------------------------------------------------------------- */

function BrandStory() {
  const { colors } = useTheme();

  return (
    <section
      id="story"
      className="mx-auto max-w-7xl px-4 py-14 min-[400px]:px-5 sm:px-8 sm:py-20"
    >
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div
            className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden border md:max-w-none"
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
            className="font-mono text-[10px] tracking-[0.25em] sm:text-[11px]"
            style={{ color: SIGNAL }}
          >
            Our story
          </span>

          <h2
            className="mt-3 font-display text-3xl uppercase leading-[0.95] tracking-tight min-[400px]:text-4xl sm:text-5xl"
            style={{ color: colors.text }}
          >
            Made for the ones
            <br />
            who don&apos;t clock out
          </h2>

          <p
            className="mt-6 max-w-xl text-sm sm:text-base"
            style={{ color: colors.textMuted }}
          >
            TheHustlerMerchandise started as a side hustle between late shifts and early
            mornings — printed one hoodie at a time for a crew that refused to settle. Every
            piece we drop is still designed the same way: heavyweight fabric, graphics that mean
            something, and small-batch runs so nothing feels mass-produced.
          </p>

          <p
            className="mt-4 max-w-xl text-sm sm:text-base"
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
            {[
              { value: "40K+", label: "Pieces shipped" },
              { value: "4.8/5", label: "Avg. rating" },
              { value: "100%", label: "Small-batch" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-display text-xl min-[400px]:text-2xl sm:text-3xl"
                  style={{ color: SIGNAL }}
                >
                  {stat.value}
                </p>

                <p
                  className="font-mono text-[9px] tracking-widest sm:text-[10px]"
                  style={{ color: colors.textMuted }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Reviews                                                             */
/* -------------------------------------------------------------------- */

function ReviewCard({ review }: { review: Review }) {
  const { colors } = useTheme();

  return (
    <div
      className="flex h-full flex-col justify-between border p-4 sm:p-5"
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
          className="h-9 w-9 shrink-0 rounded-full object-cover grayscale"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-1.5">
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
            className="truncate font-mono text-[10px]"
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
      className="py-12 sm:py-20"
      style={{
        backgroundColor: hexToRgba(colors.panel, 0.4),
      }}
    >
      <div className="mx-auto max-w-7xl px-4 min-[400px]:px-5 sm:px-8">
        <SectionHeading
          eyebrow="25,000+ hustlers"
          title="What they're saying"
        />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Instagram                                                           */
/*  RESPONSIVE FIX: the "ON THE FLOOR" tag sat at -bottom-4 INSIDE an    */
/*  overflow-hidden box, so it was being clipped. It now lives on an     */
/*  outer wrapper; the image keeps its own overflow-hidden box.          */
/* -------------------------------------------------------------------- */

const INSTAGRAM_URL = "https://www.instagram.com/thehustler.merchandise/?hl=en";

function InstagramSection() {
  const { colors } = useTheme();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 min-[400px]:px-5 sm:px-8 sm:py-20">
      <div className="grid gap-10 md:grid-cols-2 md:items-center lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="relative pb-4">
            <div
              className="group relative aspect-[4/5] overflow-hidden border sm:aspect-[16/11]"
              style={{
                borderColor: colors.line,
                backgroundColor: colors.panel,
              }}
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
            </div>

            <div
              className="absolute bottom-0 left-4 max-w-[calc(100%-2rem)] -rotate-2 border px-3 py-1.5 font-mono text-[9px] font-bold tracking-widest sm:left-6 sm:text-[10px]"
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

        <div className="lg:col-span-6">
          <span
            className="font-mono text-[10px] tracking-[0.25em] sm:text-[11px]"
            style={{ color: SIGNAL }}
          >
            Follow along
          </span>

          <h2
            className="mt-3 font-display text-3xl uppercase leading-[0.95] tracking-tight min-[400px]:text-4xl sm:text-5xl"
            style={{ color: colors.text }}
          >
            Behind the
            <br />
            stitching
          </h2>

          <p
            className="mt-5 max-w-lg text-sm sm:text-base"
            style={{ color: colors.textMuted }}
          >
            Print runs, packed orders, and the crew making it happen — we post the process, not
            just the product. Follow along for early looks at new drops, restock alerts, and the
            odd 6am studio photo.
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-2.5 px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 sm:w-auto"
            style={{ backgroundColor: SIGNAL, color: "#131210" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#131210"
              strokeWidth="2"
            >
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
/*  FAQ section                                                         */
/* -------------------------------------------------------------------- */

function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();

  return (
    <div className="border-b" style={{ borderColor: colors.line }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left sm:py-5"
      >
        <span
          className="text-sm font-medium sm:text-base"
          style={{ color: colors.text }}
        >
          {q}
        </span>

        <span
          className="shrink-0 font-mono text-lg transition-transform"
          style={{
            color: SIGNAL,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>

      {open && (
        <p
          className="pb-5 text-sm leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

function FAQSection() {
  const { colors } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="mx-auto max-w-4xl scroll-mt-20 px-4 py-12 min-[400px]:px-5 sm:px-8 sm:py-20"
    >
      <SectionHeading eyebrow="Questions" title="Frequently asked" />

      <div>
        {FAQS.map((item, index) => (
          <FAQItem
            key={item.q}
            q={item.q}
            a={item.a}
            open={openIndex === index}
            onToggle={() =>
              setOpenIndex((prev) => (prev === index ? null : index))
            }
          />
        ))}
      </div>

      <p className="mt-8 text-sm" style={{ color: colors.textMuted }}>
        Still have a question?{" "}
        <a href="#contact" style={{ color: SIGNAL }} className="font-medium">
          Get in touch
        </a>
        .
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Contact section                                                     */
/*  TOAST: success toast on send, error toast if the request fails.     */
/*  RESPONSIVE: inputs are 16px on mobile (stops iOS zoom-on-focus),    */
/*  contact details wrap, button is full width on phones.               */
/* -------------------------------------------------------------------- */

function ContactSection() {
  const { colors } = useTheme();
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    setSending(true);

    try {
      // TODO: wire this up to a real /api/contact route when one exists:
      // const res = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      // });
      // if (!res.ok) throw new Error("Request failed");

      setSubmitted(true);
      toast("Message sent. We'll reply within one business day.", "success");
    } catch {
      toast(
        "Couldn't send your message. Please try again in a moment.",
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  const fieldClass =
    "w-full border px-3 py-3 text-base outline-none focus:border-[var(--signal)] sm:text-sm";
  const fieldStyle = {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
    color: colors.text,
    "--signal": SIGNAL,
  } as React.CSSProperties;

  return (
    <section
      id="contact"
      className="scroll-mt-20 py-12 sm:py-20"
      style={{ backgroundColor: colors.panel }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 min-[400px]:px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <span
            className="font-mono text-[10px] tracking-[0.25em] sm:text-[11px]"
            style={{ color: SIGNAL }}
          >
            Get in touch
          </span>

          <h2
            className="mt-3 font-display text-3xl uppercase leading-[0.95] tracking-tight min-[400px]:text-4xl sm:text-5xl"
            style={{ color: colors.text }}
          >
            Contact us
          </h2>

          <p
            className="mt-5 max-w-md text-sm"
            style={{ color: colors.textMuted }}
          >
            Questions about an order, a custom print, or a bulk request — reach out and we'll
            get back to you within one business day.
          </p>

          <div className="mt-8 space-y-3 font-mono text-xs sm:text-sm">
            <p className="break-all" style={{ color: colors.text }}>
              <a href="mailto:support@thehustlermerchandise.com">
                support@thehustlermerchandise.com
              </a>
            </p>
            <p style={{ color: colors.text }}>
              <a href="tel:+919876543210">+91 98765 43210</a>
            </p>
            <p style={{ color: colors.textMuted }}>Mon–Sat, 10am–6pm IST</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {submitted ? (
            <div
              className="border p-5 font-mono text-sm sm:p-6"
              style={{
                borderColor: SIGNAL,
                color: SIGNAL,
                backgroundColor: colors.bg,
              }}
            >
              <p>Thanks — your message has been noted. We'll get back to you soon.</p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs uppercase tracking-widest underline underline-offset-4"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-3 sm:grid-cols-2 sm:gap-4"
            >
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Your name"
                className={`${fieldClass} sm:col-span-1`}
                style={fieldStyle}
              />

              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your email"
                className={`${fieldClass} sm:col-span-1`}
                style={fieldStyle}
              />

              <input
                name="orderId"
                placeholder="Order ID (optional)"
                className={`${fieldClass} sm:col-span-2`}
                style={fieldStyle}
              />

              <textarea
                required
                name="message"
                rows={5}
                placeholder="How can we help?"
                className={`${fieldClass} sm:col-span-2`}
                style={fieldStyle}
              />

              <button
                type="submit"
                disabled={sending}
                className="w-full px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95 disabled:opacity-60 sm:col-span-2 sm:w-fit"
                style={{
                  backgroundColor: SIGNAL,
                  color: "#131210",
                }}
              >
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Footer                                                              */
/*  TOAST:                                                              */
/*   - Newsletter: invalid-email error toast, success toast before      */
/*     redirecting to /signup                                           */
/*   - Track Order: when logged out, an info toast explains the login   */
/*     redirect instead of silently bouncing the user                   */
/*  RESPONSIVE: newsletter full width on phones, brand column spans     */
/*  the full row until lg, larger tap targets on links.                 */
/* -------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Footer() {
  const { colors } = useTheme();
  const { status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";

  const [newsletterEmail, setNewsletterEmail] = useState("");

  function handleTrackOrder(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    if (status === "loading") {
      toast("Checking your session — try again in a moment.", "info");
      return;
    }

    if (isAuthenticated) {
      router.push("/orders");
      return;
    }

    toast("Please log in to track your order.", "info");
    setTimeout(() => {
      router.push(`/login?redirect=${encodeURIComponent("/orders")}`);
    }, 900);
  }

  function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const email = newsletterEmail.trim();

    if (!email) {
      toast("Enter your email to join.", "error");
      return;
    }

    if (!EMAIL_RE.test(email)) {
      toast("That email doesn't look right. Check it and try again.", "error");
      return;
    }

    toast("You're in. Taking you to sign up…", "success");
    setTimeout(() => {
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    }, 800);
  }

  const linkClass = "inline-block py-0.5 transition hover:opacity-80";

  return (
    <footer className="border-t" style={{ borderColor: colors.line }}>
      <div className="mx-auto max-w-7xl px-4 py-12 min-[400px]:px-5 sm:px-8 sm:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <p
              className="font-display text-2xl uppercase tracking-tight"
              style={{ color: colors.text }}
            >
              The Hustler
              <span style={{ color: SIGNAL }}>.</span>
            </p>

            <p
              className="mt-3 max-w-xs text-sm"
              style={{ color: colors.textMuted }}
            >
              Streetwear for the self-made. Designed and printed in-house, shipped across India.
            </p>

            <form
              noValidate
              className="mt-6 flex w-full max-w-sm border"
              style={{
                borderColor: colors.lineStrong,
              }}
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-label="Email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base focus:outline-none sm:text-sm"
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
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] tracking-widest transition hover:opacity-80"
              >
                Instagram
              </a>
            </div>
          </div>

          <div>
            <p
              className="font-mono text-[11px] tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Shop
            </p>

            <ul className="mt-4 space-y-1.5 text-sm">
              <li>
                <a href="#products" className={linkClass} style={{ color: colors.text }}>
                  Featured Products
                </a>
              </li>

              <li>
                <a href="/categories" className={linkClass} style={{ color: colors.text }}>
                  Collections
                </a>
              </li>

              <li>
                <a href="#custom" className={linkClass} style={{ color: colors.text }}>
                  Custom Merch
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

            <ul className="mt-4 space-y-1.5 text-sm">
              <li>
                <a
                  href={
                    isAuthenticated
                      ? "/orders"
                      : `/login?redirect=${encodeURIComponent("/orders")}`
                  }
                  onClick={handleTrackOrder}
                  className={linkClass}
                  style={{ color: colors.text }}
                >
                  Track Order
                </a>
              </li>

              <li>
                <a href="/size-guide" className={linkClass} style={{ color: colors.text }}>
                  Size Guide
                </a>
              </li>

              <li>
                <a href="/#faqs" className={linkClass} style={{ color: colors.text }}>
                  FAQs
                </a>
              </li>

              <li>
                <a href="/#contact" className={linkClass} style={{ color: colors.text }}>
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

            <ul className="mt-4 space-y-1.5 text-sm">
              <li>
                <a href="/shipping-policy" className={linkClass} style={{ color: colors.text }}>
                  Shipping Policy
                </a>
              </li>

              <li>
                <a href="/returns-exchanges" className={linkClass} style={{ color: colors.text }}>
                  Returns & Exchanges
                </a>
              </li>

              <li>
                <a href="/privacy-policy" className={linkClass} style={{ color: colors.text }}>
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="/terms-of-service" className={linkClass} style={{ color: colors.text }}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-center text-xs sm:mt-12 sm:flex-row sm:text-left"
          style={{
            borderColor: colors.line,
            color: colors.textMuted,
          }}
        >
          <p>
            © {new Date().getFullYear()} TheHustlerMerchandise. All rights reserved.
          </p>

          <p className="font-mono text-[10px] tracking-widest">Made in India</p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- */
/*  Page                                                                */
/*  TOAST: Home is now a thin wrapper that mounts <ToastProvider>; the  */
/*  real page lives in HomeContent so it can call useToast().           */
/*  Product-load failure now raises an error toast.                     */
/*  RESPONSIVE: root has overflow-x-hidden so rotated stickers can't    */
/*  create horizontal scroll; marquee respects prefers-reduced-motion.  */
/* -------------------------------------------------------------------- */

function HomeContent() {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setProductsLoading(true);

        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }

        const raw = await res.json();
        const data: Product[] = Array.isArray(raw) ? raw : raw.data ?? [];

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products:", error);

        if (!cancelled) {
          setProducts([]);
          toast("Couldn't load products. Please refresh the page.", "error");
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
  }, [toast]);

  return (
    <div className="overflow-x-hidden">
      <Hero />

      <Ticker />

      <FeaturedCategories />

      <FeaturedProducts products={products} loading={productsLoading} />

      <CustomMerch />

      <BestProducts products={products} loading={productsLoading} />

      <BrandStory />

      <Reviews />

      <InstagramSection />

      <FAQSection />

      <ContactSection />

      <Footer />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}