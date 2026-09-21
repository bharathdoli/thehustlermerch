import { NextResponse } from "next/server";
import { auth } from "./backend/infrastructure/auth/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const pathname = req.nextUrl.pathname;

  // /admin requires an authenticated Admin — not just any logged-in user.
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "Admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Prevent logged-in users from opening login/register — send them home
  // (login page itself handles sending Admins to /admin specifically).
  if (isLoggedIn && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};