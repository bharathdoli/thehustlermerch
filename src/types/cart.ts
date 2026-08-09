export type Item = {
  itemId: string;
  userId?: string;
  variantId: string;
  customizationLogoFront?: string;
  customizationLogoBack?: string;
  unitPrice: number;
  quantity: number;
  createdAt: string;
};

export type Cart = {
  cartId: string;
  userId?: string;
  sessionId?: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Frontend-only resolved shape returned by cartService.
 * Follows Cart -> Item -> ProductVariant -> Product exactly as the
 * schema models it, just pre-joined for display.
 */
export type ResolvedCartItem = {
  item: Item;
  variant: {
    variantId: string;
    colour?: string;
    size?: string;
    price: number;
  };
  product: {
    productId: string;
    productName: string;
    productImage?: string;
  };
  lineTotal: number;
};

export type ResolvedCart = {
  cartId: string;
  items: ResolvedCartItem[];
  subtotal: number;
  shipping: number;
  total: number;
};