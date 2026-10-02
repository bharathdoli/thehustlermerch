"use client";

/**
 * Route: app/shipping-policy/page.tsx
 */

import Link from "next/link";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

export default function ShippingPolicyPage() {
  const { colors } = useTheme();

  return (
    <div
      className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20
        w-full min-w-0 break-words md:px-10 lg:py-24"
    >
      <span
        className="font-mono text-[11px] tracking-[0.25em]"
        style={{ color: SIGNAL }}
      >
        Policies
      </span>

      <h1
        className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl
          break-words max-[380px]:text-3xl"
        style={{ color: colors.text }}
      >
        Shipping Policy
      </h1>

      <div
        className="mt-8 space-y-8 text-sm leading-relaxed
          sm:text-base"
        style={{ color: colors.textMuted }}
      >
        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Processing time
          </h2>
          <p>
            In-stock orders are processed within 1–2 business days. Custom merch orders begin
            production only after your design proof is approved, so timelines start from
            approval, not from the order date.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Delivery timelines
          </h2>
          <p>
            Standard orders are delivered across India within 5–7 business days of dispatch.
            Metro cities typically see delivery on the faster end of that window; remote pin
            codes may take a day or two longer.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Shipping charges
          </h2>
          <p>
            Shipping cost is calculated at checkout based on your delivery address and order
            weight. Any applicable charge is shown before you confirm payment — never added
            afterward.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Tracking your order
          </h2>
          <p>
            Once your order ships, you can track its status any time from your{" "}
            <Link href="/orders" style={{ color: SIGNAL }}>
              Orders page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Delays
          </h2>
          <p>
            Occasionally, weather, courier network issues, or regional restrictions can delay a
            shipment beyond the quoted window. If this happens, we'll notify you and you can
            reach us any time from the{" "}
            <a href="/#contact" style={{ color: SIGNAL }}>
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}