import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { hashPassword } from "@/lib/server/crypto";
import { consumeResetToken } from "@/lib/server/password-reset";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

/**
 * POST /api/auth/reset-password { token, password }
 * Consumes the single-use token, sets the new password and bumps the
 * session epoch — every existing session for the account dies at once.
 */
async function post(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "");
  const password = String(body?.password ?? "");

  if (!rateLimit(`reset:${clientIp(req)}`, 5, 5 * 60_000)) return tooManyRequests(300);

  if (!token) return NextResponse.json({ error: "Reset link is invalid." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json(
      { error: "Your password must be at least 8 characters long." },
      { status: 400 },
    );

  const userId = await consumeResetToken(token);
  if (!userId)
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 },
    );

  const user = await getStore().updateUser(userId, {
    passwordHash: await hashPassword(password),
    sessionEpoch: Date.now(),
  });
  if (!user)
    return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export const POST = storeGuard(post);
