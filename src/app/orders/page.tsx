"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SIGNAL, useTheme } from "@/src/context/ThemeContext";
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
  const { colors } = useTheme();
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
          throw new Error(
            data?.message || data?.error || "Failed to load orders."
          );
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load orders."
        );
        toast.error(
          err instanceof Error ? err.message : "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden px-5 py-10 sm:px-8 sm:py-14">
      <div className="border-b pb-6" style={{ borderColor: colors.line }}>
        <span
          className="font-mono text-[11px] tracking-[0.25em]"
          style={{ color: SIGNAL }}
        >
          Account
        </span>

        <h1
          className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-5xl"
          style={{ color: colors.text }}
        >
          Your Orders
        </h1>
      </div>

      {error && (
        <div
          className="mt-6 break-words border p-4 font-mono text-xs"
          style={{ borderColor: SIGNAL, color: SIGNAL }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="mt-8 border p-6 text-center font-mono text-xs"
          style={{ borderColor: colors.line, color: colors.textMuted }}
        >
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          className="mt-8 border p-6 text-center sm:p-10"
          style={{ borderColor: colors.line }}
        >
          <p className="text-sm" style={{ color: colors.textMuted }}>
            You haven't placed any orders yet.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-block px-7 py-3 font-mono text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: SIGNAL, color: "#131210" }}
          >
            Browse Products
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
                className="block border p-4 transition hover:opacity-80 sm:p-5"
                style={{
                  borderColor: colors.line,
                  backgroundColor: colors.panel,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="break-all font-mono text-[11px]"
                      style={{ color: colors.textMuted }}
                    >
                      Order #{order.orderId.slice(0, 8)}
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.text }}
                    >
                      {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span
                      className="border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
                      style={{ borderColor: SIGNAL, color: SIGNAL }}
                    >
                      {order.status}
                    </span>

                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: colors.text }}
                    >
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
  );
}