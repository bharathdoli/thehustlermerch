"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export type BackendCartItem = {
  itemId: string;
  quantity: number;
  unitPrice: number | string;
  customizationLogoFront?: string | null;
  customizationLogoBack?: string | null;

  variant: {
    variantId?: string;
    colour?: string | null;
    size?: string | null;

    product: {
      productId?: string;
      productName: string;
      productImage?: string | null;
    };
  };
};

export type BackendCart = {
  cartId: string | null;
  items: BackendCartItem[];
  subtotal: number;
};

type CartContextValue = {
  items: BackendCartItem[];
  cartId: string | null;
  cartTotal: number;
  itemCount: number;
  loading: boolean;
  error: string | null;

  refreshCart: () => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { status } = useSession();

  const [cart, setCart] = useState<BackendCart>({
    cartId: null,
    items: [],
    subtotal: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Reset cart completely.
   * Used when the user is logged out.
   */
  function resetCart() {
    setCart({
      cartId: null,
      items: [],
      subtotal: 0,
    });

    setError(null);
  }

  /**
   * Load the logged-in user's cart.
   *
   * IMPORTANT:
   * Never call /api/cart when the user is not authenticated.
   */
  async function refreshCart() {
    // Session is still being determined.
    if (status === "loading") {
      return;
    }

    // User is not logged in.
    if (status !== "authenticated") {
      resetCart();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to load cart."
        );
      }

      setCart({
        cartId: data?.cartId ?? null,

        items: Array.isArray(data?.items)
          ? data.items
          : [],

        subtotal: Number(data?.subtotal ?? 0),
      });
    } catch (err) {
      console.error("Failed to load cart:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load cart."
      );

      // Don't leave old cart data around after an error.
      setCart({
        cartId: null,
        items: [],
        subtotal: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Automatically refresh cart whenever authentication
   * changes.
   *
   * Logged in  -> load cart
   * Logged out -> empty cart
   */
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "authenticated") {
      refreshCart();
    } else {
      resetCart();
      setLoading(false);
    }
  }, [status]);

  /**
   * Remove a single cart item.
   */
  async function removeFromCart(itemId: string) {
    // Prevent unauthenticated cart operations.
    if (status !== "authenticated") {
      setError("Please log in to modify your cart.");
      return;
    }

    try {
      setError(null);

      const response = await fetch(
        `/api/cart/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to remove cart item."
        );
      }

      await refreshCart();
    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove cart item."
      );
    }
  }

  /**
   * Remove all items from the cart.
   */
  async function clearCart() {
    // Prevent unauthenticated cart operations.
    if (status !== "authenticated") {
      setError("Please log in to modify your cart.");
      return;
    }

    try {
      setError(null);

      const currentItems = [...cart.items];

      for (const item of currentItems) {
        const response = await fetch(
          `/api/cart/items/${item.itemId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null);

          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to clear cart."
          );
        }
      }

      await refreshCart();
    } catch (err) {
      console.error(
        "Failed to clear cart:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to clear cart."
      );
    }
  }

  const itemCount = cart.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity),
    0
  );

  const cartTotal = Number(cart.subtotal);

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        cartId: cart.cartId,
        cartTotal,
        itemCount,
        loading,
        error,
        refreshCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart() must be called inside <CartProvider>"
    );
  }

  return ctx;
}