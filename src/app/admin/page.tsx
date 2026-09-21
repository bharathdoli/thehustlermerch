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
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm opacity-70">
          {session?.user?.name} · {session?.user?.email}
        </p>
      </div>

      <div className="mt-8 flex gap-2 border-b border-black/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${
              activeTab === tab ? "border-b-2 border-orange-500 opacity-100" : "opacity-50 hover:opacity-80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "Categories" && <CategoriesPanel />}
        {activeTab === "Products" && <ProductsPanel />}
        {activeTab === "Variants" && <VariantsPanel />}
        {activeTab === "Coupons" && <CouponsPanel />}
      </div>
    </div>
  );
}