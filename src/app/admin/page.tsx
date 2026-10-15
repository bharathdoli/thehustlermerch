"use client";

import { useSession } from "next-auth/react";
import { useState, type CSSProperties } from "react";
import { ORANGE, usePalette } from "@/src/lib/palette";
import CategoriesPanel from "@/src/components/CategoriesPanel";
import ProductsPanel from "@/src/components/ProductsPanel";
import VariantsPanel from "@/src/components/VariantsPanel";
import CouponsPanel from "@/src/components/CouponsPanel";

const TABS = [
  { id: "Categories", hint: "Groups in the shop" },
  { id: "Products", hint: "Items you sell" },
  { id: "Variants", hint: "Sizes, colours, prices" },
  { id: "Coupons", hint: "Discount codes" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const colors = usePalette();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Categories");

  // Shared theme variables read by every component in AdminUi
  const theme = {
    "--a-bg": colors.bg,
    "--a-text": colors.text,
    "--a-muted": colors.textMuted,
    "--a-line": colors.line,
    backgroundColor: colors.bg,
    color: colors.text,
  } as CSSProperties;

  return (
    <div style={theme} className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h1 className="font-display text-3xl font-black uppercase leading-none tracking-[-0.03em] sm:text-4xl">
            Dashboard
          </h1>
          <p className="break-all text-sm sm:break-normal" style={{ color: colors.textMuted }}>
            Signed in as {session?.user?.email ?? session?.user?.name}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          {/* Sidebar on desktop, scrollable strip on mobile */}
          <nav
            role="tablist"
            aria-label="Admin sections"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className="shrink-0 whitespace-nowrap border-l-0 px-4 py-2.5 text-left transition hover:opacity-100 lg:border-l-[3px]"
                  style={{
                    backgroundColor: active ? `color-mix(in srgb, ${colors.text} 6%, ${colors.bg})` : "transparent",
                    borderColor: active ? ORANGE : "transparent",
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  <span className="block text-sm font-semibold">{tab.id}</span>
                  <span className="hidden text-xs lg:block" style={{ color: colors.textMuted }}>
                    {tab.hint}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* min-w-0 lets wide tables scroll inside the panel instead of stretching the page */}
          <main className="min-w-0" role="tabpanel">
            {activeTab === "Categories" && <CategoriesPanel />}
            {activeTab === "Products" && <ProductsPanel />}
            {activeTab === "Variants" && <VariantsPanel />}
            {activeTab === "Coupons" && <CouponsPanel />}
          </main>
        </div>
      </div>
    </div>
  );
}