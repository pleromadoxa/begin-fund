import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/server/crypto";

export const dynamic = "force-dynamic";

const COMMITTEE_PASSPHRASE =
  process.env.COMMITTEE_PASSPHRASE ?? "ministry-of-commerce";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(COMMITTEE_PASSPHRASE, "utf8");
  const ok = a.length === b.length && a.every((byte, i) => byte === b[i]);

  const base = request.nextUrl.clone();
  base.pathname = "/admin";
  base.search = ok ? "" : "?error=1";

  const res = NextResponse.redirect(base, 303);
  if (ok) {
    res.cookies.set("begin_admin", createSessionToken("admin"), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
  }
  return res;
}
