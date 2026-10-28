import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken, readSessionToken } from "./crypto";
import { getStore } from "./store";
import type { SafeUser, User } from "../types";

export async function setSessionCookie(userId: string, epoch = 0) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(userId, epoch), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const parsed = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!parsed) return null;
  const user = await getStore().findUserById(parsed.userId);
  if (!user) return null;
  // Revocation check: a token minted before the user's last epoch bump
  // (e.g. password reset) is dead even though its signature is valid.
  if ((user.sessionEpoch ?? 0) !== parsed.epoch) return null;
  return user;
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}
