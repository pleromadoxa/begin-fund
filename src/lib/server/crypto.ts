import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";

const DEV_FALLBACK_SECRET = "begin-dev-secret-change-me-in-production-9d4f2a";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

/** Every publicly known placeholder — none may ever sign production sessions. */
const KNOWN_PLACEHOLDERS = new Set([
  DEV_FALLBACK_SECRET,
  "begin-change-me-to-a-long-random-string",
  "changeme",
  "secret",
]);

/**
 * Fail closed in production: without a real secret anyone could mint a valid
 * session cookie for any user (including "admin"), so we refuse to sign or
 * verify rather than silently fall back to a public constant. Local dev keeps
 * the placeholder so `npm run dev` works with no setup.
 */
function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && !KNOWN_PLACEHOLDERS.has(secret)) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not set. Generate one (e.g. `openssl rand -hex 32`) and set it " +
        "in the environment before serving production traffic — session cookies are " +
        "unsigned without it, which would allow account forgery.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

/** Async scrypt — never blocks the event loop (login is a CPU-heavy path). */
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await derive(password, salt)).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = await derive(password, salt);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex").slice(0, 32);
}

/**
 * Session tokens are `userId.expiry.epoch.signature`.
 * `epoch` mirrors the user's `session_epoch` — bumping it (e.g. on password
 * reset) instantly invalidates every previously issued session for that user.
 */
export function createSessionToken(userId: string, epoch = 0): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiry}.${epoch}`;
  return `${payload}.${sign(payload)}`;
}

export interface ParsedSession {
  userId: string;
  epoch: number;
}

export function readSessionToken(token: string | undefined): ParsedSession | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, expiry, epoch, signature] = parts;
  if (!userId || !expiry || !epoch || !signature) return null;
  const payload = `${userId}.${expiry}.${epoch}`;
  const expected = Buffer.from(sign(payload), "utf8");
  const given = Buffer.from(signature, "utf8");
  // Constant-time compare so the signature cannot be probed byte-by-byte.
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!/^\d+$/.test(expiry) || Date.now() > Number(expiry)) return null;
  if (!/^\d+$/.test(epoch)) return null;
  return { userId, epoch: Number(epoch) };
}

export function verifySessionToken(token: string | undefined): string | null {
  return readSessionToken(token)?.userId ?? null;
}

export const SESSION_COOKIE = "begin_session";
export { SESSION_TTL_MS };
