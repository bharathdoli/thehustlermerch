"use client";

/**
 * Route: app/privacy-policy/page.tsx
 */

import { SIGNAL, useTheme } from "@/src/context/ThemeContext";

export default function PrivacyPolicyPage() {
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
        Privacy Policy
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
            Information we collect
          </h2>
          <p>
            When you create an account, place an order, or contact us, we collect information
            such as your name, email address, phone number, and shipping address — only what's
            needed to process your order and communicate with you.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            How we use it
          </h2>
          <p>
            We use your information to fulfill and ship orders, send order and account updates,
            respond to support requests, and — only if you opt in — send occasional emails about
            new drops.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Payment information
          </h2>
          <p>
            We do not store your card or UPI details on our servers. Payments are handled by a
            PCI-compliant payment processor, and we only retain the resulting transaction
            reference for order records.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Sharing your information
          </h2>
          <p>
            We share order details with shipping and payment partners only as needed to deliver
            your order. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Your choices
          </h2>
          <p>
            You can update your account details from My Account at any time, unsubscribe from
            marketing emails via the link in any email, or contact us to request deletion of
            your account data, subject to what we're required to retain for order and tax
            records.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 font-display text-lg uppercase tracking-tight"
            style={{ color: colors.text }}
          >
            Contact
          </h2>
          <p>
            Questions about this policy can be sent through the{" "}
            <a href="/#contact" style={{ color: SIGNAL }}>
              Contact Us
            </a>{" "}
            section.
          </p>
        </section>
      </div>
    </div>
  );
}