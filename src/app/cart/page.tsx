"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";

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
  const toast = useToast();

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
  const resetCart = useCallback(() => {
    setCart({
      cartId: null,
      items: [],
      subtotal: 0,
    });

    setError(null);
  }, []);

  /**
   * Load the logged-in user's cart.
   */
  const loadCart = useCallback(async () => {
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

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load cart.";

      setError(message);
      toast.error(message);

      setCart({
        cartId: null,
        items: [],
        subtotal: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [status, resetCart, toast]);

  /**
   * Handle authentication changes.
   *
   * Logged in:
   *   Load the user's cart.
   *
   * Logged out:
   *   Clear cart state, show a message and redirect to login.
   */
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      resetCart();
      setLoading(false);

      toast.info("Please sign in to view your cart.");

      router.replace(
        "/login?redirect=/cart"
      );

      return;
    }

    if (status === "authenticated") {
      loadCart();
    }
  }, [status, router, toast, resetCart, loadCart]);

  /**
   * Remove a single cart item.
   */
  async function removeFromCart(itemId: string) {
    // Extra frontend protection.
    if (status !== "authenticated") {
      toast.info("Please sign in to manage your cart.");

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

      toast.success("Item removed from your bag.");

      // Reload the real cart from the backend
      // after deletion.
      await loadCart();
    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Failed to remove item.";

      setError(message);
      toast.error(message);
    } finally {
      setRemovingItemId(null);
    }
  }

  /**
   * Authentication status is still being checked.
   */
  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          YOUR BAG
        </span>

        <h1
          className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl"
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
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Your Bag
        </span>

        <h1
          className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl"
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
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Your Bag
        </span>

        <h1
          className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl"
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
            className="mt-4 break-words font-mono text-xs"
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
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
      <span
        className="font-mono text-[11px] tracking-[0.25em]"
        style={{ color: SIGNAL }}
      >
        Your Bag
      </span>

      <h1
        className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-5xl"
        style={{ color: colors.text }}
      >
        Cart
      </h1>

      {error && (
        <div
          className="mt-5 break-words border p-3 font-mono text-xs"
          style={{
            borderColor: colors.line,
            color: SIGNAL,
          }}
        >
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-10">
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
                className="flex gap-3 p-3 sm:gap-4 sm:p-5"
                style={{
                  borderTop:
                    i === 0
                      ? "none"
                      : `1px solid ${colors.line}`,
                }}
              >
                {/* Images */}
                <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                  {frontImage && (
                    <img
                      src={frontImage}
                      alt="Front design"
                      className="h-16 w-16 rounded object-cover sm:h-20 sm:w-20"
                    />
                  )}

                  {backImage && (
                    <img
                      src={backImage}
                      alt="Back design"
                      className="h-16 w-16 rounded object-cover sm:h-20 sm:w-20"
                    />
                  )}

                  {!frontImage &&
                    !backImage &&
                    productImage && (
                      <img
                        src={productImage}
                        alt={productName}
                        className="h-16 w-16 rounded object-cover grayscale sm:h-20 sm:w-20"
                      />
                    )}

                  {!frontImage &&
                    !backImage &&
                    !productImage && (
                      <div
                        className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <p
                        className="break-words text-sm font-medium"
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
                      aria-label={`Remove ${productName}`}
                      className="shrink-0 py-1 font-mono text-[10px] uppercase tracking-widest transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
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

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-xs sm:text-sm">
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
            className="border p-4 sm:p-5 lg:sticky lg:top-6"
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
              onClick={() =>
                toast.info("Taking you to checkout...")
              }
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
              className="mt-3 block py-1 text-center font-mono text-[11px] uppercase tracking-widest transition hover:opacity-100"
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