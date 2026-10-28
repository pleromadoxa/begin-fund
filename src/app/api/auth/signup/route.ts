import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { CellarError } from "@/lib/server/tinyzipper-store";
import { hashPassword } from "@/lib/server/crypto";
import { setSessionCookie, toSafeUser } from "@/lib/server/session";
import { sendMail } from "@/lib/server/mail";
import { welcomeEmail } from "@/lib/server/email-templates";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const ghanaPhone = /^(\+233|0)\d{9}$/;

async function post(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim().replace(/[\s-]/g, "");
  const businessName = String(body.businessName ?? "").trim();
  const password = String(body.password ?? "");

  // Signup is expensive (scrypt + welcome email) — tight limit per IP.
  if (!rateLimit(`signup:${clientIp(req)}`, 5, 15 * 60_000)) return tooManyRequests(900);

  if (!fullName || fullName.length < 3)
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!ghanaPhone.test(phone))
    return NextResponse.json(
      { error: "Please enter a valid Ghana phone number (e.g. 0241234567 or +233241234567)." },
      { status: 400 },
    );
  if (!businessName || businessName.length < 2)
    return NextResponse.json({ error: "Please enter your business name." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json(
      { error: "Your password must be at least 8 characters long." },
      { status: 400 },
    );

  const store = getStore();
  if (await store.findUserByEmail(email))
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 409 },
    );

  let user;
  try {
    user = await store.createUser({
      id: `usr_${randomUUID()}`,
      fullName,
      email,
      phone,
      businessName,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    // Concurrent duplicate signup: the loser surfaces as a constraint
    // violation — answer with the same friendly 409, not a 500.
    const conflict =
      error instanceof CellarError &&
      (error.status === 409 || (error.body as { code?: string } | null)?.code === "23505");
    if (conflict) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in." },
        { status: 409 },
      );
    }
    throw error;
  }

  await setSessionCookie(user.id, user.sessionEpoch ?? 0);

  // Welcome email (Zipper Mail) — non-fatal if delivery fails.
  const mail = await sendMail({
    to: user.email,
    ...welcomeEmail(user.fullName, user.businessName),
    tags: ["transactional", "welcome"],
  });
  if (!mail.ok) console.warn(`[signup] welcome email failed: ${mail.error}`);

  return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
}

export const POST = storeGuard(post);
