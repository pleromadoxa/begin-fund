import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "begin-dev-secret-change-me-in-production-9d4f2a";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

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
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex").slice(0, 32);
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
  if (sign(payload) !== signature) return null;
  if (Date.now() > Number(expiry)) return null;
  return userId;
}

export const SESSION_COOKIE = "begin_session";
export { SESSION_TTL_MS };
