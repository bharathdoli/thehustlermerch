"use client";

/**
 * Route: app/returns-exchanges/page.tsx
 */

import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

export default function ReturnsExchangesPage() {
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
        Returns &amp; Exchanges
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
            Return window
          </h2>
          <p>
            Unworn, unwashed items in original condition can be returned or exchanged within 7
            days of delivery. The tag must still be attached and the item must be free of any
            odor, stain, or damage.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Custom merch
          </h2>
          <p>
            Because custom-printed items are made specifically for you after design approval,
            they can only be returned or exchanged if there's a print defect or the item doesn't
            match the approved proof — not for a change of mind.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            How to start a return
          </h2>
          <p>
            Open the order from your{" "}
            <a href="/orders" style={{ color: SIGNAL }}>
              Orders page
            </a>{" "}
            and reach out via{" "}
            <a href="/#contact" style={{ color: SIGNAL }}>
              Contact Us
            </a>{" "}
            with your order ID and reason. We'll confirm eligibility and share pickup or drop-off
            instructions.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Refunds
          </h2>
          <p>
            Once we receive and inspect the returned item, refunds are processed to the original
            payment method within 5–7 business days. Exchanges for a different size ship out as
            soon as the returned item is received.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Non-returnable items
          </h2>
          <p>
            Items marked as final sale, and custom merch without a defect, are not eligible for
            return or exchange.
          </p>
        </section>
      </div>
    </div>
  );
}