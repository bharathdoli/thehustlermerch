"use client";

import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const { items, removeFromCart, cartTotal } = useCart();
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Your Bag</span>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight" style={{ color: colors.text }}>Cart is empty</h1>
        <p className="mt-3 text-sm" style={{ color: colors.textMuted }}>
          Nothing here yet — go pick a design and upload your logo to get started.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95"
          style={{ backgroundColor: SIGNAL, color: "#131210" }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: SIGNAL }}>Your Bag</span>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl" style={{ color: colors.text }}>Cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Items */}
        <div className="border lg:col-span-8" style={{ borderColor: colors.line }}>
          {items.map((item, i) => (
            <div
              key={item.cartItemId}
              className="flex gap-4 p-4 sm:p-5"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${colors.line}` }}
            >
              <div className="flex shrink-0 gap-1.5">
                {item.frontImage && (
                  <img src={item.frontImage} alt="Front design" className="h-20 w-20 rounded object-cover" />
                )}
                {item.backImage && (
                  <img src={item.backImage} alt="Back design" className="h-20 w-20 rounded object-cover" />
                )}
                {!item.frontImage && !item.backImage && (
                  <img src={item.image} alt={item.productName} className="h-20 w-20 rounded object-cover grayscale" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{item.productName}</p>
                    <p className="mt-1 font-mono text-[11px]" style={{ color: colors.textMuted }}>Colour: {item.colour}</p>
                    <p className="mt-0.5 font-mono text-[11px]" style={{ color: colors.textMuted }}>
                      {Object.entries(item.sizeBreakdown)
                        .filter(([, qty]) => qty > 0)
                        .map(([size, qty]) => `${size} × ${qty}`)
                        .join("  ·  ")}
                    </p>
                    {item.customText && (
                      <p className="mt-0.5 font-mono text-[11px]" style={{ color: colors.textMuted }}>Note: {item.customText}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    aria-label="Remove item"
                    className="font-mono text-[10px] uppercase tracking-widest transition hover:opacity-100"
                    style={{ color: colors.textMuted, opacity: 0.7 }}
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-sm">
                  <span style={{ color: colors.textMuted }}>
                    {item.totalQuantity} pcs × {fmt(item.unitPrice)}
                  </span>
                  <span style={{ color: SIGNAL }}>{fmt(item.totalQuantity * item.unitPrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="border p-5" style={{ borderColor: colors.line, backgroundColor: colors.panel }}>
            <h2 className="font-mono text-[11px] uppercase tracking-widest" style={{ color: colors.textMuted }}>Order Summary</h2>
            <div className="mt-4 flex items-center justify-between font-mono text-sm">
              <span style={{ color: colors.textMuted }}>Subtotal</span>
              <span style={{ color: colors.text }}>{fmt(cartTotal)}</span>
            </div>
            <p className="mt-1 font-mono text-[10px]" style={{ color: colors.textMuted, opacity: 0.7 }}>Shipping & taxes calculated at checkout.</p>
            <button className="mt-5 w-full py-3 font-mono text-xs font-bold uppercase tracking-widest transition hover:brightness-95" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
              Proceed to Checkout
            </button>
            <Link
              href="/products"
              className="mt-3 block text-center font-mono text-[11px] uppercase tracking-widest transition hover:opacity-100"
              style={{ color: colors.textMuted, opacity: 0.8 }}
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}