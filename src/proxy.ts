import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/apply"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const session = req.cookies.get("begin_session")?.value;
  if (!session) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*"],
};
