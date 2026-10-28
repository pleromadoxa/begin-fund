import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { verifyPassword } from "@/lib/server/crypto";
import { setSessionCookie, toSafeUser } from "@/lib/server/session";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

async function post(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  // Brute-force protection: 10 attempts per IP every 5 minutes.
  if (!rateLimit(`signin:${clientIp(req)}`, 10, 5 * 60_000)) return tooManyRequests(300);

  const user = await getStore().findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash)))
    return NextResponse.json(
      { error: "Incorrect email or password. Please try again." },
      { status: 401 },
    );

  await setSessionCookie(user.id, user.sessionEpoch ?? 0);
  return NextResponse.json({ user: toSafeUser(user) });
}

export const POST = storeGuard(post);
