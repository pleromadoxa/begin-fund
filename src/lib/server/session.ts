import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken, verifySessionToken } from "./crypto";
import { getStore } from "./store";
import type { SafeUser, User } from "../types";

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(userId), {
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
  const token = jar.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return getStore().findUserById(userId);
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}
