import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { verifyPassword } from "@/lib/server/crypto";
import { setSessionCookie, toSafeUser } from "@/lib/server/session";

async function post(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const user = await getStore().findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash))
    return NextResponse.json(
      { error: "Incorrect email or password. Please try again." },
      { status: 401 },
    );

  await setSessionCookie(user.id);
  return NextResponse.json({ user: toSafeUser(user) });
}

export const POST = storeGuard(post);
