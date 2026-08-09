"use client";

/**
 * Global cart state. Wrap the app with <CartProvider> in app/layout.tsx
 * and call useCart() from any client component (Header for the badge,
 * ProductDetail to add items, /cart to list them).
 *
 * Persists to localStorage so the cart survives a refresh. Swap the
 * localStorage read/write for a real cart API / DB write later — the
 * addToCart/removeFromCart signatures won't need to change.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  cartItemId: string;
  productId: string;
  productName: string;
  image: string; // fallback product image
  frontImage: string | null; // customer-uploaded front design (data URL)
  backImage: string | null; // customer-uploaded back design (data URL)
  colour: string;
  sizeBreakdown: Record<string, number>; // size -> qty ("One Size" for products without sizes)
  totalQuantity: number;
  unitPrice: number;
  customText: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "hustler-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once, on mount (client only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change, after the initial load has happened
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable — fail silently, cart still works in-session
    }
  }, [items, hydrated]);

  function addToCart(item: Omit<CartItem, "cartItemId">) {
    const cartItemId = `${item.productId}-${item.colour}-${Date.now()}`;
    setItems((prev) => [...prev, { ...item, cartItemId }]);
  }

  function removeFromCart(cartItemId: string) {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, i) => sum + i.totalQuantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.totalQuantity * i.unitPrice, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, itemCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart() must be called inside <CartProvider>");
  return ctx;
}