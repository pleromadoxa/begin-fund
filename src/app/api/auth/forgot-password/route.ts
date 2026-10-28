import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { createResetToken } from "@/lib/server/password-reset";
import { sendMail } from "@/lib/server/mail";
import { passwordResetEmail } from "@/lib/server/email-templates";

/**
 * POST /api/auth/forgot-password { email }
 * Always answers ok — never reveals whether the account exists.
 */
async function post(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const user = await getStore().findUserByEmail(email);
  if (user) {
    try {
      const token = await createResetToken(user.id);
      const mail = await sendMail({
        to: user.email,
        ...passwordResetEmail(user.fullName, token),
        tags: ["transactional", "password_reset"],
      });
      if (!mail.ok) console.warn(`[auth] reset email failed: ${mail.error}`);
    } catch (error) {
      console.error(`[auth] reset token failed: ${(error as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true });
}

export const POST = storeGuard(post);
