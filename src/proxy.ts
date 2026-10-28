import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/apply"];

/**
 * Edge gate for auth-driven pages. Verifies the full HMAC signature and
 * expiry with Web Crypto (no node:crypto here — proxy runs on the edge
 * runtime). Server pages re-verify through `getCurrentUser()`, which also
 * checks the per-user revocation epoch; this gate just keeps forgers and
 * expired tokens out of the page render path entirely.
 */
async function sessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [userId, expiry, epoch, signature] = parts;
  if (!userId || !/^\d+$/.test(expiry) || !/^\d+$/.test(epoch) || !signature) return false;
  if (Date.now() > Number(expiry)) return false;

  const secret = process.env.SESSION_SECRET?.trim();
  const devPlaceholder =
    !secret ||
    secret === "begin-dev-secret-change-me-in-production-9d4f2a" ||
    secret === "begin-change-me-to-a-long-random-string";
  // Dev convenience: with no configured secret, accept any well-formed token
  // (the server layer still resolves the user). Production always verifies.
  if (devPlaceholder) return process.env.NODE_ENV !== "production";

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${userId}.${expiry}.${epoch}`));
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
  // Length-safe constant-time compare.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const session = req.cookies.get("begin_session")?.value;
  if (!(await sessionValid(session))) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*"],
};
