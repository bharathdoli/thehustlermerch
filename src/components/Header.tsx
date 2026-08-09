"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { SIGNAL, hexToRgba, useTheme, ThemeToggle } from "@/src/context/ThemeContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/#categories" },
  { label: "Custom Merch", href: "/#custom" },
  { label: "About", href: "/#story" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ borderColor: colors.line, backgroundColor: hexToRgba(colors.bg, 0.95) }}
    >
      {/* Global theme toggle lives here so it's on every page */}
      <ThemeToggle />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-2xl uppercase tracking-tight" style={{ color: colors.text }}>
          The Hustler<span style={{ color: SIGNAL }}>.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-xs uppercase tracking-widest transition hover:opacity-100"
              style={{ color: colors.textMuted }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="transition hover:opacity-80"
            style={{ color: colors.text, opacity: 0.8 }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          {isAuthenticated ? (
            <button
              aria-label="Log out"
              title={`Signed in as ${user?.name} — click to log out`}
              onClick={logout}
              className="hidden items-center gap-1.5 transition hover:opacity-80 sm:flex"
              style={{ color: colors.text }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </button>
          ) : (
            <Link aria-label="Log in" href="/login" className="hidden transition hover:opacity-80 sm:block" style={{ color: colors.text, opacity: 0.8 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
              </svg>
            </Link>
          )}
          <button aria-label="Wishlist" className="relative hidden transition hover:opacity-80 sm:block" style={{ color: colors.text, opacity: 0.8 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20s-7-4.4-9.5-8.8C.8 7.8 2.4 4.5 5.8 4c2-.3 3.7.7 4.9 2.3C11.9 4.7 13.6 3.7 15.6 4c3.4.5 5 3.8 3.3 7.2C17.4 15.6 12 20 12 20z" />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9px] font-bold" style={{ backgroundColor: SIGNAL, color: "#131210" }}>0</span>
          </button>
          <Link href="/cart" aria-label="Cart" className="relative transition hover:opacity-80" style={{ color: colors.text, opacity: 0.8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6 5 2H2" />
              <circle cx="9" cy="20" r="1.3" />
              <circle cx="17" cy="20" r="1.3" />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9px] font-bold" style={{ backgroundColor: SIGNAL, color: "#131210" }}>
              {itemCount}
            </span>
          </Link>
          <button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="transition hover:opacity-80 md:hidden" style={{ color: colors.text, opacity: 0.8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t px-5 py-3 sm:px-8" style={{ borderColor: colors.line }}>
          <input
            autoFocus
            type="search"
            placeholder="Search hoodies, tees, caps…"
            className="w-full bg-transparent font-mono text-sm focus:outline-none"
            style={{ color: colors.text }}
          />
        </div>
      )}

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 transition ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-72 max-w-[85vw] transform p-6 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ backgroundColor: colors.bg }}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-xl uppercase" style={{ color: colors.text }}>Menu</span>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="transition hover:opacity-80" style={{ color: colors.textMuted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b py-3 font-mono text-xs uppercase tracking-widest transition hover:opacity-100"
                style={{ borderColor: colors.line, color: colors.textMuted }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}