"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

type OrderItem = {
  itemId: string;
  quantity: number;
  unitPrice: number | string;
  variant: {
    colour: string;
    size: string;
    product: {
      productId: string;
      productName: string;
      productImage?: string | null;
    };
  };
};

type StatusLog = {
  status: string;
  note?: string | null;
  createdAt: string;
};

type OrderDetail = {
  orderId: string;
  status: string;
  subtotal: number | string;
  discountAmount: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  items: OrderItem[];
  statusLogs: StatusLog[];
};

function fmt(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const colors = usePalette();
  const toast = useToast();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Failed to load order.");
        }

        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
        const message = err instanceof Error ? err.message : "Failed to load order.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const pageBg = { backgroundColor: colors.bg, color: colors.text };
  const backLinkClass =
    "text-[11px] font-medium uppercase tracking-[0.2em] transition hover:opacity-100";
  const h2Class =
    "font-display text-2xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-3xl";
  const panelTitleClass = "text-[11px] font-medium uppercase tracking-[0.2em]";

  if (loading) {
    return (
      <div style={pageBg} className="min-h-[70vh]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm sm:px-8 sm:py-24">
          <span style={{ color: colors.textMuted }}>Loading order...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={pageBg} className="min-h-[70vh]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-8 sm:py-24">
          <div
            className="break-words border p-6 text-xs"
            style={{ borderColor: ORANGE, color: ORANGE }}
          >
            {error || "Order not found."}
          </div>

          <Link
            href="/orders"
            className={`${backLinkClass} mt-6 inline-block`}
            style={{ color: colors.textMuted }}
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageBg} className="min-h-[70vh]">
      <div className="mx-auto max-w-5xl overflow-x-hidden px-4 py-10 sm:px-8 sm:py-16">
        <Link
          href="/orders"
          className={backLinkClass}
          style={{ color: colors.textMuted }}
        >
          ← Back to orders
        </Link>

        {/* HEADER */}
        <div className="mt-5">
          <span
            className="break-all text-[11px] font-medium uppercase tracking-[0.25em]"
            style={{ color: ORANGE }}
          >
            Order #{order.orderId.slice(0, 8)}
          </span>

          <div className="mt-1.5 flex flex-wrap items-center gap-4">
            <h1
              className="font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
              style={{ color: colors.text }}
            >
              Order details
            </h1>

            <span
              className="border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: ORANGE, color: ORANGE }}
            >
              {order.status}
            </span>
          </div>

          <p className="mt-4 text-sm" style={{ color: colors.textMuted }}>
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12">
          {/* LEFT — items + status timeline */}
          <div className="min-w-0 space-y-12 lg:col-span-8">
            <section>
              <h2 className={h2Class} style={{ color: colors.text }}>
                Items
              </h2>

              <div className="mt-4 border" style={{ borderColor: colors.line }}>
                {order.items.map((item, index) => {
                  const product = item.variant?.product;
                  const quantity = Number(item.quantity);
                  const unitPrice = Number(item.unitPrice);
                  const itemTotal = quantity * unitPrice;

                  return (
                    <div
                      key={item.itemId}
                      className="flex gap-4 p-4 max-[380px]:flex-col sm:p-5"
                      style={{
                        borderTop: index === 0 ? "none" : `1px solid ${colors.line}`,
                      }}
                    >
                      {product?.productImage ? (
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="h-24 w-20 shrink-0 object-cover sm:h-28 sm:w-24"
                          style={{ backgroundColor: colors.panel }}
                        />
                      ) : (
                        <div
                          className="flex h-24 w-20 shrink-0 items-center justify-center sm:h-28 sm:w-24"
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

                      <div className="min-w-0 flex-1">
                        <h3
                          className="break-words text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          {product?.productName ?? "Product"}
                        </h3>

                        <div
                          className="mt-2 space-y-1 text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          <p>Colour: {item.variant?.colour ?? "N/A"}</p>
                          <p>Size: {item.variant?.size ?? "One Size"}</p>
                          <p>Quantity: {quantity}</p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs" style={{ color: colors.textMuted }}>
                            {quantity} × {fmt(unitPrice)}
                          </span>

                          <span className="text-sm font-semibold" style={{ color: ORANGE }}>
                            {fmt(itemTotal)}
                          </span>
                        </div>

                        {product?.productId && (
                          <Link
                            href={`/products/${product.productId}`}
                            onClick={() =>
                              toast.info("Opening product page to write a review...")
                            }
                            className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] hover:underline"
                            style={{ color: ORANGE }}
                          >
                            Write a review →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STATUS TIMELINE */}
            {order.statusLogs?.length > 0 && (
              <section>
                <h2 className={h2Class} style={{ color: colors.text }}>
                  Order timeline
                </h2>

                <div
                  className="mt-4 p-5 sm:p-6"
                  style={{ backgroundColor: colors.panel }}
                >
                  {order.statusLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-3"
                      style={{
                        borderTop:
                          index === 0 ? "none" : `1px solid ${colors.lineStrong}`,
                      }}
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ORANGE }}
                      />

                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.2em]"
                          style={{ color: colors.text }}
                        >
                          {log.status}
                        </p>

                        {log.note && (
                          <p
                            className="mt-0.5 break-words text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            {log.note}
                          </p>
                        )}

                        <p className="mt-0.5 text-[11px]" style={{ color: colors.textMuted }}>
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT — shipping + totals */}
          <aside className="min-w-0 space-y-5 lg:col-span-4">
            <div className="p-5 sm:p-6" style={{ backgroundColor: colors.panel }}>
              <h2 className={panelTitleClass} style={{ color: colors.textMuted }}>
                Shipping address
              </h2>

              <p
                className="mt-3 break-words text-sm font-semibold"
                style={{ color: colors.text }}
              >
                {order.shippingName}
              </p>

              <p
                className="mt-1 break-words text-sm leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {order.shippingAddressLine1}
                {order.shippingAddressLine2 && `, ${order.shippingAddressLine2}`}
                <br />
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                <br />
                {order.shippingCountry}
              </p>

              <p className="mt-2 text-xs" style={{ color: colors.textMuted }}>
                {order.shippingPhone}
              </p>
            </div>

            <div className="p-5 sm:p-6" style={{ backgroundColor: colors.panel }}>
              <h2 className={panelTitleClass} style={{ color: colors.textMuted }}>
                Payment summary
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: colors.text }}>
                    {fmt(Number(order.subtotal))}
                  </span>
                </div>

                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: colors.textMuted }}>Discount</span>
                    <span className="font-semibold" style={{ color: ORANGE }}>
                      - {fmt(Number(order.discountAmount))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>Shipping</span>
                  <span className="font-semibold" style={{ color: colors.text }}>
                    {fmt(Number(order.shippingCost))}
                  </span>
                </div>
              </div>

              <div
                className="mt-4 flex items-center justify-between border-t pt-4"
                style={{ borderColor: colors.lineStrong }}
              >
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  Total
                </span>

                <span className="text-xl font-bold" style={{ color: ORANGE }}>
                  {fmt(Number(order.totalAmount))}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}