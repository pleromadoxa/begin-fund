import { NextResponse } from "next/server";
import { CellarError } from "./tinyzipper-store";

/**
 * Wraps an API route handler so Cellar failures answer with a structured,
 * client-friendly response instead of a bare 500:
 *   - 429 / 503 (busy or cellar_timeout) -> 503 + Retry-After: 1
 *   - anything else -> 500 with a generic message (details stay in the logs,
 *     where the Server-Timing hints were already printed).
 */
export function storeGuard<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof CellarError) {
        const busy = error.status === 429 || error.status === 503;
        return NextResponse.json(
          {
            error: busy
              ? "The database is busy right now — please try again in a moment."
              : "A database error occurred. Please try again.",
          },
          {
            status: busy ? 503 : 500,
            headers: busy ? { "Retry-After": "1" } : undefined,
          },
        );
      }
      throw error;
    }
  };
}
