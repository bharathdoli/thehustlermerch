"use client";

/**
 * TheHustlerMerchandise — Home Page (v8 — editorial redesign)
 * Hero slider · Categories · New Arrivals · Bestsellers ·
 * Instagram · Testimonials · Newsletter · Footer
 * Data: GET /api/categories, GET /api/products (unchanged).
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
import { ORANGE, usePalette } from "@/src/lib/palette";

/* ------------------------------ Types ------------------------------ */

type ProductVariant = {
  variantId?: string;
  colour?: string;
  size?: string;
  price: number;
  comparePrice?: number | null; // optional: original price, enables "% off"
  stockQuantity?: number;
};

type Product = {
  productId: string;
  categoryId?: string;
  productName: string;
  productImage?: string | null;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
};

type CategoryDTO = {
  categoryId: string;
  categoryName: string;
  description?: string | null;
  imageUrl?: string | null;
};

/* ------------------------------ Toasts ----------------------------- */

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };
type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<{ toast: ToastFn }>({ toast: () => {} });
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((p) => p.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, type = "info") => {
      const id = ++idRef.current;
      setToasts((p) =>
        p.some((x) => x.message === message && x.type === type)
          ? p
          : [...p.slice(-2), { id, type, message }]
      );
      timers.current.set(id, setTimeout(() => dismiss(id), 4500));
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

  const accent = (t: ToastType) =>
    t === "error" ? "#ef4444" : t === "success" ? ORANGE : "#111";

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 border-l-4 bg-[#111] px-4 py-3 text-sm text-white shadow-2xl sm:w-auto sm:min-w-[300px]"
            style={{ borderLeftColor: accent(t.type) }}
          >
            <p className="flex-1 break-words leading-snug">{t.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="shrink-0 px-1 text-base leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* --------------------------- Shared pieces -------------------------- */

const GREY = "#e6e6e6"; // product / category tile background
const INK = "#0e0e0e";

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center`}
        style={{ backgroundColor: GREY }}
      >
        <span className="px-2 text-center text-[10px] tracking-widest text-neutral-500">
          IMAGE UNAVAILABLE
        </span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string; plain?: boolean };
}) {
  const colors = usePalette();
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ color: ORANGE }}
        >
          {eyebrow}
        </span>
        <h2
          className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          style={{ color: colors.text }}
        >
          {title}
        </h2>
      </div>
      {action &&
        (action.plain ? (
          <a
            href={action.href}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap pb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-60 sm:text-xs"
            style={{ color: colors.text }}
          >
            {action.label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        ) : (
          <a
            href={action.href}
            className="shrink-0 whitespace-nowrap border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition hover:opacity-70 sm:text-[11px]"
            style={{ borderColor: colors.text, color: colors.text }}
          >
            {action.label}
          </a>
        ))}
    </div>
  );
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  const colors = usePalette();
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i + 1 <= Math.round(rating) ? colors.text : "none"}
          stroke={colors.text}
          strokeWidth="1.5"
        >
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </div>
  );
}

const wrap = "mx-auto max-w-[1600px] px-4 sm:px-8";

/* ------------------------------- Hero ------------------------------- */
/* Four images only, sliding automatically every 3.5 seconds.
   The slider fills the whole screen below the header on every device.
   Replace the `image` URLs with your own photos (landscape, ~1920x1000).
   `href` is where a click on that image goes; delete it to make it non-clickable. */

const HERO_INTERVAL_MS = 3500;

const HERO_SLIDES = [
  { alt: "Drop 004", href: "/products", image: "https://picsum.photos/seed/hustler-hero-1/1920/1100" },
  { alt: "The essentials edit", href: "/products", image: "https://picsum.photos/seed/hustler-hero-2/1920/1100" },
  { alt: "Heavyweight hoodies", href: "/products", image: "https://picsum.photos/seed/hustler-hero-3/1920/1100" },
  { alt: "New season", href: "/categories", image: "https://picsum.photos/seed/hustler-hero-4/1920/1100" },
];

function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = HERO_SLIDES.length;

  const go = (dir: number) => setIndex((v) => (v + dir + count) % count);

  // Depends on `index` so any manual change restarts the 3.5s timer.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((v) => (v + 1) % count), HERO_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  return (
    <section
      className="relative h-[calc(100svh-5.75rem)] min-h-[420px] w-full select-none overflow-hidden bg-[#d9d9d9] sm:h-[calc(100svh-6.25rem)]"
      aria-roledescription="carousel"
      aria-label="Featured images"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        setPaused(false);
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {HERO_SLIDES.map((s, n) => (
          <a
            key={s.image}
            href={s.href}
            tabIndex={n === index ? 0 : -1}
            aria-hidden={n !== index}
            aria-label={`${s.alt} (slide ${n + 1} of ${count})`}
            className="relative block h-full w-full shrink-0"
          >
            <Img
              src={s.image}
              alt={s.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </a>
        ))}
      </div>

      {/* Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:bottom-6 sm:px-8">
        <div className="pointer-events-auto flex gap-2">
          {HERO_SLIDES.map((_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Go to slide ${n + 1}`}
              aria-current={n === index}
              onClick={() => setIndex(n)}
              className="h-[3px] transition-all duration-300"
              style={{
                width: n === index ? 44 : 28,
                backgroundColor: n === index ? ORANGE : "rgba(255,255,255,0.8)",
              }}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="pointer-events-auto flex gap-2">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Previous slide" : "Next slide"}
              onClick={() => go(d)}
              className="flex h-10 w-10 items-center justify-center border border-white/70 bg-black/25 text-base text-white backdrop-blur transition hover:bg-white hover:text-black sm:h-11 sm:w-11"
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Categories ---------------------------- */

function FeaturedCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.json();
        const data: CategoryDTO[] = Array.isArray(raw) ? raw : raw.data ?? [];
        if (!cancelled) {
          setCategories(data.slice(0, 8));
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          toast("Couldn't load collections. Please refresh the page.", "error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (status === "error" || (status === "success" && categories.length === 0)) return null;

  return (
    <section id="categories" className={`${wrap} scroll-mt-28 py-12 sm:py-16`}>
      <SectionHeading
        eyebrow="Explore"
        title="Shop by category"
        action={{ label: "Shop all", href: "/categories", plain: true }}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4 lg:gap-6">
        {status === "loading"
          ? Array.from({ length: 8 }).map((_, n) => (
              <div key={n} className="aspect-[4/5] animate-pulse" style={{ backgroundColor: GREY }} />
            ))
          : categories.map((cat, n) => (
              <a
                key={cat.categoryId || n}
                href={`/categories#${cat.categoryId}`}
                className="group relative block aspect-[4/5] overflow-hidden"
                style={{ backgroundColor: GREY }}
              >
                <Img
                  src={cat.imageUrl || `https://picsum.photos/seed/hustler-cat-${cat.categoryId || n}/640/800`}
                  alt={cat.categoryName}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3"
                  style={{ backgroundImage: "linear-gradient(to top, rgba(110,110,110,0.95), rgba(110,110,110,0))" }}
                />
                <p className="absolute bottom-3 left-3 right-3 text-base font-bold uppercase leading-tight text-white sm:bottom-5 sm:left-5 sm:right-5 sm:text-xl lg:text-2xl">
                  {cat.categoryName}
                </p>
              </a>
            ))}
      </div>
    </section>
  );
}

/* ---------------------------- Product card -------------------------- */

function priceInfo(product: Product) {
  const vs = product.variants ?? [];
  if (!vs.length) return null;
  const cheapest = vs.reduce((a, b) => (Number(b.price) < Number(a.price) ? b : a));
  const price = Number(cheapest.price);
  const compare = Number(cheapest.comparePrice ?? 0);
  const off = compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
  return { price, compare: off ? compare : 0, off };
}

function ProductCard({ product, isNew }: { product: Product; isNew?: boolean }) {
  const colors = usePalette();
  const info = priceInfo(product);
  const colours = Array.from(
    new Set((product.variants ?? []).map((v) => v.colour).filter(Boolean) as string[])
  ).slice(0, 5);
  const href = `/products/${product.productId}`;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: GREY }}>
        <a href={href} aria-label={product.productName}>
          <Img
            src={product.productImage || ""}
            alt={product.productName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </a>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {isNew && (
            <span className="bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">
              New
            </span>
          )}
          {info?.off ? (
            <span
              className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: ORANGE }}
            >
              -{info.off}%
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <a href={href}>
          <h3 className="line-clamp-1 text-sm font-medium" style={{ color: colors.text }}>
            {product.productName}
          </h3>
        </a>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
          {info ? (
            <>
              <span className="font-semibold" style={{ color: colors.text }}>{fmt(info.price)}</span>
              {info.compare ? (
                <>
                  <span className="text-xs line-through" style={{ color: colors.textMuted }}>
                    {fmt(info.compare)}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: ORANGE }}>
                    {info.off}% off
                  </span>
                </>
              ) : null}
            </>
          ) : (
            <span style={{ color: colors.textMuted }}>Price unavailable</span>
          )}
        </div>
        {colours.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {colours.map((c) => (
              <span
                key={c}
                title={c}
                className="h-2.5 w-2.5 rounded-full border border-black/30"
                style={{ backgroundColor: c.toLowerCase() }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGrid({
  eyebrow,
  title,
  action,
  products,
  loading,
  count,
  isNew,
  id,
}: {
  eyebrow: string;
  title: string;
  action: { label: string; href: string };
  products: Product[];
  loading: boolean;
  count: number;
  isNew?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`${wrap} scroll-mt-28 py-12 sm:py-16`}>
      <SectionHeading eyebrow={eyebrow} title={title} action={action} />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, n) => (
              <div key={n} className="aspect-[4/5] animate-pulse" style={{ backgroundColor: GREY }} />
            ))
          : products.slice(0, count).map((p) => <ProductCard key={p.productId} product={p} isNew={isNew} />)}
      </div>
    </section>
  );
}

/* ----------------------------- Instagram ---------------------------- */

const INSTAGRAM_URL = "https://www.instagram.com/thehustler.merchandise/?hl=en";

const REELS = [
  { seed: "ig-1", caption: "Fit check: Fleece Hoodie" },
  { seed: "ig-2", caption: "Styling the Oversized Tee" },
  { seed: "ig-3", caption: "Inside the print studio" },
  { seed: "ig-4", caption: "Rooftop drop — AW26" },
];

function InstagramSection() {
  return (
    <section className={`${wrap} py-12 sm:py-16`}>
      <SectionHeading
        eyebrow="@thehustler.merchandise"
        title="Seen on Instagram"
        action={{ label: "View Instagram", href: INSTAGRAM_URL }}
      />
      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {REELS.map((r) => (
          <a
            key={r.seed}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[3/4] w-[62%] shrink-0 snap-start overflow-hidden sm:w-auto"
            style={{ backgroundColor: INK }}
          >
            <Img
              src={`https://picsum.photos/seed/hustler-${r.seed}/600/800`}
              alt={r.caption}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span
              className="absolute inset-x-0 bottom-0 p-3 text-[11px] font-semibold text-white"
              style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
            >
              {r.caption}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Testimonials --------------------------- */

const REVIEWS = [
  { id: "r1", author: "Aarav M.", city: "Mumbai", rating: 5, text: "Heavier than anything from the mall brands. The hoodie held up through a whole winter of daily wear and still looks new." },
  { id: "r2", author: "Simran K.", city: "Chandigarh", rating: 5, text: "Ordered custom prints for our team of 14. Proof came in a day, the print matched it exactly, delivered in under a week." },
  { id: "r3", author: "Rohan I.", city: "Bengaluru", rating: 4, text: "Great fabric. Sizing runs slightly large, so go one size down. Otherwise exactly as pictured." },
  { id: "r4", author: "Neha K.", city: "Pune", rating: 5, text: "The cap is well built: stiff brim, no loose threads. Feels like it costs twice as much." },
  { id: "r5", author: "Karthik R.", city: "Hyderabad", rating: 5, text: "Stitching is clean and the print hasn't cracked after a dozen washes." },
  { id: "r6", author: "Ishita B.", city: "Kolkata", rating: 4, text: "Shipping took a day longer than quoted, but support kept me updated all the way. Worth the wait." },
];

function Testimonials() {
  const colors = usePalette();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: d * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className={`${wrap} py-12 sm:py-16`}>
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>
            25,000+ hustlers
          </span>
          <h2 className="mt-1.5 font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl" style={{ color: colors.text }}>
            What they say
          </h2>
        </div>
        <div className="flex gap-2">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Previous reviews" : "Next reviews"}
              onClick={() => scroll(d)}
              className="flex h-9 w-9 items-center justify-center border text-sm transition hover:opacity-70"
              style={{ borderColor: colors.lineStrong, color: colors.text }}
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {REVIEWS.map((r) => (
          <figure
            key={r.id}
            className="flex w-[85%] shrink-0 snap-start flex-col justify-between border p-5 sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]"
            style={{ borderColor: colors.line }}
          >
            <div>
              <span className="font-display text-3xl leading-none" style={{ color: ORANGE }} aria-hidden>
                “
              </span>
              <div className="mt-1"><StarRating rating={r.rating} /></div>
              <blockquote className="mt-3 text-sm leading-relaxed" style={{ color: colors.text }}>
                {r.text}
              </blockquote>
            </div>
            <figcaption className="mt-5 text-xs">
              <span className="font-semibold" style={{ color: colors.text }}>{r.author}</span>
              <span style={{ color: colors.textMuted }}> · {r.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Newsletter --------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Newsletter() {
  const { toast } = useToast();
  const router = useRouter();
  const colors = usePalette();
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = email.trim();
    if (!v) return toast("Enter your email to join.", "error");
    if (!EMAIL_RE.test(v)) return toast("That email doesn't look right. Check it and try again.", "error");
    toast("You're in. Taking you to sign up…", "success");
    setTimeout(() => router.push(`/signup?email=${encodeURIComponent(v)}`), 800);
  }

  return (
    <section className="px-4 py-14 text-center sm:py-20" style={{ backgroundColor: colors.panel, color: colors.text }}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>
        Join the hustle
      </span>
      <h2 className="mx-auto mt-2 max-w-3xl font-display text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
        Get 10% off your first order
      </h2>
      <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>Early access to drops, exclusive offers and studio stories.</p>
      <form noValidate onSubmit={submit} className="mx-auto mt-6 flex w-full max-w-md border" style={{ borderColor: colors.lineStrong, backgroundColor: colors.bg }}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base focus:outline-none sm:text-sm"
          style={{ color: colors.text }}
        />
        <button type="submit" className="shrink-0 px-6 text-[11px] font-bold uppercase tracking-widest" style={{ backgroundColor: colors.text, color: colors.bg }}>
          Subscribe
        </button>
      </form>
    </section>
  );
}

/* ------------------------------- Footer ----------------------------- */

/* Replace these with your real profile links. */
const SOCIALS = [
  { label: "Instagram", href: INSTAGRAM_URL, path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5-2.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z" },
  { label: "YouTube", href: "https://www.youtube.com/", path: "M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8zm7 1.5v5l4.5-2.5L10 9.5z" },
  { label: "X (Twitter)", href: "https://x.com/", path: "M22 5.9c-.7.3-1.4.5-2.1.6a3.700 3.700 0 0 0 1.600-2 7.300 7.300 0 0 1-2.300.9 3.600 3.600 0 0 0-6.200 3.300A10.200 10.200 0 0 1 3.600 5a3.600 3.600 0 0 0 1.100 4.800 3.600 3.600 0 0 1-1.600-.4c0 1.700 1.200 3.200 2.900 3.600-.5.100-1 .2-1.600.1a3.600 3.600 0 0 0 3.400 2.500A7.300 7.300 0 0 1 2 17.100 10.300 10.300 0 0 0 7.600 18.700c6.700 0 10.400-5.600 10.400-10.400v-.5c.7-.5 1.300-1.200 2-1.900z" },
  { label: "Facebook", href: "https://www.facebook.com/", path: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z" },
];

function Footer() {
  const { status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";

  function trackOrder(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (status === "loading") return toast("Checking your session — try again in a moment.", "info");
    if (isAuthenticated) return router.push("/orders");
    toast("Please log in to track your order.", "info");
    setTimeout(() => router.push(`/login?redirect=${encodeURIComponent("/orders")}`), 900);
  }

  const cols: { title: string; links: { label: string; href: string; onClick?: typeof trackOrder }[] }[] = [
    {
      title: "Shop",
      links: [
        { label: "Shop All", href: "/products" },
        { label: "New Arrivals", href: "/#products" },
        { label: "Bestsellers", href: "/products" },
        { label: "T-Shirts", href: "/products?search=t-shirt" },
        { label: "Hoodies", href: "/products?search=hoodie" },
        { label: "Collections", href: "/categories" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "mailto:support@thehustlermerchandise.com" },
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Size Guide", href: "/size-guide" },
        { label: "My Account", href: "/account" },
        {
          label: "Track Orders",
          href: isAuthenticated ? "/orders" : `/login?redirect=${encodeURIComponent("/orders")}`,
          onClick: trackOrder,
        },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Returns & Exchanges", href: "/returns-exchanges" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-of-service" },
      ],
    },
  ];

  return (
    <footer style={{ backgroundColor: INK, color: "#fff" }}>
      <div className={`${wrap} pb-8 pt-12 sm:pt-16`}>
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-3 lg:col-span-1">
            <p className="font-display text-xl font-black uppercase tracking-[0.12em] sm:text-2xl">
              The Hustler Merchandise
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a3a3a3]">
              Premium streetwear essentials, designed in India. Wear ours or make it yours with our
              customisation studio.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((so) => (
                <a
                  key={so.label}
                  href={so.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={so.label}
                  className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/90 transition hover:border-white hover:bg-white hover:text-black"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                    <path d={so.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9a9a9a]">
                {c.title}
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} onClick={l.onClick} className="inline-block text-white transition hover:text-[#F26522]">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-[#9a9a9a] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Hustler Merchandise. All rights reserved.</p>
          <p>Made in India</p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------- Page ------------------------------ */

function HomeContent() {
  const { toast } = useToast();
  const colors = usePalette();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.json();
        const data: Product[] = Array.isArray(raw) ? raw : raw.data ?? [];
        if (!cancelled) setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        if (!cancelled) {
          setProducts([]);
          toast("Couldn't load products. Please refresh the page.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const best = [...products].sort(
    (a, b) => (b.rating ?? 0) * (b.reviewCount ?? 0) - (a.rating ?? 0) * (a.reviewCount ?? 0)
  );

  return (
    <div
      className="overflow-x-hidden"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <Hero />
      <FeaturedCategories />
      <ProductGrid
        id="products"
        eyebrow="Just dropped"
        title="New arrivals"
        action={{ label: "View all", href: "/products" }}
        products={products}
        loading={loading}
        count={8}
        isNew
      />
      <ProductGrid
        eyebrow="Most loved"
        title="Bestsellers"
        action={{ label: "View all", href: "/products" }}
        products={best}
        loading={loading}
        count={4}
      />
      <InstagramSection />
      <Testimonials />
      <Newsletter />
      <Footer />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
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