"use client";

/**
 * Route: app/terms-of-service/page.tsx
 */

import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

export default function TermsOfServicePage() {
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
        Terms of Service
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
            Using this site
          </h2>
          <p>
            By creating an account or placing an order with TheHustlerMerchandise, you agree to
            these terms. You must provide accurate information when registering and placing
            orders, and you're responsible for keeping your account credentials secure.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Orders and pricing
          </h2>
          <p>
            Prices are listed in Indian Rupees and are subject to change without notice.
            Placing an order is an offer to purchase, which we may accept or decline — for
            example, in cases of pricing errors or stock unavailability.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Custom merch and uploaded content
          </h2>
          <p>
            When you upload a design for custom printing, you confirm you own the rights to that
            artwork or have permission to use it. We reserve the right to decline any design that
            infringes on third-party intellectual property or contains unlawful content.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Coupons and promotions
          </h2>
          <p>
            Coupon codes are subject to individual terms (minimum order value, expiry, usage
            limits) shown at the time of application and may be withdrawn or modified at any
            time.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Limitation of liability
          </h2>
          <p>
            We aim for every order to arrive as described, but we're not liable for indirect or
            consequential losses arising from delays, unavailability, or misuse of products.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Changes to these terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            are posted means you accept the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}