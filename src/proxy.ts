import { NextResponse } from "next/server";

import { auth } from "./backend/infrastructure/auth/auth"

export default auth((req) => {

  const isLoggedIn = !!req.auth;

  const pathname = req.nextUrl.pathname;

  // Protected Routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  ) {

    if (!isLoggedIn) {

      return NextResponse.redirect(
        new URL("/login", req.url)
      );

    }

  }

  // Prevent logged in users from opening login/register

  if (
    isLoggedIn &&
    (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    )
  ) {

    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );

  }

  return NextResponse.next();

});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};