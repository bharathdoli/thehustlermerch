"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ORANGE, usePalette } from "@/src/lib/palette";
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

const EMPTY_CART: BackendCart = { cartId: null, items: [], subtotal: 0 };

export default function CartPage() {
  const colors = usePalette();
  const { status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [cart, setCart] = useState<BackendCart>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetCart = useCallback(() => {
    setCart(EMPTY_CART);
    setError(null);
  }, []);

  /** Load the logged-in user's cart. */
  const loadCart = useCallback(async () => {
    if (status === "loading") return;

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
        throw new Error(data?.message || data?.error || "Failed to load cart.");
      }

      setCart({
        cartId: data?.cartId ?? null,
        items: Array.isArray(data?.items) ? data.items : [],
        subtotal: Number(data?.subtotal ?? 0),
      });
    } catch (err) {
      console.error("Failed to load cart:", err);
      const message = err instanceof Error ? err.message : "Failed to load cart.";
      setError(message);
      toast.error(message);
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [status, resetCart, toast]);

  /** React to authentication changes. */
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      resetCart();
      setLoading(false);
      toast.info("Please sign in to view your cart.");
      router.replace("/login?redirect=/cart");
      return;
    }

    if (status === "authenticated") {
      loadCart();
    }
  }, [status, router, toast, resetCart, loadCart]);

  /** Remove a single cart item. */
  async function removeFromCart(itemId: string) {
    if (status !== "authenticated") {
      toast.info("Please sign in to manage your cart.");
      router.replace("/login?redirect=/cart");
      return;
    }

    try {
      setRemovingItemId(itemId);
      setError(null);

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to remove item.");
      }

      toast.success("Item removed from your bag.");
      await loadCart();
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      const message = err instanceof Error ? err.message : "Failed to remove item.";
      setError(message);
      toast.error(message);
    } finally {
      setRemovingItemId(null);
    }
  }

  /* ---------- shared styles (same look as the account page) ---------- */
  const pageBg = { backgroundColor: colors.bg, color: colors.text };
  const eyebrowClass = "text-[11px] font-medium uppercase tracking-[0.25em]";
  const h1Class =
    "mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl";
  const primaryBtnClass =
    "block w-full px-8 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80";
  const primaryBtnStyle = { backgroundColor: colors.text, color: colors.bg };

  /* ---------- auth still being checked ---------- */
  if (status === "loading") {
    return (
      <div style={pageBg} className="min-h-[70vh]">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
          <span className={eyebrowClass} style={{ color: ORANGE }}>
            Your bag
          </span>
          <h1 className={h1Class} style={{ color: colors.text }}>
            Checking login
          </h1>
          <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  /* ---------- logged out: effect above redirects ---------- */
  if (status === "unauthenticated") {
    return null;
  }

  /* ---------- cart loading ---------- */
  if (loading) {
    return (
      <div style={pageBg} className="min-h-[70vh]">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
          <span className={eyebrowClass} style={{ color: ORANGE }}>
            Your bag
          </span>
          <h1 className={h1Class} style={{ color: colors.text }}>
            Loading cart
          </h1>
          <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>
            Fetching your cart...
          </p>
        </div>
      </div>
    );
  }

  const items = cart.items;
  const cartTotal = Number(cart.subtotal);

  /* ---------- empty cart ---------- */
  if (items.length === 0) {
    return (
      <div style={pageBg} className="min-h-[70vh]">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-8 sm:py-24">
          <span className={eyebrowClass} style={{ color: ORANGE }}>
            Your bag
          </span>
          <h1 className={h1Class} style={{ color: colors.text }}>
            Cart is empty
          </h1>
          <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>
            Nothing here yet — go pick a design and upload your logo to get started.
          </p>

          {error && (
            <p className="mt-4 break-words text-xs" style={{ color: ORANGE }}>
              {error}
            </p>
          )}

          <Link
            href="/products"
            className="mt-8 inline-block px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80"
            style={primaryBtnStyle}
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- cart with items ---------- */
  return (
    <div style={pageBg} className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
        <span className={eyebrowClass} style={{ color: ORANGE }}>
          Your bag
        </span>
        <h1 className={h1Class} style={{ color: colors.text }}>
          Cart
        </h1>

        {error && (
          <div
            className="mt-5 break-words border p-3 text-xs"
            style={{ borderColor: colors.line, color: ORANGE }}
          >
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-10">
          {/* Items */}
          <div className="border lg:col-span-8" style={{ borderColor: colors.line }}>
            {items.map((item, i) => {
              const product = item.variant?.product;
              const productName = product?.productName ?? "Product";
              const productImage = product?.productImage ?? "";
              const colour = item.variant?.colour ?? "N/A";
              const size = item.variant?.size ?? "One Size";
              const quantity = Number(item.quantity);
              const unitPrice = Number(item.unitPrice);
              const totalPrice = quantity * unitPrice;
              const frontImage = item.customizationLogoFront;
              const backImage = item.customizationLogoBack;
              const removing = removingItemId === item.itemId;

              return (
                <div
                  key={item.itemId}
                  className="flex gap-3 p-3 sm:gap-4 sm:p-5"
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${colors.line}`,
                  }}
                >
                  {/* Images */}
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    {frontImage && (
                      <img
                        src={frontImage}
                        alt="Front design"
                        className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                        style={{ backgroundColor: colors.panel }}
                      />
                    )}

                    {backImage && (
                      <img
                        src={backImage}
                        alt="Back design"
                        className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                        style={{ backgroundColor: colors.panel }}
                      />
                    )}

                    {!frontImage && !backImage && productImage && (
                      <img
                        src={productImage}
                        alt={productName}
                        className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                        style={{ backgroundColor: colors.panel }}
                      />
                    )}

                    {!frontImage && !backImage && !productImage && (
                      <div
                        className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
                        style={{ backgroundColor: colors.panel }}
                      >
                        <span
                          className="text-center text-[8px] uppercase tracking-wider"
                          style={{ color: colors.textMuted }}
                        >
                          Image
                          <br />
                          unavailable
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
                          style={{ color: colors.text }}
                        >
                          {productName}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
                          Colour: {colour}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: colors.textMuted }}>
                          {size} × {quantity}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        disabled={removing}
                        aria-label={`Remove ${productName}`}
                        className="shrink-0 py-1 text-[11px] font-medium uppercase tracking-[0.2em] transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ color: colors.textMuted, opacity: 0.8 }}
                      >
                        {removing ? "Removing..." : "Remove"}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs sm:text-sm">
                      <span style={{ color: colors.textMuted }}>
                        {quantity} pcs × {fmt(unitPrice)}
                      </span>
                      <span className="font-semibold" style={{ color: ORANGE }}>
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
              className="p-5 sm:p-6 lg:sticky lg:top-6"
              style={{ backgroundColor: colors.panel }}
            >
              <h2
                className="text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: colors.textMuted }}
              >
                Order summary
              </h2>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span style={{ color: colors.textMuted }}>Subtotal</span>
                <span className="font-semibold" style={{ color: colors.text }}>
                  {fmt(cartTotal)}
                </span>
              </div>

              <p className="mt-1 text-[11px]" style={{ color: colors.textMuted }}>
                Shipping &amp; taxes calculated at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={() => toast.info("Taking you to checkout...")}
                className={`${primaryBtnClass} mt-5`}
                style={primaryBtnStyle}
              >
                Proceed to checkout
              </Link>

              <Link
                href="/products"
                className="mt-3 block py-1 text-center text-[11px] font-medium uppercase tracking-[0.2em] transition hover:opacity-100"
                style={{ color: colors.textMuted, opacity: 0.9 }}
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}