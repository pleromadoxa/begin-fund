import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/server/crypto";
import { storeGuard } from "@/lib/server/api-guard";
import { sendMail, ADMIN_EMAIL } from "@/lib/server/mail";
import {
  welcomeEmail,
  passwordResetEmail,
  approvalEmail,
} from "@/lib/server/email-templates";

export const dynamic = "force-dynamic";

function admin(request: NextRequest): boolean {
  const token = request.cookies.get("begin_admin")?.value;
  return !!token && verifySessionToken(token) === "admin";
}

/**
 * POST /api/admin/test-email { kind: "welcome" | "password_reset" | "approval", to? }
 * Committee-only. Renders the real production template and sends it through
 * the normal Zipper Mail path — used to preview templates in a live inbox.
 */
async function post(request: NextRequest) {
  if (!admin(request)) {
    return NextResponse.json({ error: "Committee access required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const kind = String(body?.kind ?? "");
  const to = String(body?.to ?? ADMIN_EMAIL() ?? "").trim();

  const content =
    kind === "welcome"
      ? welcomeEmail("Kwame Mensah", "Grace Ventures")
      : kind === "password_reset"
        ? passwordResetEmail("Kwame Mensah", `test-${Date.now()}`)
        : kind === "approval"
          ? approvalEmail("Kwame Mensah", "Grace Ventures", 2, "BG-2026-TEST", 25000)
          : null;

  if (!content) {
    return NextResponse.json(
      { error: "Unknown template kind — use welcome, password_reset or approval." },
      { status: 400 },
    );
  }
  if (!to) {
    return NextResponse.json({ error: "No recipient address." }, { status: 400 });
  }

  const result = await sendMail({
    to,
    ...content,
    tags: ["transactional", "test"],
  });

  return NextResponse.json({ ...result, to, subject: content.subject });
}

export const POST = storeGuard(post);
