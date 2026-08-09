/**
 * Product data layer
 * -----------------------------------------------------------------------
 * Shapes mirror the Prisma schema:
 *
 *   model Product { productId, categoryId, productName, description,
 *                   productImage, rating, reviewCount, ... }
 *   model ProductVariant { variantId, productId, colour, size, price }
 *
 * Three fields below (`images` on Product, `compareAtPrice` on Product,
 * `reviews` on Product) are UI-only additions not yet in the schema —
 * gallery photos, a "was" price for the strike-through discount, and a
 * sample of written reviews. Add them as real columns/relations
 * (a ProductImage relation for `images`, a Review model with a FK to
 * Product for `reviews`) when you wire this up to Prisma; everything
 * else maps 1:1.
 *
 * To go live: replace the MOCK_* arrays and the getters below with
 * `prisma.product.findMany({ include: { variants: true, reviews: true } })`
 * calls — the component layer only talks to these getter functions, so
 * nothing else needs to change.
 * -----------------------------------------------------------------------
 */

export type Category = {
  categoryId: string;
  name: string;
  slug: string;
};

export type ProductVariant = {
  variantId: string;
  productId: string;
  colour: string | null;
  size: string | null;
  price: number;
};

export type Review = {
  reviewId: string;
  productId: string;
  authorName: string;
  rating: number; // 1-5
  date: string; // display date, e.g. "14 Jun 2025"
  title: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  size?: string;
  colour?: string;
};

export type Product = {
  productId: string;
  categoryId: string | null;
  productName: string;
  description: string | null;
  productImage: string | null;
  images: string[]; // gallery — first entry falls back to productImage
  highlights: string[]; // short spec badges, e.g. "100% Pure Cotton"
  compareAtPrice: number | null; // pre-discount reference price, if any
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  reviews: Review[]; // sample of written reviews for this product
};

/* -------------------------------------------------------------------- */
/*  Categories                                                           */
/* -------------------------------------------------------------------- */

export const MOCK_CATEGORIES: Category[] = [
  { categoryId: "cat-1", name: "Customised Tshirts", slug: "customised-tshirts" },
  { categoryId: "cat-2", name: "Dotnet Collar Tshirts", slug: "dotnet-collar-tshirts" },
  { categoryId: "cat-3", name: "Spun Dryfit Tshirts", slug: "spun-dryfit-tshirts" },
  { categoryId: "cat-4", name: "Polycotton Tshirts", slug: "polycotton-tshirts" },
  { categoryId: "cat-5", name: "Pure Cotton Tshirts", slug: "pure-cotton-tshirts" },
  { categoryId: "cat-6", name: "Caps and Mugs", slug: "caps-and-mugs" },
];

/* -------------------------------------------------------------------- */
/*  Products + variants                                                  */
/* -------------------------------------------------------------------- */

const COLOURS: { name: string; hex: string }[] = [
  { name: "Ink Black", hex: "#131210" },
  { name: "Signal Orange", hex: "#ff5a1f" },
  { name: "Concrete Grey", hex: "#8f887a" },
  { name: "Paper White", hex: "#f3ede1" },
  { name: "Maroon", hex: "#7a1f2b" },
  { name: "Navy", hex: "#1f2a44" },
  { name: "Military Green", hex: "#3f4a2f" },
  { name: "Mustard", hex: "#d9a441" },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

function makeVariants(productId: string, basePrice: number, colourCount: number, sizes: string[]): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (let c = 0; c < colourCount; c++) {
    for (const size of sizes) {
      variants.push({
        variantId: `${productId}-${COLOURS[c].name}-${size}`.replace(/\s+/g, ""),
        productId,
        colour: COLOURS[c].name,
        size,
        price: basePrice,
      });
    }
  }
  return variants;
}

/* -------------------------------------------------------------------- */
/*  Review generation                                                    */
/*  Deterministic (seeded from productId, fixed anchor date) so server-  */
/*  and client-rendered output match exactly — no hydration mismatches.  */
/* -------------------------------------------------------------------- */

