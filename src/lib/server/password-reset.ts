import { createHash, randomBytes, randomUUID } from "crypto";

/**
 * Password-reset tokens — sealed in The Cellar (`password_resets` chamber).
 * Only a SHA-256 hash of each token is stored; the raw token appears solely
 * in the reset email. Single-use, 60-minute expiry.
 */

const REST = () => (process.env.CELLAR_REST_URL || "").replace(/\/+$/, "");
const SEAL = () => process.env.CELLAR_SEAL || "";

const headers = () => ({
  apikey: SEAL(),
  Authorization: `Bearer ${SEAL()}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** Issues a fresh reset token for a user; returns the raw token (send by email). */
export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const res = await fetch(`${REST()}/password_resets`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      id: `rst_${randomUUID()}`,
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`password_resets insert failed (${res.status})`);
  }
  return token;
}

/**
 * Validates and consumes a reset token. Returns the user id on success,
 * null when the token is unknown, expired or already used.
 */
export async function consumeResetToken(token: string): Promise<string | null> {
  const res = await fetch(
    `${REST()}/password_resets?token_hash=eq.${hashToken(token)}&used=eq.false&limit=1`,
    { headers: { apikey: SEAL(), Authorization: `Bearer ${SEAL()}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const rows = (await res.json().catch(() => [])) as {
    user_id: string;
    expires_at: string;
  }[];
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  // Mark used — single-use guarantee.
  const used = await fetch(`${REST()}/password_resets?token_hash=eq.${hashToken(token)}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ used: true }),
    cache: "no-store",
  });
  if (!used.ok) return null;
  return row.user_id;
}
