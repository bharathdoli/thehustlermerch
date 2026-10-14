"use client";

/**
 * Route: app/shipping-policy/page.tsx
 */

import Link from "next/link";
import { ORANGE, usePalette } from "@/src/lib/palette";

const linkClass = "font-medium underline underline-offset-2";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Processing time",
    body: (
      <>
        In-stock orders are processed within 1–2 business days. Custom merch
        orders begin production only after your design proof is approved, so
        timelines start from approval, not from the order date.
      </>
    ),
  },
  {
    title: "Delivery timelines",
    body: (
      <>
        Standard orders are delivered across India within 5–7 business days of
        dispatch. Metro cities typically see delivery on the faster end of that
        window; remote pin codes may take a day or two longer.
      </>
    ),
  },
  {
    title: "Shipping charges",
    body: (
      <>
        Shipping cost is calculated at checkout based on your delivery address
        and order weight. Any applicable charge is shown before you confirm
        payment — never added afterward.
      </>
    ),
  },
  {
    title: "Tracking your order",
    body: (
      <>
        Once your order ships, you can track its status any time from your{" "}
        <Link href="/orders" className={linkClass} style={{ color: ORANGE }}>
          Orders page
        </Link>
        .
      </>
    ),
  },
  {
    title: "Delays",
    body: (
      <>
        Occasionally, weather, courier network issues, or regional restrictions
        can delay a shipment beyond the quoted window. If this happens,
        we&apos;ll notify you and you can reach us any time from the{" "}
        <a href="/#contact" className={linkClass} style={{ color: ORANGE }}>
          Contact page
        </a>
        .
      </>
    ),
  },
];

export default function ShippingPolicyPage() {
  const colors = usePalette();

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-[70vh]">
      <div className="mx-auto w-full min-w-0 max-w-3xl break-words px-4 py-10 sm:px-8 sm:py-16">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ color: ORANGE }}
        >
          Policies
        </span>

        <h1
          className="mt-1.5 break-words font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] max-[380px]:text-3xl sm:text-6xl"
          style={{ color: colors.text }}
        >
          Shipping policy
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed sm:text-base">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2
                className="mb-2 font-display text-xl font-black uppercase leading-[0.95] tracking-[-0.02em]"
                style={{ color: colors.text }}
              >
                {section.title}
              </h2>
              <p style={{ color: colors.textMuted }}>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}