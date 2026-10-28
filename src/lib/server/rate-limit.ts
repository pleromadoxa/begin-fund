import { NextRequest, NextResponse } from "next/server";

/**
 * In-process fixed-window rate limiter.
 *
 * B.E.G.I.N runs as a single SSR container on The Stage, so one shared
 * module instance covers every request. Buckets are pruned lazily; the map
 * is capped so a flood of unique keys cannot grow memory unbounded.
 */

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 5_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Returns true when the caller is within the limit, false when throttled. */
export function rateLimit(key: string, limit: number, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
    // Still full? Drop the oldest bucket rather than growing further.
    if (buckets.size >= MAX_BUCKETS) {
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
  }
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** First client IP as seen by the platform proxy chain. */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export function tooManyRequests(retryAfterSeconds = 60): NextResponse {
  return NextResponse.json(
    { error: "Too many attempts — please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
