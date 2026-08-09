"use client";

/**
 * TheHustlerMerchandise — Home Page (v4 — shared theme)
 * -----------------------------------------------------------------------
 * Theme (dark/light + SIGNAL orange) now lives in
 * `src/context/ThemeContext.tsx` and is shared with every other page —
 * Header, Cart, Login, Signup, Products, Product Detail. `ThemeProvider`
 * is mounted once in `app/layout.tsx`, and `<ThemeToggle />` renders
 * globally from `Header`, so this page just consumes `useTheme()`.
 * -----------------------------------------------------------------------
 */

import { useRef, useState } from "react";
import { SIGNAL, hexToRgba, useTheme } from "@/src/context/ThemeContext";

/* -------------------------------------------------------------------- */
/*  Mock data                                                            */
/* -------------------------------------------------------------------- */

type Variant = { id: string; color: string; colorHex: string };
type Product = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  views: string;
  image: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  variants: Variant[];
};
type Category = { id: string; name: string; slug: string; tagline: string; productCount: number; image: string };
type Review = { id: string; author: string; rating: number; text: string; product: string; location: string; verified: boolean; avatarSeed: string };
type InstagramPost = { id: string; image: string; caption: string; likes: string };

const CATEGORIES: Category[] = [
  { id: "c1", name: "Hoodies", slug: "hoodies", tagline: "450 GSM heavyweight fleece", productCount: 18, image: "https://picsum.photos/seed/hustler-cat-hoodie/600/800" },
  { id: "c2", name: "Tees", slug: "tees", tagline: "220 GSM combed cotton", productCount: 24, image: "https://picsum.photos/seed/hustler-cat-tee/600/800" },
  { id: "c3", name: "Headwear", slug: "headwear", tagline: "Structured & unstructured caps", productCount: 11, image: "https://picsum.photos/seed/hustler-cat-cap/600/800" },
  { id: "c4", name: "Accessories", slug: "accessories", tagline: "Bags, pins, socks", productCount: 9, image: "https://picsum.photos/seed/hustler-cat-acc/600/800" },
];

const PRODUCTS: Product[] = [
  { id: "p1", name: "Graveyard Shift Hoodie", price: 2299, compareAtPrice: 2999, rating: 4.8, reviewCount: 212, views: "1.2k", image: "https://picsum.photos/seed/hustler-p1/700/875", isBestSeller: true, variants: [{ id: "v1", color: "Ink Black", colorHex: "#131210" }, { id: "v2", color: "Concrete", colorHex: "#8f887a" }] },
  { id: "p2", name: "No Days Off Tee", price: 899, compareAtPrice: 1199, rating: 4.6, reviewCount: 341, views: "3.4k", image: "https://picsum.photos/seed/hustler-p2/700/875", isBestSeller: true, variants: [{ id: "v1", color: "Ink Black", colorHex: "#131210" }, { id: "v2", color: "Paper White", colorHex: "#f3ede1" }, { id: "v3", color: "Signal Orange", colorHex: "#ff5a1f" }] },
  { id: "p3", name: "Site Foreman Cap", price: 799, rating: 4.7, reviewCount: 98, views: "980", image: "https://picsum.photos/seed/hustler-p3/700/875", isNew: true, variants: [{ id: "v1", color: "Ink Black", colorHex: "#131210" }] },
  { id: "p4", name: "Overtime Crewneck", price: 1799, compareAtPrice: 2199, rating: 4.5, reviewCount: 156, views: "1.6k", image: "https://picsum.photos/seed/hustler-p4/700/875", isNew: true, variants: [{ id: "v1", color: "Concrete", colorHex: "#8f887a" }, { id: "v2", color: "Ink Black", colorHex: "#131210" }] },
  { id: "p5", name: "Ledger Zip Hoodie", price: 2499, rating: 4.9, reviewCount: 87, views: "2.1k", image: "https://picsum.photos/seed/hustler-p5/700/875", variants: [{ id: "v1", color: "Ink Black", colorHex: "#131210" }] },
  { id: "p6", name: "Clock In Tee", price: 949, rating: 4.4, reviewCount: 64, views: "740", image: "https://picsum.photos/seed/hustler-p6/700/875", variants: [{ id: "v1", color: "Paper White", colorHex: "#f3ede1" }] },
];

