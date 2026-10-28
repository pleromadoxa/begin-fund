import type { NextRequest } from "next/server";

/**
 * Public origin for redirects. Behind The Stage SSR gate the app's own URL
 * is `127.0.0.1:<app port>`, so `request.url`/`nextUrl` would produce
 * Location headers pointing inside the container. Prefer the forwarded
 * public hostname the visitor actually used.
 */
export function publicOrigin(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${host}`;
}
