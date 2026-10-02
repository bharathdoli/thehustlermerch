"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/src/context/CartContext";
import { SIGNAL, useTheme, ThemeToggle } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/#categories" },
  { label: "Custom Merch", href: "/#custom" },
  { label: "About", href: "/#story" },
  { label: "FAQs", href: "/#faqs" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const { colors } = useTheme();

  /* Toasts, router and search state (added) */
  const toast = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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

  /* Prevent background scrolling when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* Close account dropdown when clicking outside */
  useEffect(() => {
    if (!accountOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        borderColor: colors.line,
        /*
         * IMPORTANT:
         * Use a solid background instead of hexToRgba(..., 0.95)
         * so the page content cannot show through on mobile.
         */
        backgroundColor: colors.bg,
        backgroundImage: "none",
        /* Keep header clear of notches / status bars (added) */
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <ThemeToggle />

      {/* Main header */}
      <div
        className="
          mx-auto
          flex
          min-h-[64px]
          w-full
          max-w-7xl
          items-center
          justify-between
          gap-3
          px-4
          py-3
          sm:min-h-[72px]
          sm:px-6
          sm:py-4
          lg:px-8
        "
      >
        {/* Logo */}
        <Link
          href="/"
          className="
            min-w-0
            max-w-[48vw]
            shrink
            truncate
            font-display
            text-xl
            uppercase
            tracking-tight
            sm:max-w-none
            sm:text-2xl
          "
          style={{ color: colors.text }}
        >
          The Hustler<span style={{ color: SIGNAL }}>.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="
            hidden
            items-center
            gap-5
            md:flex
            lg:gap-8
          "
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="
                whitespace-nowrap
                font-mono
                text-[11px]
                uppercase
                tracking-widest
                transition-opacity
                hover:opacity-100
                lg:text-xs
              "
              style={{
                color: colors.textMuted,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
            sm:gap-4
            lg:gap-5
          "
        >
          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-sm
              transition-opacity
              hover:opacity-80
              sm:h-auto
              sm:w-auto
            "
            style={{
              color: colors.text,
              opacity: 0.85,
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Desktop Account */}
          {isAuthenticated ? (
            <div
              className="relative hidden sm:block"
              ref={accountRef}
            >
              <button
                type="button"
                aria-label="Account"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
                className="
                  flex
                  items-center
                  gap-1.5
                  transition-opacity
                  hover:opacity-80
                "
                style={{ color: colors.text }}
              >
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    font-mono
                    text-[10px]
                    font-bold
                  "
                  style={{
                    backgroundColor: SIGNAL,
                    color: "#131210",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Account Dropdown */}
              {accountOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    z-50
                    mt-3
                    w-64
                    border
                    font-mono
                    text-xs
                    shadow-xl
                  "
                  style={{
                    borderColor: colors.lineStrong,
                    backgroundColor: colors.bg,
                    backgroundImage: "none",
                    /* Never wider than the viewport (added) */
                    maxWidth: "calc(100vw - 2rem)",
                  }}
                >
                  <div
                    className="border-b p-4"
                    style={{ borderColor: colors.line }}
                  >
                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        tracking-wide
                      "
                      style={{ color: colors.text }}
                    >
                      {user?.name}
                    </p>

                    <p
                      className="mt-1 truncate tracking-wide"
                      style={{ color: colors.textMuted }}
                    >
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="
                      block
                      w-full
                      border-b
                      px-4
                      py-3
                      text-left
                      uppercase
                      tracking-widest
                      transition-opacity
                      hover:opacity-70
                    "
                    style={{
                      color: colors.text,
                      borderColor: colors.line,
                    }}
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
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      uppercase
                      tracking-widest
                      transition-opacity
                      hover:opacity-70
                    "
                    style={{ color: SIGNAL }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Login */
            <Link
              aria-label="Log in"
              href="/login"
              className="
                hidden
                transition-opacity
                hover:opacity-80
                sm:block
              "
              style={{
                color: colors.text,
                opacity: 0.85,
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
              </svg>
            </Link>
          )}

          {/*
            Wishlist - desktop/tablet.
            Only rendered when the user is logged in — a logged-out
            visitor has no account to attach a wishlist to, so the
            icon (and its badge) is hidden entirely rather than shown
            in a disabled/empty state.
          */}
          {isAuthenticated && (
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => toast.info("Your wishlist is empty for now.")}
              className="
                relative
                hidden
                transition-opacity
                hover:opacity-80
                sm:block
              "
              style={{
                color: colors.text,
                opacity: 0.85,
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 20s-7-4.4-9.5-8.8C.8 7.8 2.4 4.5 5.8 4c2-.3 3.7.7 4.9 2.3C11.9 4.7 13.6 3.7 15.6 4c3.4.5 5 3.8 3.3 7.2C17.4 15.6 12 20 12 20z" />
              </svg>

              <span
                className="
                  absolute
                  -right-2
                  -top-2
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full
                  font-mono
                  text-[9px]
                  font-bold
                "
                style={{
                  backgroundColor: SIGNAL,
                  color: "#131210",
                }}
              >
                0
              </span>
            </button>
          )}

          {/* Cart - visible only when logged in */}
          {isAuthenticated && (
            <Link
              href="/cart"
              aria-label="Cart"
              className="
      relative
      flex
      h-9
      w-9
      items-center
      justify-center
      transition-opacity
      hover:opacity-80
      sm:h-auto
      sm:w-auto
    "
              style={{
                color: colors.text,
                opacity: 0.85,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6 5 2H2" />
                <circle cx="9" cy="20" r="1.3" />
                <circle cx="17" cy="20" r="1.3" />
              </svg>

              <span
                className="
        absolute
        -right-1
        -top-1
        flex
        h-4
        w-4
        items-center
        justify-center
        rounded-full
        font-mono
        text-[9px]
        font-bold
        sm:-right-2
        sm:-top-2
      "
                style={{
                  backgroundColor: SIGNAL,
                  color: "#131210",
                }}
              >
                {itemCount}
              </span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              transition-opacity
              hover:opacity-80
              md:hidden
            "
            style={{
              color: colors.text,
              opacity: 0.85,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div
          className="
            border-t
            px-4
            py-3
            sm:px-6
            lg:px-8
          "
          style={{
            borderColor: colors.line,
            backgroundColor: colors.bg,
            backgroundImage: "none",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }

                if (e.key === "Escape") {
                  setSearchOpen(false);
                }
              }}
              placeholder="Search hoodies, tees, caps…"
              className="
                w-full
                bg-transparent
                font-mono
                text-sm
                focus:outline-none
              "
              style={{
                color: colors.text,
              }}
            />
          </div>
        </div>
      )}

      {/* =========================
          MOBILE DRAWER
         ========================= */}
      <div
        className={`
          fixed
          inset-0
          z-50
          transition-opacity
          duration-300
          ${menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
          }
        `}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`
            absolute
            right-0
            top-0
            flex
            h-[100dvh]
            w-[min(340px,88vw)]
            flex-col
            transform
            p-5
            shadow-2xl
            transition-transform
            duration-300
            sm:w-80
            sm:p-6
            ${menuOpen
              ? "translate-x-0"
              : "translate-x-full"
            }
          `}
          style={{
            /*
             * Fully opaque mobile background.
             * This prevents the page/hero content from
             * showing through the drawer.
             */
            backgroundColor: colors.bg,
            backgroundImage: "none",
            borderLeft: `1px solid ${colors.line}`,
            /* Scroll inside the drawer on short screens (added) */
            overflowY: "auto",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          }}
        >
          {/* Drawer Header */}
          <div className="mb-6 flex items-center justify-between sm:mb-8">
            <span
              className="
                font-display
                text-lg
                uppercase
                sm:text-xl
              "
              style={{ color: colors.text }}
            >
              Menu
            </span>

            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                transition-opacity
                hover:opacity-80
              "
              style={{ color: colors.textMuted }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="
                  border-b
                  py-4
                  font-mono
                  text-xs
                  uppercase
                  tracking-widest
                  transition-opacity
                  hover:opacity-100
                "
                style={{
                  borderColor: colors.line,
                  color: colors.textMuted,
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Account */}
            <div
              className="
                mt-5
                border-t
                pt-5
              "
              style={{
                borderColor: colors.line,
              }}
            >
              {isAuthenticated ? (
                <>
                  <p
                    className="
                      truncate
                      font-mono
                      text-xs
                      font-bold
                      tracking-widest
                    "
                    style={{
                      color: colors.text,
                    }}
                  >
                    {user?.name}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      font-mono
                      text-[11px]
                      tracking-widest
                    "
                    style={{
                      color: colors.textMuted,
                    }}
                  >
                    {user?.email}
                  </p>

                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="
                      mt-4
                      block
                      font-mono
                      text-xs
                      uppercase
                      tracking-widest
                    "
                    style={{
                      color: colors.text,
                    }}
                  >
                    My Account
                  </Link>

                  {/* Wishlist entry for mobile (added) - the header icon is hidden below sm */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      toast.info("Your wishlist is empty for now.");
                    }}
                    className="
                      mt-4
                      block
                      font-mono
                      text-xs
                      uppercase
                      tracking-widest
                    "
                    style={{
                      color: colors.text,
                    }}
                  >
                    Wishlist
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      toast.info("Logging you out…");
                      signOut({ callbackUrl: "/" });
                    }}
                    className="
                      mt-4
                      font-mono
                      text-xs
                      uppercase
                      tracking-widest
                    "
                    style={{
                      color: SIGNAL,
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="
                    font-mono
                    text-xs
                    uppercase
                    tracking-widest
                  "
                  style={{
                    color: colors.text,
                  }}
                >
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}