const REVIEWS: Review[] = [
  { id: "r1", author: "Aarav Mehta", rating: 5, text: "Heavier than anything from the mall brands. The hoodie held up through an entire winter of daily wear and still looks new.", product: "Graveyard Shift Hoodie", location: "Mumbai, MH", verified: true, avatarSeed: "aarav" },
  { id: "r2", author: "Simran Kaur", rating: 5, text: "Ordered custom prints for our whole team of 14. Proof came in a day, print matched it exactly, delivered in under a week.", product: "Custom Merch", location: "Chandigarh, PB", verified: true, avatarSeed: "simran" },
  { id: "r3", author: "Rohan Iyer", rating: 4, text: "Great fabric, sizing runs slightly large — go one size down. Otherwise exactly as pictured.", product: "No Days Off Tee", location: "Bengaluru, KA", verified: true, avatarSeed: "rohan" },
  { id: "r4", author: "Neha Kulkarni", rating: 5, text: "The cap is genuinely well built — stiff brim, no loose threads. Feels like it costs twice as much.", product: "Site Foreman Cap", location: "Pune, MH", verified: true, avatarSeed: "neha" },
  { id: "r5", author: "Karthik Reddy", rating: 5, text: "Small batch really shows. Stitching is clean and the print hasn't cracked after a dozen washes.", product: "Overtime Crewneck", location: "Hyderabad, TS", verified: true, avatarSeed: "karthik" },
  { id: "r6", author: "Ishita Bose", rating: 4, text: "Shipping took a day longer than quoted, but support kept me updated the whole way. Product's worth the wait.", product: "Ledger Zip Hoodie", location: "Kolkata, WB", verified: true, avatarSeed: "ishita" },
];

const INSTAGRAM_POSTS: InstagramPost[] = [
  { id: "i1", image: "https://picsum.photos/seed/hustler-ig1/500/500", caption: "Drop 004 on feet", likes: "1.4k" },
  { id: "i2", image: "https://picsum.photos/seed/hustler-ig2/500/500", caption: "Print run, batch 12", likes: "980" },
  { id: "i3", image: "https://picsum.photos/seed/hustler-ig3/500/500", caption: "Team order — 40 pcs", likes: "2.1k" },
  { id: "i4", image: "https://picsum.photos/seed/hustler-ig4/500/500", caption: "Studio, 6am", likes: "760" },
];

