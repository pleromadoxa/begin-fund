import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/server/crypto";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { publicOrigin } from "@/lib/server/public-origin";

export const dynamic = "force-dynamic";

const DEV_FALLBACK_PASSPHRASE = "ministry-of-commerce";

/** Known template passphrases — refused in production. */
const KNOWN_PLACEHOLDERS = new Set([DEV_FALLBACK_PASSPHRASE, "changeme", "password"]);

/**
 * Committee passphrase. Production refuses to run with the public dev
 * placeholder — anyone who read the repo could open the committee panel.
 */
function committeePassphrase(): string {
  const configured = process.env.COMMITTEE_PASSPHRASE?.trim();
  if (configured && !KNOWN_PLACEHOLDERS.has(configured)) return configured;
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[admin] COMMITTEE_PASSPHRASE is not set — refusing committee login in production.",
    );
    return "";
  }
  return DEV_FALLBACK_PASSPHRASE;
}

export async function POST(request: NextRequest) {
  // Brute-force protection on the single shared passphrase:
  // 5 attempts per IP every 5 minutes.
  if (!rateLimit(`admin-login:${clientIp(request)}`, 5, 5 * 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "300" } },
    );
  }

  const passphrase = committeePassphrase();
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(passphrase, "utf8");
  const ok = passphrase.length > 0 && a.length === b.length && a.every((byte, i) => byte === b[i]);

  const base = new URL("/admin", publicOrigin(request));
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
