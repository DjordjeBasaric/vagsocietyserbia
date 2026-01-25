import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Allow access to login page if unauthenticated.
    if (request.nextUrl.pathname === "/admin/login") {
      // If already authenticated, bounce to admin home.
      if (token) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      const next = request.nextUrl.pathname + request.nextUrl.search;
      loginUrl.searchParams.set("next", next);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
