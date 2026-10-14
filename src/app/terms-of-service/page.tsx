"use client";

/**
 * Route: app/terms-of-service/page.tsx
 */

import { ORANGE, usePalette } from "@/src/lib/palette";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Using this site",
    body: "By creating an account or placing an order with TheHustlerMerchandise, you agree to these terms. You must provide accurate information when registering and placing orders, and you're responsible for keeping your account credentials secure.",
  },
  {
    title: "Orders and pricing",
    body: "Prices are listed in Indian Rupees and are subject to change without notice. Placing an order is an offer to purchase, which we may accept or decline — for example, in cases of pricing errors or stock unavailability.",
  },
  {
    title: "Custom merch and uploaded content",
    body: "When you upload a design for custom printing, you confirm you own the rights to that artwork or have permission to use it. We reserve the right to decline any design that infringes on third-party intellectual property or contains unlawful content.",
  },
  {
    title: "Coupons and promotions",
    body: "Coupon codes are subject to individual terms (minimum order value, expiry, usage limits) shown at the time of application and may be withdrawn or modified at any time.",
  },
  {
    title: "Limitation of liability",
    body: "We aim for every order to arrive as described, but we're not liable for indirect or consequential losses arising from delays, unavailability, or misuse of products.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms from time to time. Continued use of the site after changes are posted means you accept the updated terms.",
  },
];

export default function TermsOfServicePage() {
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
          Terms of service
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