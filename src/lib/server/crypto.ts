import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const DEV_FALLBACK_SECRET = "begin-dev-secret-change-me-in-production-9d4f2a";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

/**
 * Fail closed in production: without a real secret anyone could mint a valid
 * session cookie for any user (including "admin"), so we refuse to sign or
 * verify rather than silently fall back to a public constant. Local dev keeps
 * the placeholder so `npm run dev` works with no setup.
 */
function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret !== DEV_FALLBACK_SECRET) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not set. Generate one (e.g. `openssl rand -hex 32`) and set it " +
        "in the environment before serving production traffic — session cookies are " +
        "unsigned without it, which would allow account forgery.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex").slice(0, 32);
}

export function createSessionToken(userId: string): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiry, signature] = parts;
  const payload = `${userId}.${expiry}`;
  const expected = Buffer.from(sign(payload), "utf8");
  const given = Buffer.from(signature ?? "", "utf8");
  // Constant-time compare so the signature cannot be probed byte-by-byte.
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!/^\d+$/.test(expiry) || Date.now() > Number(expiry)) return null;
  return userId;
}

export const SESSION_COOKIE = "begin_session";
export { SESSION_TTL_MS };
