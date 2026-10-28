/**
 * Validates the `?next=` redirect target after authentication.
 * Only same-site absolute paths are allowed — `//evil.com`,
 * `/\evil.com` and `https://…` are rejected to prevent open redirects.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (raw.includes("\\") || /\/\//.test(raw)) return fallback;
  if (!/^[\w\-./~%?=&+#]*$/.test(raw)) return fallback;
  return raw;
}