const REVIEW_AUTHORS = [
  "Arjun Mehta", "Priya Nair", "Rohan Sharma", "Sneha Kulkarni", "Vikram Rao",
  "Ananya Iyer", "Karthik Reddy", "Divya Menon", "Aditya Bansal", "Neha Kapoor",
  "Suresh Pillai", "Ritika Joshi", "Manoj Verma", "Pooja Desai", "Farhan Khan",
  "Ishita Gupta", "Nikhil Shetty", "Kavya Krishnan", "Abhishek Singh", "Meera Pillai",
  "Rahul Chawla", "Tanvi Agarwal", "Yash Malhotra", "Shreya Bhat",
];

type ReviewTemplate = { title: string; body: string };

const REVIEW_TEMPLATES: Record<number, ReviewTemplate[]> = {
  5: [
    { title: "Exceeded expectations", body: "Print quality is sharp and hasn't faded after multiple washes. Packaging was neat and delivery was faster than the estimate." },
    { title: "Perfect for our team order", body: "Ordered in bulk for a company event and every piece came out consistent in size and colour. Will order again." },
    { title: "Great quality for the price", body: "Was skeptical about ordering custom merch online but the finish feels premium. Support also helped tweak the design before printing." },
    { title: "Loved it", body: "Fit is exactly as expected and the fabric feels durable. The design proof they sent before printing really helped avoid mistakes." },
  ],
  4: [
    { title: "Good quality, minor delay", body: "Print and fabric quality are solid. Delivery took a couple of days longer than promised, but the end product made up for it." },
    { title: "Nice product overall", body: "Colour came out slightly different from the preview but still looks good. Would recommend for bulk orders." },
    { title: "Satisfied with the purchase", body: "Comfortable fit and the print hasn't cracked after a few washes. Packaging could be a bit sturdier though." },
  ],
  3: [
    { title: "Decent, but room for improvement", body: "Quality is average for the price. Sizing ran slightly larger than the chart suggested, so double check before ordering." },
    { title: "It's okay", body: "Print quality is fine but not as vibrant as shown in the photos. Delivery was on time though." },
  ],
  2: [
    { title: "Not quite what I expected", body: "Fabric feels thinner than expected and the print started peeling after a few washes. Support was responsive when I raised the issue." },
    { title: "Sizing issues", body: "Ordered based on the size chart but the fit was off for most of the team. Had to get a few pieces exchanged." },
  ],
  1: [
    { title: "Disappointed with this order", body: "The print quality didn't match the design proof and it took a while to get a resolution from support." },
  ],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function seedFromString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Weight of [5★, 4★, 3★, 2★, 1★] given a product's average rating. */
function ratingWeights(avg: number): number[] {
  if (avg >= 4.5) return [0.72, 0.19, 0.06, 0.02, 0.01];
  if (avg >= 4.0) return [0.55, 0.28, 0.1, 0.04, 0.03];
  if (avg >= 3.5) return [0.4, 0.3, 0.16, 0.08, 0.06];
  return [0.3, 0.25, 0.2, 0.15, 0.1];
}

function sampleRatingFromWeights(weights: number[], rng: () => number): number {
  const r = rng();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) return 5 - i; // weights are ordered 5,4,3,2,1
  }
  return 5;
}

/** Amazon-style breakdown bars — derived from rating + reviewCount, not the sample reviews. */
export function getRatingBreakdown(p: Product): { star: number; percent: number; count: number }[] {
  const weights = ratingWeights(p.rating);
  return [5, 4, 3, 2, 1].map((star, i) => ({
    star,
    percent: Math.round(weights[i] * 100),
    count: Math.round(weights[i] * p.reviewCount),
  }));
}

