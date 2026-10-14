"use client";

/**
 * Route: app/returns-exchanges/page.tsx
 */

import Link from "next/link";
import { ORANGE, usePalette } from "@/src/lib/palette";

const linkClass = "font-medium underline underline-offset-2";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Return window",
    body: (
      <>
        Unworn, unwashed items in original condition can be returned or exchanged
        within 7 days of delivery. The tag must still be attached and the item
        must be free of any odor, stain, or damage.
      </>
    ),
  },
  {
    title: "Custom merch",
    body: (
      <>
        Because custom-printed items are made specifically for you after design
        approval, they can only be returned or exchanged if there&apos;s a print
        defect or the item doesn&apos;t match the approved proof — not for a change
        of mind.
      </>
    ),
  },
  {
    title: "How to start a return",
    body: (
      <>
        Open the order from your{" "}
        <Link href="/orders" className={linkClass} style={{ color: ORANGE }}>
          Orders page
        </Link>{" "}
        and reach out via{" "}
        <a href="/#contact" className={linkClass} style={{ color: ORANGE }}>
          Contact Us
        </a>{" "}
        with your order ID and reason. We&apos;ll confirm eligibility and share
        pickup or drop-off instructions.
      </>
    ),
  },
  {
    title: "Refunds",
    body: (
      <>
        Once we receive and inspect the returned item, refunds are processed to
        the original payment method within 5–7 business days. Exchanges for a
        different size ship out as soon as the returned item is received.
      </>
    ),
  },
  {
    title: "Non-returnable items",
    body: (
      <>
        Items marked as final sale, and custom merch without a defect, are not
        eligible for return or exchange.
      </>
    ),
  },
];

export default function ReturnsExchangesPage() {
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
          Returns &amp; exchanges
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