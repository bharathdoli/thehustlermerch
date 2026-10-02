"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
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
  const { colors } = useTheme();
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
          throw new Error(
            data?.message || data?.error || "Failed to load order."
          );
        }

        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load order."
        );
        toast.error(
          err instanceof Error ? err.message : "Failed to load order."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <span
          className="font-mono text-xs"
          style={{ color: colors.textMuted }}
        >
          Loading order...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <div
          className="break-words border p-6 font-mono text-xs"
          style={{ borderColor: SIGNAL, color: SIGNAL }}
        >
          {error || "Order not found."}
        </div>

        <Link
          href="/orders"
          className="mt-6 inline-block font-mono text-[10px] uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/orders"
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: colors.textMuted }}
      >
        ← Back to Orders
      </Link>

      <div
        className="mt-4 border-b pb-6"
        style={{ borderColor: colors.line }}
      >
        <span
          className="break-all font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Order #{order.orderId.slice(0, 8)}
        </span>

        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1
            className="font-display text-3xl uppercase tracking-tight sm:text-5xl"
            style={{ color: colors.text }}
          >
            Order Details
          </h1>

          <span
            className="border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
            style={{ borderColor: SIGNAL, color: SIGNAL }}
          >
            {order.status}
          </span>
        </div>

        <p
          className="mt-3 text-sm"
          style={{ color: colors.textMuted }}
        >
          Placed on {formatDateTime(order.createdAt)}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-12">
        {/* LEFT — items + status timeline */}
        <div className="min-w-0 space-y-8 lg:col-span-8">
          <section>
            <h2
              className="font-display text-2xl uppercase"
              style={{ color: colors.text }}
            >
              Items
            </h2>

            <div
              className="mt-4 border"
              style={{ borderColor: colors.line }}
            >
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
                      borderTop:
                        index === 0 ? "none" : `1px solid ${colors.line}`,
                    }}
                  >
                    {product?.productImage ? (
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="h-24 w-20 shrink-0 object-cover grayscale sm:h-28 sm:w-24"
                      />
                    ) : (
                      <div
                        className="flex h-24 w-20 shrink-0 items-center justify-center sm:h-28 sm:w-24"
                        style={{ backgroundColor: colors.panel }}
                      >
                        <span
                          className="text-center font-mono text-[8px]"
                          style={{ color: colors.textMuted }}
                        >
                          IMAGE
                          <br />
                          UNAVAILABLE
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
                        className="mt-2 space-y-1 font-mono text-[11px]"
                        style={{ color: colors.textMuted }}
                      >
                        <p>Colour: {item.variant?.colour ?? "N/A"}</p>
                        <p>Size: {item.variant?.size ?? "One Size"}</p>
                        <p>Quantity: {quantity}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className="font-mono text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          {quantity} × {fmt(unitPrice)}
                        </span>

                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: SIGNAL }}
                        >
                          {fmt(itemTotal)}
                        </span>
                      </div>

                      {product?.productId && (
                        <Link
                          href={`/products/${product.productId}`}
                          onClick={() =>
                            toast.info("Opening product page to write a review...")
                          }
                          className="mt-2 inline-block font-mono text-[10px] uppercase tracking-widest"
                          style={{ color: SIGNAL }}
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
              <h2
                className="font-display text-2xl uppercase"
                style={{ color: colors.text }}
              >
                Order Timeline
              </h2>

              <div
                className="mt-4 border p-4 sm:p-5"
                style={{
                  borderColor: colors.line,
                  backgroundColor: colors.panel,
                }}
              >
                {order.statusLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 py-2"
                    style={{
                      borderTop:
                        index === 0 ? "none" : `1px solid ${colors.line}`,
                    }}
                  >
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: SIGNAL }}
                    />

                    <div className="min-w-0">
                      <p
                        className="font-mono text-xs font-bold uppercase tracking-widest"
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

                      <p
                        className="mt-0.5 font-mono text-[10px]"
                        style={{ color: colors.textMuted }}
                      >
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
        <aside className="min-w-0 lg:col-span-4">
          <div
            className="border p-4 sm:p-5"
            style={{ borderColor: colors.line, backgroundColor: colors.panel }}
          >
            <h2
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Shipping Address
            </h2>

            <p className="mt-3 break-words text-sm" style={{ color: colors.text }}>
              {order.shippingName}
            </p>

            <p
              className="mt-1 break-words text-sm leading-relaxed"
              style={{ color: colors.textMuted }}
            >
              {order.shippingAddressLine1}
              {order.shippingAddressLine2 && `, ${order.shippingAddressLine2}`}
              <br />
              {order.shippingCity}, {order.shippingState} -{" "}
              {order.shippingPincode}
              <br />
              {order.shippingCountry}
            </p>

            <p
              className="mt-2 font-mono text-[11px]"
              style={{ color: colors.textMuted }}
            >
              {order.shippingPhone}
            </p>
          </div>

          <div
            className="mt-5 border p-4 sm:p-5"
            style={{ borderColor: colors.line, backgroundColor: colors.panel }}
          >
            <h2
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              Payment Summary
            </h2>

            <div className="mt-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.textMuted }}>Subtotal</span>
                <span style={{ color: colors.text }}>
                  {fmt(Number(order.subtotal))}
                </span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>Discount</span>
                  <span style={{ color: SIGNAL }}>
                    - {fmt(Number(order.discountAmount))}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span style={{ color: colors.textMuted }}>Shipping</span>
                <span style={{ color: colors.text }}>
                  {fmt(Number(order.shippingCost))}
                </span>
              </div>
            </div>

            <div
              className="mt-4 flex items-center justify-between border-t pt-4"
              style={{ borderColor: colors.line }}
            >
              <span
                className="font-mono text-sm font-bold"
                style={{ color: colors.text }}
              >
                Total
              </span>

              <span
                className="font-mono text-xl font-bold"
                style={{ color: SIGNAL }}
              >
                {fmt(Number(order.totalAmount))}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}