/* -------------------------------------------------------------------- */
/*  Small shared bits                                                    */
/* -------------------------------------------------------------------- */

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className ?? ""} flex items-center justify-center`} style={{ backgroundColor: colors.panel }}>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: colors.textMuted }}>IMAGE UNAVAILABLE</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
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
        <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>{eyebrow}</span>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl" style={{ color: colors.text }}>{title}</h2>
      </div>
      {action && (
        <a href={action.href} className="hidden shrink-0 font-mono text-xs uppercase tracking-widest transition hover:opacity-100 sm:block" style={{ color: colors.textMuted }}>
          {action.label} →
        </a>
      )}
    </div>
  );
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const { theme } = useTheme();
  const emptyStroke = theme === "dark" ? "#5a5648" : "#c9c1af";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={filled ? SIGNAL : "none"} stroke={filled ? SIGNAL : emptyStroke} strokeWidth="1.5">
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
        );
      })}
    </div>
  );
}

function StampTag({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <span
      className="absolute left-3 top-3 z-10 -rotate-3 border px-2 py-1 font-mono text-[10px] font-bold tracking-widest"
      style={{ borderColor: colors.text, color: colors.text }}
    >
      {children}
    </span>
  );
}

/** Diagonal hazard-stripe rule — the recurring "work site" motif */
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
  const items = ["NO DAYS OFF", "SELF MADE", "GRIND MODE: ON", "BUILT NOT GIVEN", "EAT THE COMPETITION", "24 / 7 MINDSET"];
  const loop = [...items, ...items];
  return (
    <div>
      <HazardRule />
      <div className="relative overflow-hidden py-3" style={{ backgroundColor: colors.panel }}>
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap">
          {loop.map((item, i) => (
            <span key={i} className="flex items-center gap-10 font-mono text-xs tracking-[0.25em]" style={{ color: colors.textMuted }}>
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
/*  Hero — signature: a "work order" ticket stamped over the image       */
/* -------------------------------------------------------------------- */

function Hero() {
  const { colors } = useTheme();
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="animate-[fade-up_0.7s_ease-out_both] lg:col-span-7">
          <span className="inline-flex items-center gap-2 border px-3 py-1 font-mono text-[11px] tracking-widest" style={{ borderColor: SIGNAL, color: SIGNAL }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SIGNAL }} />
            DROP 004 · LIVE NOW
          </span>
          <h1 className="mt-6 font-display text-[15vw] uppercase leading-[0.85] tracking-tight sm:text-7xl lg:text-8xl" style={{ color: colors.text }}>
            Wear the
            <br />
            Grind<span style={{ color: SIGNAL }}>.</span>
          </h1>
          <p className="mt-6 max-w-md text-base" style={{ color: colors.textMuted }}>
            Streetwear for people who clock out and keep working. Heavyweight cotton, graphics
            earned the hard way, and custom merch for the teams building alongside you.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#products" className="px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
              Shop the drop
            </a>
            <a href="#custom" className="border px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition" style={{ borderColor: colors.lineStrong, color: colors.text }}>
              Start customizing
            </a>
          </div>
        </div>

        <div className="relative animate-[fade-up_0.9s_ease-out_0.15s_both] lg:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden border" style={{ borderColor: colors.line }}>
            <Img src="https://picsum.photos/seed/hustler-hero/900/1100" alt="TheHustlerMerchandise latest drop" className="h-full w-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to top, ${colors.bg}, transparent)` }} />
          </div>
          {/* Signature "work order" ticket — always paper-on-ink regardless of theme, it's a physical ticket motif */}
          <div className="absolute -bottom-6 -left-6 w-48 -rotate-3 border p-3 font-mono shadow-xl sm:-left-10 sm:w-56" style={{ borderColor: "#131210", backgroundColor: "#f3ede1" }}>
            <p className="text-[9px] tracking-widest text-[#131210]/50">WORK ORDER NO. 0004</p>
            <p className="mt-1 text-lg font-bold leading-none text-[#131210]">35% OFF</p>
            <p className="mt-1 text-[9px] tracking-widest text-[#131210]/50">AUTHORIZED · LIMITED RUN</p>
          </div>
          <div className="absolute -right-3 top-6 rotate-2 border px-3 py-2 font-mono text-[10px] tracking-widest backdrop-blur" style={{ borderColor: colors.lineStrong, backgroundColor: hexToRgba(colors.bg, 0.8), color: colors.text }}>
            25,000+ HUSTLERS
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Featured Categories                                                  */
/* -------------------------------------------------------------------- */

