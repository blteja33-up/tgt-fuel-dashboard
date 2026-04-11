import { NextRequest, NextResponse } from "next/server";

// Simple middleware that only checks the cookie exists.
// Full session validation happens in the page components via getSession().
// This keeps middleware fast and works on Edge runtime.
export function middleware(req: NextRequest) {
  const token = req.cookies.get("tgt_session")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