function makeReviews(productId: string, rating: number, colourNames: string[], sizes: string[]): Review[] {
  const rng = mulberry32(seedFromString(productId));
  const weights = ratingWeights(rating);
  const anchor = new Date(2025, 11, 20).getTime(); // fixed anchor, not Date.now()
  const items: { review: Review; ts: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const starRating = sampleRatingFromWeights(weights, rng);
    const template = pick(REVIEW_TEMPLATES[starRating], rng);
    const daysAgo = Math.floor(rng() * 300) + 3;
    const ts = anchor - daysAgo * 86400000;
    const d = new Date(ts);

    items.push({
      ts,
      review: {
        reviewId: `${productId}-rev-${i + 1}`,
        productId,
        authorName: pick(REVIEW_AUTHORS, rng),
        rating: starRating,
        date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        title: template.title,
        body: template.body,
        verifiedPurchase: rng() < 0.85,
        helpfulCount: Math.floor(rng() * 35),
        size: sizes.length > 1 ? pick(sizes, rng) : undefined,
        colour: colourNames.length > 0 ? pick(colourNames, rng) : undefined,
      },
    });
  }

  return items.sort((a, b) => b.ts - a.ts).map((x) => x.review); // newest first
}

function product(
  id: string,
  categoryId: string,
  name: string,
  seed: string,
  basePrice: number,
  compareAt: number | null,
  rating: number,
  reviewCount: number,
  colourCount: number,
  highlights: string[],
  description: string,
  sizes: string[] = SIZES
): Product {
  const colourNames = COLOURS.slice(0, colourCount).map((c) => c.name);
  return {
    productId: id,
    categoryId,
    productName: name,
    description,
    productImage: `https://picsum.photos/seed/${seed}/700/875`,
    images: [
      `https://picsum.photos/seed/${seed}/700/875`,
      `https://picsum.photos/seed/${seed}-b/700/875`,
      `https://picsum.photos/seed/${seed}-c/700/875`,
      `https://picsum.photos/seed/${seed}-d/700/875`,
    ],
    highlights,
    compareAtPrice: compareAt,
    rating,
    reviewCount,
    variants: makeVariants(id, basePrice, colourCount, sizes),
    reviews: makeReviews(id, rating, colourNames, sizes),
  };
}