function FeaturedCategories() {
  const { colors } = useTheme();
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading eyebrow="Collections" title="Shop by category" action={{ label: "View all", href: "#" }} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <a key={cat.id} href={`#${cat.slug}`} className="group relative block aspect-[3/4] overflow-hidden border" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
            <Img src={cat.image} alt={cat.name} className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to top, ${colors.bg}, ${hexToRgba(colors.bg, 0.1)}, transparent)` }} />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="font-display text-xl uppercase tracking-tight" style={{ color: colors.text }}>{cat.name}</p>
              <p className="mt-1 max-w-[85%] font-mono text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{cat.tagline}</p>
              <p className="mt-2 font-mono text-[11px]" style={{ color: SIGNAL }}>{cat.productCount} styles</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Product card (local — this page's mock data, not src/components)     */
/* -------------------------------------------------------------------- */

function ProductCard({ product }: { product: Product }) {
  const { colors } = useTheme();
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden border" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
        {product.isBestSeller && <StampTag>Bestseller</StampTag>}
        {product.isNew && !product.isBestSeller && <StampTag>New</StampTag>}
        <Img src={product.image} alt={product.name} className="h-full w-full object-cover grayscale transition duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0" />
        <button
          className="absolute inset-x-3 bottom-3 translate-y-3 py-2 text-center font-mono text-xs font-bold uppercase tracking-widest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          style={{ backgroundColor: colors.text, color: colors.bg }}
        >
          Quick add
        </button>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-medium leading-snug" style={{ color: colors.text }}>{product.name}</h3>

        <div className="mt-1 flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="font-mono text-[10px]" style={{ color: colors.textMuted }}>({product.reviewCount})</span>
        </div>

        <div className="mt-1 flex items-center gap-2 font-mono text-sm">
          <span style={{ color: SIGNAL }}>₹{product.price.toLocaleString("en-IN")}</span>
          {product.compareAtPrice && <span className="line-through" style={{ color: colors.textMuted }}>₹{product.compareAtPrice.toLocaleString("en-IN")}</span>}
        </div>
      </div>
    </div>
  );
}

function FeaturedProducts() {
  return (
    <section id="products" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <SectionHeading eyebrow="Drop 004" title="Featured products" action={{ label: "Shop all", href: "/products" }} />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {PRODUCTS.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Custom Merchandise                                                   */
/* -------------------------------------------------------------------- */

function CustomMerch() {
  const { colors } = useTheme();
  const steps = [
    { n: "01", title: "Upload your design", desc: "Logo, artwork, or just an idea — send us what you've got." },
    { n: "02", title: "Approve the mockup", desc: "We send a proof before anything goes to print. No surprises." },
    { n: "03", title: "We print & ship", desc: "Small-batch production, PAN India delivery in 5–7 days." },
  ];

  return (
    <section id="custom" className="py-16 sm:py-20" style={{ backgroundColor: colors.panel }}>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden border" style={{ borderColor: colors.line }}>
            <Img src="https://picsum.photos/seed/hustler-custom/900/1100" alt="Custom printed merchandise" className="h-full w-full object-cover grayscale" />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to top, ${hexToRgba(colors.bg, 0.8)}, transparent)` }} />
            <div className="absolute bottom-5 left-5 border px-4 py-2 font-mono text-xs font-bold tracking-widest" style={{ borderColor: "#131210", backgroundColor: SIGNAL, color: "#131210" }}>
              MOQ: JUST 2 PIECES
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Print on demand</span>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl" style={{ color: colors.text }}>
            Your logo.
            <br />
            Your crew.
            <br />
            Our print.
          </h2>
          <p className="mt-5 max-w-lg" style={{ color: colors.textMuted }}>
            Building a team, a brand, or a side hustle? Get your logo or artwork printed on
            hoodies, tees, and caps with the same heavyweight materials as our main drops — no
            minimum order stress, no compromise on quality.
          </p>

          <div className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-4 border-t pt-4 first:border-t-0 first:pt-0" style={{ borderColor: i === 0 ? "transparent" : colors.line }}>
                <span className="font-display text-2xl" style={{ color: SIGNAL }}>{s.n}</span>
                <div>
                  <p className="font-medium" style={{ color: colors.text }}>{s.title}</p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="#" className="mt-8 inline-block px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
            Start customizing
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Best Products (horizontal scroll)                                    */
/* -------------------------------------------------------------------- */

