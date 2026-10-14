"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

type OrderListItem = {
  orderId: string;
  status: string;
  totalAmount: number | string;
  createdAt: string;
  items: { itemId: string; quantity: number }[];
};

function fmt(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const colors = usePalette();
  const toast = useToast();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Failed to load orders.");
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        const message = err instanceof Error ? err.message : "Failed to load orders.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const primaryBtnStyle = { backgroundColor: colors.text, color: colors.bg };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-[70vh]">
      <div className="mx-auto max-w-3xl overflow-x-hidden px-4 py-10 sm:px-8 sm:py-16">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ color: ORANGE }}
        >
          Your account
        </span>

        <h1
          className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          style={{ color: colors.text }}
        >
          Your orders
        </h1>

        {error && (
          <div
            className="mt-6 break-words border p-4 text-xs"
            style={{ borderColor: ORANGE, color: ORANGE }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            className="mt-8 p-6 text-center text-sm"
            style={{ backgroundColor: colors.panel, color: colors.textMuted }}
          >
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div
            className="mt-8 p-6 text-center sm:p-10"
            style={{ backgroundColor: colors.panel }}
          >
            <p className="text-sm" style={{ color: colors.textMuted }}>
              You haven&apos;t placed any orders yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-80"
              style={primaryBtnStyle}
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-3">
            {orders.map((order) => {
              const itemCount = order.items?.length ?? 0;

              return (
                <Link
                  key={order.orderId}
                  href={`/orders/${order.orderId}`}
                  className="block p-4 transition hover:opacity-80 sm:p-5"
                  style={{ backgroundColor: colors.panel }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className="break-all text-[11px] font-medium uppercase tracking-[0.2em]"
                        style={{ color: colors.textMuted }}
                      >
                        Order #{order.orderId.slice(0, 8)}
                      </p>

                      <p className="mt-1 text-sm" style={{ color: colors.text }}>
                        {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <span
                        className="border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ borderColor: ORANGE, color: ORANGE }}
                      >
                        {order.status}
                      </span>

                      <span className="text-sm font-semibold" style={{ color: colors.text }}>
                        {fmt(Number(order.totalAmount))}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}