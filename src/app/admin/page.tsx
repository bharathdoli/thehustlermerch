"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { ORANGE, usePalette } from "@/src/lib/palette";
import CategoriesPanel from "@/src/components/CategoriesPanel";
import ProductsPanel from "@/src/components/ProductsPanel";
import VariantsPanel from "@/src/components/VariantsPanel";
import CouponsPanel from "@/src/components/CouponsPanel";

const TABS = ["Categories", "Products", "Variants", "Coupons"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const colors = usePalette();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Categories");

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 sm:py-16">
        <div>
          <span
            className="text-[11px] font-medium uppercase tracking-[0.25em]"
            style={{ color: ORANGE }}
          >
            Admin
          </span>
          <h1
            className="mt-1.5 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl"
            style={{ color: colors.text }}
          >
            Dashboard
          </h1>
          <p
            className="mt-3 break-all text-sm sm:break-normal"
            style={{ color: colors.textMuted }}
          >
            {session?.user?.name} · {session?.user?.email}
          </p>
        </div>

        {/* Tabs scroll sideways on narrow screens instead of wrapping or overflowing */}
        <div
          role="tablist"
          className="-mx-4 mt-8 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:mt-10 sm:gap-2 sm:px-0"
          style={{ borderColor: colors.line }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className="shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:opacity-100 sm:px-4"
                style={{
                  borderColor: active ? colors.text : "transparent",
                  color: active ? colors.text : colors.textMuted,
                  marginBottom: "-1px",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* min-w-0 lets wide tables inside panels scroll rather than stretch the page */}
        <div className="mt-6 min-w-0 sm:mt-8">
          {activeTab === "Categories" && <CategoriesPanel />}
          {activeTab === "Products" && <ProductsPanel />}
          {activeTab === "Variants" && <VariantsPanel />}
          {activeTab === "Coupons" && <CouponsPanel />}
        </div>
      </div>
    </div>
  );
}