function BestProducts() {
  const { colors } = useTheme();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  const sorted = [...PRODUCTS].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between gap-4 border-b pb-5" style={{ borderColor: colors.line }}>
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Top rated</span>
          <h2 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl" style={{ color: colors.text }}>Best products</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button aria-label="Scroll left" onClick={() => scroll(-1)} className="h-9 w-9 border transition" style={{ borderColor: colors.lineStrong, color: colors.textMuted }}>←</button>
          <button aria-label="Scroll right" onClick={() => scroll(1)} className="h-9 w-9 border transition" style={{ borderColor: colors.lineStrong, color: colors.textMuted }}>→</button>
        </div>
      </div>

      <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sorted.map((p) => (
          <div key={p.id} className="relative w-[210px] shrink-0 snap-start sm:w-[240px]">
            <div className="relative aspect-[3/4] overflow-hidden border" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
              <span className="absolute left-2 top-2 z-10 flex items-center gap-1 px-2 py-1 font-mono text-[10px] backdrop-blur" style={{ backgroundColor: hexToRgba(colors.bg, 0.6), color: colors.textMuted }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                {p.views}
              </span>
              <Img src={p.image} alt={p.name} className="h-full w-full object-cover grayscale transition duration-500 hover:scale-105 hover:grayscale-0" />
            </div>
            <p className="mt-2 truncate text-xs" style={{ color: colors.text, opacity: 0.85 }}>{p.name}</p>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs">
              <span style={{ color: SIGNAL }}>₹{p.price.toLocaleString("en-IN")}</span>
              {p.compareAtPrice && <span className="line-through" style={{ color: colors.textMuted }}>₹{p.compareAtPrice.toLocaleString("en-IN")}</span>}
            </div>
            <div className="mt-1"><StarRating rating={p.rating} size={12} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Brand Story                                                          */
/* -------------------------------------------------------------------- */

function BrandStory() {
  const { colors } = useTheme();
  return (
    <section id="story" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden border" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
            <Img src="https://picsum.photos/seed/hustler-founder/800/1000" alt="Founder of TheHustlerMerchandise" className="h-full w-full object-cover grayscale" />
          </div>
        </div>
        <div className="flex flex-col justify-center lg:col-span-7">
          <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Our story</span>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl" style={{ color: colors.text }}>
            Made for the ones
            <br />
            who don&apos;t clock out
          </h2>
          <p className="mt-6 max-w-xl" style={{ color: colors.textMuted }}>
            TheHustlerMerchandise started as a side hustle between late shifts and early
            mornings — printed one hoodie at a time for a crew that refused to settle. Every
            piece we drop is still designed the same way: heavyweight fabric, graphics that mean
            something, and small-batch runs so nothing feels mass-produced.
          </p>
          <p className="mt-4 max-w-xl" style={{ color: colors.textMuted }}>
            Today that same crew mentality runs the custom merch side of the business — printing
            for founders, creators, and teams who want gear that actually looks like it belongs
            on a shelf, not a stockroom.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 border-t pt-6" style={{ borderColor: colors.line }}>
            <div>
              <p className="font-display text-3xl" style={{ color: SIGNAL }}>40K+</p>
              <p className="font-mono text-[10px] tracking-widest" style={{ color: colors.textMuted }}>Pieces shipped</p>
            </div>
            <div>
              <p className="font-display text-3xl" style={{ color: SIGNAL }}>4.8/5</p>
              <p className="font-mono text-[10px] tracking-widest" style={{ color: colors.textMuted }}>Avg. rating</p>
            </div>
            <div>
              <p className="font-display text-3xl" style={{ color: SIGNAL }}>100%</p>
              <p className="font-mono text-[10px] tracking-widest" style={{ color: colors.textMuted }}>Small-batch</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Reviews                                                               */
/* -------------------------------------------------------------------- */

function ReviewCard({ review }: { review: Review }) {
  const { colors } = useTheme();
  return (
    <div className="flex h-full flex-col justify-between border p-5" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
      <div>
        <StarRating rating={review.rating} />
        <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.textMuted }}>&ldquo;{review.text}&rdquo;</p>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: colors.line }}>
        <Img src={`https://picsum.photos/seed/${review.avatarSeed}/80/80`} alt={review.author} className="h-9 w-9 rounded-full object-cover grayscale" />
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium" style={{ color: colors.text }}>{review.author}</p>
            {review.verified && <span className="font-mono text-[9px]" style={{ color: SIGNAL }}>✓ Verified</span>}
          </div>
          <p className="font-mono text-[10px]" style={{ color: colors.textMuted }}>
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
    <section className="py-16 sm:py-20" style={{ backgroundColor: hexToRgba(colors.panel, 0.4) }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="25,000+ hustlers" title="What they're saying" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Instagram                                                            */
/* -------------------------------------------------------------------- */

function InstagramSection() {
  const { colors } = useTheme();
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="mb-8 text-center">
        <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Follow along</span>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl" style={{ color: colors.text }}>@thehustlermerchandise</h2>
        <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>Tag us to get featured on the grid.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {INSTAGRAM_POSTS.map((post) => (
          <a key={post.id} href="#" className="group relative block aspect-square overflow-hidden border" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
            <Img src={post.image} alt={post.caption} className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 transition duration-300 group-hover:opacity-100" style={{ backgroundColor: hexToRgba(colors.bg, 0.7) }}>
              <span className="flex items-center gap-1 font-mono text-xs font-bold" style={{ color: colors.text }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={SIGNAL} stroke={SIGNAL}><path d="M12 20s-7-4.4-9.5-8.8C.8 7.8 2.4 4.5 5.8 4c2-.3 3.7.7 4.9 2.3C11.9 4.7 13.6 3.7 15.6 4c3.4.5 5 3.8 3.3 7.2C17.4 15.6 12 20 12 20z" /></svg>
                {post.likes}
              </span>
              <span className="px-3 text-center font-mono text-[10px]" style={{ color: colors.textMuted }}>{post.caption}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Footer                                                                */
/* -------------------------------------------------------------------- */

function Footer() {
  const { colors } = useTheme();
  return (
    <footer className="border-t" style={{ borderColor: colors.line }}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl uppercase tracking-tight" style={{ color: colors.text }}>
              The Hustler<span style={{ color: SIGNAL }}>.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm" style={{ color: colors.textMuted }}>
              Streetwear for the self-made. Designed and printed in-house, shipped across India.
            </p>
            <form className="mt-6 flex max-w-xs border" style={{ borderColor: colors.lineStrong }} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="w-full bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                style={{ color: colors.text }}
              />
              <button type="submit" className="shrink-0 whitespace-nowrap px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
                Join
              </button>
            </form>
            <div className="mt-6 flex gap-4" style={{ color: colors.textMuted }}>
              {["Instagram", "X", "YouTube"].map((s) => (
                <a key={s} href="#" className="font-mono text-[11px] tracking-widest transition hover:opacity-80">{s}</a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-widest" style={{ color: colors.textMuted }}>Shop</p>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: colors.textMuted }}>
              <li><a href="#products" className="transition hover:opacity-80" style={{ color: colors.text }}>Featured Products</a></li>
              <li><a href="#categories" className="transition hover:opacity-80" style={{ color: colors.text }}>Collections</a></li>
              <li><a href="#custom" className="transition hover:opacity-80" style={{ color: colors.text }}>Custom Merch</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Gift Cards</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-widest" style={{ color: colors.textMuted }}>Support</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Track Order</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Size Guide</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>FAQs</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Contact Us</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-widest" style={{ color: colors.textMuted }}>Policies</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Shipping Policy</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Returns & Exchanges</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Privacy Policy</a></li>
              <li><a href="#" className="transition hover:opacity-80" style={{ color: colors.text }}>Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: colors.line, color: colors.textMuted }}>
          <p>© {new Date().getFullYear()} TheHustlerMerchandise. All rights reserved.</p>
          <p className="font-mono text-[10px] tracking-widest">Made in India</p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- */
/*  Page                                                                  */
/* -------------------------------------------------------------------- */

export default function Home() {
  return (
    <div>
      <Hero />
      <Ticker />
      <FeaturedCategories />
      <FeaturedProducts />
      <CustomMerch />
      <BestProducts />
      <BrandStory />
      <Reviews />
      <InstagramSection />
      <Footer />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}