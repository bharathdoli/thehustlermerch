"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/src/context/CartContext";
import { ORANGE, usePalette } from "@/src/lib/palette";
import { useToast } from "@/src/context/ToastContext";

const NAV_LINKS: { label: string; href: string; accent?: boolean }[] = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/products" },
  { label: "New Arrivals", href: "/#products" },
  { label: "Bestsellers", href: "/products" },
  { label: "T-Shirts", href: "/products?search=t-shirt" },
  { label: "Shirts", href: "/products?search=shirt" },
  { label: "Hoodies", href: "/products?search=hoodie" },
  { label: "Bottomwear", href: "/products?search=bottom" },
  { label: "Accessories", href: "/products?search=accessories" },
  { label: "Customise your clothing", href: "/products", accent: true },
];

const ICON = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const accountRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const colors = usePalette();
  const toast = useToast();
  const router = useRouter();

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) {
      toast.info("Type something to search.");
      return;
    }
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const iconBtn =
    "relative flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60";

  const badge = (n: number | string) => (
    <span
      className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
      style={{ backgroundColor: ORANGE, color: "#fff" }}
    >
      {n}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement bar */}
      <div
        className="px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:text-[11px]"
        style={{
          backgroundColor: "#0e0e0e",
          paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))",
        }}
      >
        Free shipping over ₹1,499 · Use code{" "}
        <span style={{ color: ORANGE }}>HUSTLE10</span>
      </div>

      {/* Main bar */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.bg, borderColor: colors.line }}
      >
        <div className="mx-auto grid h-14 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:h-16 sm:px-8">
          {/* Left: menu */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-3 justify-self-start transition-opacity hover:opacity-60"
            style={{ color: colors.text }}
          >
            <svg {...ICON}>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] sm:inline">
              Menu
            </span>
          </button>

          {/* Centre: logo */}
          <Link
            href="/"
            className="text-center font-display text-[13px] font-black uppercase tracking-[0.2em] min-[400px]:text-sm sm:text-sm sm:tracking-[0.16em] md:text-base lg:text-[17px]"
            style={{ color: colors.text }}
          >
            <span className="sm:hidden">The Hustler</span>
            <span className="hidden sm:inline">The Hustler Merchandise</span>
          </Link>

          {/* Right: actions */}
          <div
            className="flex items-center justify-self-end"
            style={{ color: colors.text }}
          >
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className={iconBtn}
            >
              <svg {...ICON}>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                aria-label="Wishlist"
                onClick={() => toast.info("Your wishlist is empty for now.")}
                className={`${iconBtn} hidden sm:flex`}
              >
                <svg {...ICON}>
                  <path d="M12 20s-7-4.4-9.5-8.8C.8 7.8 2.4 4.5 5.8 4c2-.3 3.7.7 4.9 2.3C11.9 4.7 13.6 3.7 15.6 4c3.4.5 5 3.8 3.3 7.2C17.4 15.6 12 20 12 20z" />
                </svg>
              </button>
            )}

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  type="button"
                  aria-label="Account"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((v) => !v)}
                  className={iconBtn}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: ORANGE, color: "#fff" }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </button>

                {accountOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-64 border text-xs shadow-xl"
                    style={{
                      borderColor: colors.lineStrong,
                      backgroundColor: colors.bg,
                      maxWidth: "calc(100vw - 2rem)",
                    }}
                  >
                    <div className="border-b p-4" style={{ borderColor: colors.line }}>
                      <p className="truncate text-sm font-bold" style={{ color: colors.text }}>
                        {user?.name}
                      </p>
                      <p className="mt-1 truncate" style={{ color: colors.textMuted }}>
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block border-b px-4 py-3 font-semibold uppercase tracking-widest transition-opacity hover:opacity-60"
                      style={{ color: colors.text, borderColor: colors.line }}
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        toast.info("Logging you out…");
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full px-4 py-3 text-left font-semibold uppercase tracking-widest transition-opacity hover:opacity-60"
                      style={{ color: ORANGE }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Log in"
                className={`${iconBtn} hidden sm:flex`}
              >
                <svg {...ICON}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
                </svg>
              </Link>
            )}

            {isAuthenticated && (
              <Link href="/cart" aria-label="Cart" className={iconBtn}>
                <svg {...ICON}>
                  <path d="M5 8h14l-1 12H6L5 8z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                {badge(itemCount)}
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div
            className="border-t px-4 py-3 sm:px-8"
            style={{ borderColor: colors.line, backgroundColor: colors.bg }}
          >
            <div className="mx-auto flex max-w-[1600px] items-center gap-3">
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search hoodies, tees, caps…"
                className="w-full bg-transparent text-base focus:outline-none sm:text-sm"
                style={{ color: colors.text }}
              />
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: colors.text, color: colors.bg }}
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer (slides in from the left) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />

        <div
          className={`absolute left-0 top-0 flex h-[100dvh] w-[min(340px,88vw)] transform flex-col px-6 pt-5 shadow-2xl transition-transform duration-300 sm:w-[380px] sm:px-8 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            backgroundColor: colors.bg,
            overflowY: "auto",
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
          }}
        >
          {/* Close */}
          <div className="flex justify-end">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center border transition-opacity hover:opacity-60"
              style={{ color: colors.text, borderColor: colors.lineStrong }}
            >
              <svg {...ICON} width={16} height={16}>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="mt-6 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b py-3.5 font-display text-[15px] font-extrabold uppercase tracking-tight transition-opacity hover:opacity-60"
                style={{
                  borderColor: colors.line,
                  color: link.accent ? ORANGE : colors.text,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Account + contact, pinned to the bottom */}
          <div className="mt-auto space-y-3 pt-10 text-[13px]" style={{ color: colors.textMuted }}>
            {isAuthenticated ? (
              <>
                <div className="pb-1">
                  <p className="truncate text-sm font-semibold" style={{ color: colors.text }}>
                    {user?.name}
                  </p>
                  <p className="truncate text-xs">{user?.email}</p>
                </div>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="block transition-opacity hover:opacity-60">
                  My Account
                </Link>
                <button
                  type="button"
                  className="block transition-opacity hover:opacity-60"
                  onClick={() => {
                    setMenuOpen(false);
                    toast.info("Your wishlist is empty for now.");
                  }}
                >
                  Wishlist
                </button>
                <button
                  type="button"
                  className="block transition-opacity hover:opacity-60"
                  style={{ color: ORANGE }}
                  onClick={() => {
                    setMenuOpen(false);
                    toast.info("Logging you out…");
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block transition-opacity hover:opacity-60">
                Login / Sign up
              </Link>
            )}
            <a href="mailto:support@thehustlermerchandise.com" className="block transition-opacity hover:opacity-60">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}