"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

type BackendCartItem = {
  itemId: string;
  quantity: number;
  unitPrice: number | string;
  customizationLogoFront?: string | null;
  customizationLogoBack?: string | null;

  variant: {
    colour?: string | null;
    size?: string | null;
    product: {
      productName: string;
      productImage?: string | null;
    };
  };
};

type BackendCart = {
  cartId: string | null;
  items: BackendCartItem[];
  subtotal: number;
};

export default function CartPage() {
  const { colors } = useTheme();
  const { status } = useSession();
  const router = useRouter();

  const [cart, setCart] = useState<BackendCart>({
    cartId: null,
    items: [],
    subtotal: 0,
  });

  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Reset the cart locally.
   * Used when the user is not authenticated.
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
   */
  async function loadCart() {
    // Don't call the backend while authentication
    // status is still being determined.
    if (status === "loading") {
      return;
    }

    // Never call the protected cart API when logged out.
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

      const data = await response
        .json()
        .catch(() => null);

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
      console.error(
        "Failed to load cart:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load cart."
      );

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
   * Handle authentication changes.
   *
   * Logged in:
   *   Load the user's cart.
   *
   * Logged out:
   *   Clear cart state and redirect to login.
   */
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      resetCart();
      setLoading(false);

      router.replace(
        "/login?redirect=/cart"
      );

      return;
    }

    if (status === "authenticated") {
      loadCart();
    }
  }, [status, router]);

  /**
   * Remove a single cart item.
   */
  async function removeFromCart(itemId: string) {
    // Extra frontend protection.
    if (status !== "authenticated") {
      router.replace(
        "/login?redirect=/cart"
      );
      return;
    }

    try {
      setRemovingItemId(itemId);
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
            "Failed to remove item."
        );
      }

      // Reload the real cart from the backend
      // after deletion.
      await loadCart();
    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove item."
      );
    } finally {
      setRemovingItemId(null);
    }
  }

  /**
   * Authentication status is still being checked.
   */
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          YOUR BAG
        </span>

        <h1
          className="mt-2 font-display text-4xl uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          Checking Login
        </h1>

        <p
          className="mt-3 text-sm"
          style={{ color: colors.textMuted }}
        >
          Please wait...
        </p>
      </div>
    );
  }

  /**
   * User is logged out.
   *
   * The useEffect above will redirect to login.
   * Render nothing while the redirect happens.
   */
  if (status === "unauthenticated") {
    return null;
  }

  /**
   * Authenticated user - cart is loading.
   */
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Your Bag
        </span>

        <h1
          className="mt-2 font-display text-4xl uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          Loading Cart
        </h1>

        <p
          className="mt-3 text-sm"
          style={{ color: colors.textMuted }}
        >
          Fetching your cart...
        </p>
      </div>
    );
  }

  const items = cart.items;
  const cartTotal = Number(cart.subtotal);

  /**
   * Cart is empty.
   */
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Your Bag
        </span>

        <h1
          className="mt-2 font-display text-4xl uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          Cart is empty
        </h1>

        <p
          className="mt-3 text-sm"
          style={{ color: colors.textMuted }}
        >
          Nothing here yet — go pick a design and upload your
          logo to get started.
        </p>

        {error && (
          <p
            className="mt-4 font-mono text-xs"
            style={{ color: SIGNAL }}
          >
            {error}
          </p>
        )}

        <Link
          href="/products"
          className="mt-8 inline-block px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
          style={{
            backgroundColor: SIGNAL,
            color: "#131210",
          }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <span
        className="font-mono text-[11px] tracking-[0.25em]"
        style={{ color: SIGNAL }}
      >
        Your Bag
      </span>

      <h1
        className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl"
        style={{ color: colors.text }}
      >
        Cart
      </h1>

      {error && (
        <div
          className="mt-5 border p-3 font-mono text-xs"
          style={{
            borderColor: colors.line,
            color: SIGNAL,
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Items */}
        <div
          className="border lg:col-span-8"
          style={{ borderColor: colors.line }}
        >
          {items.map((item, i) => {
            const product = item.variant?.product;

            const productName =
              product?.productName ?? "Product";

            const productImage =
              product?.productImage ?? "";

            const colour =
              item.variant?.colour ?? "N/A";

            const size =
              item.variant?.size ?? "One Size";

            const quantity = Number(item.quantity);

            const unitPrice =
              Number(item.unitPrice);

            const totalPrice =
              quantity * unitPrice;

            const frontImage =
              item.customizationLogoFront;

            const backImage =
              item.customizationLogoBack;

            return (
              <div
                key={item.itemId}
                className="flex gap-4 p-4 sm:p-5"
                style={{
                  borderTop:
                    i === 0
                      ? "none"
                      : `1px solid ${colors.line}`,
                }}
              >
                {/* Images */}
                <div className="flex shrink-0 gap-1.5">
                  {frontImage && (
                    <img
                      src={frontImage}
                      alt="Front design"
                      className="h-20 w-20 rounded object-cover"
                    />
                  )}

                  {backImage && (
                    <img
                      src={backImage}
                      alt="Back design"
                      className="h-20 w-20 rounded object-cover"
                    />
                  )}

                  {!frontImage &&
                    !backImage &&
                    productImage && (
                      <img
                        src={productImage}
                        alt={productName}
                        className="h-20 w-20 rounded object-cover grayscale"
                      />
                    )}

                  {!frontImage &&
                    !backImage &&
                    !productImage && (
                      <div
                        className="flex h-20 w-20 items-center justify-center"
                        style={{
                          backgroundColor:
                            colors.panel,
                        }}
                      >
                        <span
                          className="text-center font-mono text-[8px]"
                          style={{
                            color:
                              colors.textMuted,
                          }}
                        >
                          IMAGE
                          <br />
                          UNAVAILABLE
                        </span>
                      </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: colors.text,
                        }}
                      >
                        {productName}
                      </p>

                      <p
                        className="mt-1 font-mono text-[11px]"
                        style={{
                          color:
                            colors.textMuted,
                        }}
                      >
                        Colour: {colour}
                      </p>

                      <p
                        className="mt-0.5 font-mono text-[11px]"
                        style={{
                          color:
                            colors.textMuted,
                        }}
                      >
                        {size} × {quantity}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.itemId)
                      }
                      disabled={
                        removingItemId ===
                        item.itemId
                      }
                      aria-label="Remove item"
                      className="font-mono text-[10px] uppercase tracking-widest transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        color:
                          colors.textMuted,
                        opacity: 0.7,
                      }}
                    >
                      {removingItemId ===
                      item.itemId
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between font-mono text-sm">
                    <span
                      style={{
                        color:
                          colors.textMuted,
                      }}
                    >
                      {quantity} pcs ×{" "}
                      {fmt(unitPrice)}
                    </span>

                    <span
                      style={{
                        color: SIGNAL,
                      }}
                    >
                      {fmt(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div
            className="border p-5"
            style={{
              borderColor: colors.line,
              backgroundColor: colors.panel,
            }}
          >
            <h2
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{
                color: colors.textMuted,
              }}
            >
              Order Summary
            </h2>

            <div className="mt-4 flex items-center justify-between font-mono text-sm">
              <span
                style={{
                  color: colors.textMuted,
                }}
              >
                Subtotal
              </span>

              <span
                style={{
                  color: colors.text,
                }}
              >
                {fmt(cartTotal)}
              </span>
            </div>

            <p
              className="mt-1 font-mono text-[10px]"
              style={{
                color: colors.textMuted,
                opacity: 0.7,
              }}
            >
              Shipping & taxes calculated at
              checkout.
            </p>

            <Link
              href="/checkout"
              className="mt-5 block w-full py-3 text-center font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
              style={{
                backgroundColor: SIGNAL,
                color: "#131210",
              }}
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="mt-3 block text-center font-mono text-[11px] uppercase tracking-widest transition hover:opacity-100"
              style={{
                color: colors.textMuted,
                opacity: 0.8,
              }}
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}