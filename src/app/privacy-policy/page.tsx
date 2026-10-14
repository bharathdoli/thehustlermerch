"use client";

/**
 * Route: app/privacy-policy/page.tsx
 */

import { ORANGE, usePalette } from "@/src/lib/palette";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Information we collect",
    body: (
      <>
        When you create an account, place an order, or contact us, we collect
        information such as your name, email address, phone number, and shipping
        address — only what&apos;s needed to process your order and communicate
        with you.
      </>
    ),
  },
  {
    title: "How we use it",
    body: (
      <>
        We use your information to fulfill and ship orders, send order and
        account updates, respond to support requests, and — only if you opt in —
        send occasional emails about new drops.
      </>
    ),
  },
  {
    title: "Payment information",
    body: (
      <>
        We do not store your card or UPI details on our servers. Payments are
        handled by a PCI-compliant payment processor, and we only retain the
        resulting transaction reference for order records.
      </>
    ),
  },
  {
    title: "Sharing your information",
    body: (
      <>
        We share order details with shipping and payment partners only as needed
        to deliver your order. We do not sell your personal information to third
        parties.
      </>
    ),
  },
  {
    title: "Your choices",
    body: (
      <>
        You can update your account details from My Account at any time,
        unsubscribe from marketing emails via the link in any email, or contact
        us to request deletion of your account data, subject to what
        we&apos;re required to retain for order and tax records.
      </>
    ),
  },
  {
    title: "Contact",
    body: (
      <>
        Questions about this policy can be sent through the{" "}
        <a
          href="/#contact"
          className="font-medium underline underline-offset-2"
          style={{ color: ORANGE }}
        >
          Contact Us
        </a>{" "}
        section.
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
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
          Privacy policy
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