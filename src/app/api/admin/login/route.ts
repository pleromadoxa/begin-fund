import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/server/crypto";

export const dynamic = "force-dynamic";

const DEV_FALLBACK_PASSPHRASE = "ministry-of-commerce";

/**
 * Committee passphrase. Production refuses to run with the public dev
 * placeholder — anyone who read the repo could open the committee panel.
 */
function committeePassphrase(): string {
  const configured = process.env.COMMITTEE_PASSPHRASE?.trim();
  if (configured && configured !== DEV_FALLBACK_PASSPHRASE) return configured;
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[admin] COMMITTEE_PASSPHRASE is not set — refusing committee login in production.",
    );
    return "";
  }
  return DEV_FALLBACK_PASSPHRASE;
}

export async function POST(request: NextRequest) {
  const passphrase = committeePassphrase();
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(passphrase, "utf8");
  const ok = passphrase.length > 0 && a.length === b.length && a.every((byte, i) => byte === b[i]);

  const base = request.nextUrl.clone();
  base.pathname = "/admin";
  base.search = ok ? "" : "?error=1";

  const res = NextResponse.redirect(base, 303);
  if (ok) {
    res.cookies.set("begin_admin", createSessionToken("admin"), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
  }
  return res;
}
