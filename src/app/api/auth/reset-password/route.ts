import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { hashPassword } from "@/lib/server/crypto";
import { consumeResetToken } from "@/lib/server/password-reset";

/**
 * POST /api/auth/reset-password { token, password }
 * Consumes the single-use token and sets the new password.
 */
async function post(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "");
  const password = String(body?.password ?? "");

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

  const user = await getStore().updateUser(userId, { passwordHash: hashPassword(password) });
  if (!user)
    return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export const POST = storeGuard(post);