export const MOCK_PRODUCTS: Product[] = [
  product("p-ct-1", "cat-1", "Customised Crew Tee With Your Logo", "hustler-ct1", 499, 699, 4.6, 873,
    5, ["180 GSM Cotton", "DTF Printing", "Soft & Breathable"],
    "Everyday crew-neck tee, ready for your logo or artwork. Small-batch printed, true-to-size fit."),
  product("p-ct-2", "cat-1", "Customised Oversized Tee", "hustler-ct2", 599, 799, 4.5, 412,
    4, ["220 GSM Cotton", "Oversized Fit", "Screen Printing"],
    "Boxy, dropped-shoulder tee built for statement graphics and team drops."),

  product("p-dc-1", "cat-2", "Dotnet Collar Polo Tee", "hustler-dc1", 899, 1199, 4.4, 301,
    6, ["Dotnet Knit Collar", "Ribbed Cuffs", "Wrinkle Resistant"],
    "A textured dotnet collar gives this polo a sharper finish than standard pique — built for corporate and team orders."),
  product("p-dc-2", "cat-2", "Dotnet Collar Half Sleeve Tee", "hustler-dc2", 849, 1099, 4.3, 156,
    5, ["Dotnet Knit Collar", "Breathable Weave"],
    "Half-sleeve dotnet collar tee, a lighter build for daily corporate wear."),

  product("p-sd-1", "cat-3", "Spun Dryfit Performance Tee", "hustler-sd1", 649, 899, 4.7, 528,
    6, ["Moisture Wicking", "4-Way Stretch", "Quick Dry"],
    "Spun-yarn dryfit fabric that breathes through long shifts and hard training — holds shape wash after wash."),
  product("p-sd-2", "cat-3", "Spun Dryfit Polo", "hustler-sd2", 799, 999, 4.5, 219,
    5, ["Moisture Wicking", "Anti-Odour Finish"],
    "Dryfit polo built for team sportswear and corporate activewear kits."),

  product("p-pc-1", "cat-4", "Polycotton Everyday Tee", "hustler-pc1", 449, 599, 4.3, 640,
    6, ["65/35 Poly-Cotton", "Shrink Resistant", "Budget Friendly"],
    "A durable poly-cotton blend that holds print detail exceptionally well — our most ordered bulk tee."),
  product("p-pc-2", "cat-4", "Polycotton Round Neck", "hustler-pc2", 429, 549, 4.2, 388,
    5, ["65/35 Poly-Cotton", "Colourfast Dye"],
    "Reliable round-neck staple for large team and event orders."),

  product("p-pu-1", "cat-5", "100% Pure Cotton Polo", "hustler-pu1", 1799, 1990, 4.6, 233,
    6, ["100% Pure Cotton", "250–260 GSM", "DTF Printing", "Soft & Breathable"],
    "Premium pure-cotton polo with a soft brushed hand-feel — our flagship corporate gifting piece."),
  product("p-pu-2", "cat-5", "Pure Cotton Crew Tee", "hustler-pu2", 999, 1299, 4.7, 512,
    6, ["100% Pure Cotton", "220 GSM", "Pre-Shrunk"],
    "Heavyweight pure-cotton tee built the way our original drops are — dense knit, clean print surface."),

  product("p-cm-1", "cat-6", "Customised Corporate Cap", "hustler-cm1", 300, 690, 4.5, 415,
    3, ["Adjustable Strap", "Double-Stitched", "Comfortable Wear"],
    "Structured six-panel cap with your logo embroidered or printed front and center.",
    ["One Size"]),
  product("p-cm-2", "cat-6", "Customised Ceramic Mug", "hustler-cm2", 249, 399, 4.6, 289,
    2, ["11oz Ceramic", "Dishwasher Safe", "Full-Wrap Print"],
    "Full-wrap printed ceramic mug — a fast, low-MOQ gifting option for teams and events.",
    ["One Size"]),
];

/* -------------------------------------------------------------------- */
/*  Getters (swap internals for Prisma calls later)                      */
/* -------------------------------------------------------------------- */

export function getCategories(): Category[] {
  return MOCK_CATEGORIES;
}

export function getProducts(categorySlug?: string): Product[] {
  if (!categorySlug || categorySlug === "all") return MOCK_PRODUCTS;
  const cat = MOCK_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return [];
  return MOCK_PRODUCTS.filter((p) => p.categoryId === cat.categoryId);
}

export function getProductById(productId: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.productId === productId);
}

export function getCategoryById(categoryId: string | null): Category | undefined {
  return MOCK_CATEGORIES.find((c) => c.categoryId === categoryId);
}

/** Distinct colours available on a product, in variant order. */
export function getProductColours(p: Product): { name: string; hex: string }[] {
  const seen = new Set<string>();
  const result: { name: string; hex: string }[] = [];
  for (const v of p.variants) {
    if (v.colour && !seen.has(v.colour)) {
      seen.add(v.colour);
      const match = COLOURS.find((c) => c.name === v.colour);
      result.push({ name: v.colour, hex: match?.hex ?? "#8f887a" });
    }
  }
  return result;
}

/** Distinct sizes available on a product. */
export function getProductSizes(p: Product): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of p.variants) {
    if (v.size && !seen.has(v.size)) {
      seen.add(v.size);
      result.push(v.size);
    }
  }
  return result;
}

/** Lowest variant price on a product — used for "From ₹X" on cards. */
export function getFromPrice(p: Product): number {
  return Math.min(...p.variants.map((v) => v.price));
}

export function findVariant(p: Product, colour: string, size: string): ProductVariant | undefined {
  return p.variants.find((v) => v.colour === colour && v.size === size);
}

/** Written reviews for a product, newest first. */
export function getProductReviews(productId: string): Review[] {
  return getProductById(productId)?.reviews ?? [];
}