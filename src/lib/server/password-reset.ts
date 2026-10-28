import { getStore } from "./store";

/**
 * Password-reset tokens — sealed in The Cellar (`password_resets` chamber).
 * Only a SHA-256 hash of each token is stored; the raw token appears solely
 * in the reset email. Single-use, 60-minute expiry.
 *
 * Delegates to the active store (Cellar or local) so the flow works in both
 * modes — the Cellar implementation consumes tokens atomically.
 */

/** Issues a fresh reset token for a user; returns the raw token (send by email). */
export function createResetToken(userId: string): Promise<string> {
  return getStore().createResetToken(userId);
}

/**
 * Validates and consumes a reset token. Returns the user id on success,
 * null when the token is unknown, expired or already used.
 */
export function consumeResetToken(token: string): Promise<string | null> {
  return getStore().consumeResetToken(token);
}
