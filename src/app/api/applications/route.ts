import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/server/session";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import type { Application, ApplicationStatus, TimelineEvent, Tier } from "@/lib/types";

function makeReference(): string {
  const y = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BGN-${y}-${n}`;
}

/** Funding tier bands — enforced server-side, not just in the browser. */
const TIER_RANGES: Record<Tier, { min: number; max: number; label: string }> = {
  1: { min: 10000, max: 50000, label: "GHS 10,000–50,000" },
  2: { min: 50001, max: 100000, label: "GHS 50,001–100,000" },
  3: { min: 100001, max: Infinity, label: "GHS 100,001+" },
};

function parseTier(raw: unknown): Tier | null {
  const n = Number(raw);
  return n === 1 || n === 2 || n === 3 ? (n as Tier) : null;
}

async function get() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const application = await getStore().getApplicationByUser(user.id);
  return NextResponse.json({ application });
}

export const GET = storeGuard(get);

async function put(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Autosave fires as the applicant moves between steps — generous limit,
  // but still caps scripted floods against the Cellar budget.
  if (!rateLimit(`apply:${user.id}`, 60, 60_000)) return tooManyRequests(60);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const submit = body.submit === true;
  const data = (body.data ?? {}) as Record<string, unknown>;
  const tier = parseTier(data.tier);
  const amount = data.amountRequested != null && data.amountRequested !== ""
    ? Number(data.amountRequested)
    : null;

  if (submit) {
    if (!tier)
      return NextResponse.json(
        { error: "Please choose a valid funding tier (1, 2 or 3)." },
        { status: 400 },
      );
    if (amount == null || !Number.isFinite(amount) || amount <= 0)
      return NextResponse.json(
        { error: "Please enter the specific amount you require." },
        { status: 400 },
      );
    const band = TIER_RANGES[tier];
    if (amount < band.min || amount > band.max)
      return NextResponse.json(
        { error: `For Tier ${tier}, the amount must fall within ${band.label}.` },
        { status: 400 },
      );
    const required = ["businessName", "loanPurpose", "amountRequested", "guarantorName"];
    for (const key of required) {
      if (!data[key])
        return NextResponse.json(
          { error: "Some required fields are missing. Please review your application." },
          { status: 400 },
        );
    }
  }

  const store = getStore();
  const existing = await store.getApplicationByUser(user.id);
  const statusNow: ApplicationStatus = existing?.status ?? "draft";
  const now = new Date().toISOString();

  if (submit) {
    // Submissions are allowed for: no application yet, a draft, or an
    // application the committee sent back for more information.
    const resumable = statusNow === "draft" || statusNow === "more_info_required";
    if (existing && !resumable) {
      return NextResponse.json(
        { error: "You already have an application under review." },
        { status: 409 },
      );
    }
  }

  // Draft saves NEVER change a non-draft status (a committee "more info"
  // request must not be silently erased by an autosave on Continue).
  const resubmitting = submit && statusNow === "more_info_required";
  const status: ApplicationStatus = submit
    ? resubmitting
      ? "under_review"
      : "submitted"
    : statusNow;

  const timeline: TimelineEvent[] = existing?.timeline ? [...existing.timeline] : [];
  if (submit) {
    timeline.push({
      status,
      at: now,
      note: resubmitting
        ? "Additional information received — returned to the committee."
        : "Received by the B.E.G.I.N committee.",
    });
  } else if (!existing) {
    timeline.push({ status: "draft", at: now, note: "Application started." });
  }

  const patch: Partial<Application> = {
    status,
    tier,
    loanPurpose: String(data.loanPurpose ?? ""),
    businessName: String(data.businessName ?? user.businessName),
    amountRequested: amount,
    submittedAt: submit ? existing?.submittedAt ?? now : existing?.submittedAt ?? null,
    timeline,
    data,
  };

  let application: Application | null;
  if (existing) {
    application = await store.updateApplication(user.id, patch);
  } else {
    // Reference collision guard — retry a fresh number if taken.
    let reference = makeReference();
    for (let attempt = 0; attempt < 5; attempt++) {
      if (!(await store.referenceExists(reference))) break;
      reference = makeReference();
    }
    application = await store.createApplication({
      id: `app_${randomUUID()}`,
      userId: user.id,
      reference,
      updatedAt: now,
      reviewNote: null,
      ...patch,
    } as Application);
  }

  return NextResponse.json({ application });
}

export const PUT = storeGuard(put);
