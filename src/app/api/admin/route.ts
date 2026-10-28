import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server/store";
import { verifySessionToken } from "@/lib/server/crypto";
import { getAdminRows } from "@/lib/server/admin-rows";
import { storeGuard } from "@/lib/server/api-guard";
import { sendMail } from "@/lib/server/mail";
import { approvalEmail, rejectionEmail, moreInfoEmail } from "@/lib/server/email-templates";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "more_info_required",
  "approved",
  "rejected",
];

function admin(request: NextRequest): boolean {
  const token = request.cookies.get("begin_admin")?.value;
  if (!token) return false;
  return verifySessionToken(token) === "admin";
}

async function get(request: NextRequest) {
  if (!admin(request)) {
    return NextResponse.json({ error: "Committee access required" }, { status: 401 });
  }
  return NextResponse.json(await getAdminRows());
}

export const GET = storeGuard(get);

async function patch(request: NextRequest) {
  if (!admin(request)) {
    return NextResponse.json({ error: "Committee access required" }, { status: 401 });
  }
  const body = await request.json();
  const { id, status, note } = body as {
    id?: string;
    status?: ApplicationStatus;
    note?: string;
  };

  if (!id || !status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const store = getStore();
  const app = await store.getApplicationById(id);
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const updated = await store.adminUpdateApplication(id, {
    status,
    // Keep the existing note unless the committee writes a new one — a
    // decision must not wipe the record of what was previously asked.
    reviewNote:
      status === "more_info_required"
        ? note || "Additional information required"
        : note?.trim()
          ? note.trim()
          : app.reviewNote ?? "",
    timeline: [
      ...app.timeline,
      {
        at: new Date().toISOString(),
        status,
        note: note?.trim() || undefined,
      },
    ],
  });

  // Decision email to the applicant (Zipper Mail) — non-fatal on failure.
  let emailSent = false;
  const applicant = await store.findUserById(app.userId);
  if (applicant) {
    const content =
      status === "approved"
        ? approvalEmail(
            applicant.fullName,
            app.businessName,
            updated?.tier ?? app.tier,
            app.reference,
            app.amountRequested,
          )
        : status === "rejected"
          ? rejectionEmail(applicant.fullName, app.businessName, app.reference)
          : moreInfoEmail(
              applicant.fullName,
              app.businessName,
              app.reference,
              note || "Additional information required",
            );
    const mail = await sendMail({
      to: applicant.email,
      ...content,
      tags: ["transactional", `decision_${status}`],
    });
    emailSent = mail.ok;
    if (!mail.ok) console.warn(`[admin] decision email failed: ${mail.error}`);
  }

  return NextResponse.json({ ok: true, status: updated?.status, emailSent });
}

export const PATCH = storeGuard(patch);
