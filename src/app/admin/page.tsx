"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import CategoriesPanel from "@/src/components/CategoriesPanel";
import ProductsPanel from "@/src/components/ProductsPanel";
import VariantsPanel from "@/src/components/VariantsPanel";
import CouponsPanel from "@/src/components/CouponsPanel";

const TABS = ["Categories", "Products", "Variants", "Coupons"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Categories");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 break-all text-sm opacity-70 sm:break-normal">
          {session?.user?.name} · {session?.user?.email}
        </p>
      </div>

      {/* Tabs scroll sideways on narrow screens instead of wrapping or overflowing */}
      <div
        role="tablist"
        className="-mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-black/10 px-4 sm:mx-0 sm:mt-8 sm:gap-2 sm:px-0"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 whitespace-nowrap px-3 py-2 font-mono text-xs uppercase tracking-widest transition sm:px-4 ${
              activeTab === tab ? "border-b-2 border-orange-500 opacity-100" : "opacity-50 hover:opacity-80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* min-w-0 lets wide tables inside panels scroll rather than stretch the page */}
      <div className="mt-6 min-w-0 sm:mt-8">
        {activeTab === "Categories" && <CategoriesPanel />}
        {activeTab === "Products" && <ProductsPanel />}
        {activeTab === "Variants" && <VariantsPanel />}
        {activeTab === "Coupons" && <CouponsPanel />}
      </div>
    </div>
  );
}