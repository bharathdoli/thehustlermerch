export type Category = {
  categoryId: string;
  categoryName: string;
  description?: string;
  imageUrl?: string;
};

export type Product = {
  productId: string;
  categoryId?: string;
  productName: string;
  description?: string;
  productImage?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  /**
   * Whether this product supports front/back logo customization.
   * Not a DB column on Product in the schema — this is a frontend-only
   * derived flag used to conditionally render the customization UI.
   * In Phase 2 this can be inferred from category or a real backend flag.
   */
  customizable?: boolean;
};

export type ProductVariant = {
  variantId: string;
  productId: string;
  colour?: string;
  size?: string;
  price: number;
};

/**
 * Frontend-only derived shape. Never stored — computed by productService
 * when resolving a Product with its variants, the same way a real API
 * would compute MIN(price) via a join/aggregate query.
 */
export type ResolvedProduct = Product & {
  variants: ProductVariant[];
  startingPrice: number;
  availableColours: string[];
  availableSizes: string[];
};