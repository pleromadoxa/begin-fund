import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/server/session";
import { getStore } from "@/lib/server/store";
import { storeGuard } from "@/lib/server/api-guard";
import type { Application, ApplicationStatus, TimelineEvent, Tier } from "@/lib/types";

function makeReference(): string {
  const y = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BGN-${y}-${n}`;
}

const STATUS_FLOW: ApplicationStatus[] = ["draft", "submitted"];

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

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const submit = body.submit === true;
  const data = (body.data ?? {}) as Record<string, unknown>;
  const tier = data.tier ? (Number(data.tier) as Tier) : null;
  const status: ApplicationStatus = submit ? "submitted" : "draft";
  const now = new Date().toISOString();

  if (submit) {
    if (!tier || !STATUS_FLOW.includes(status))
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
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
  const timeline: TimelineEvent[] = existing?.timeline ? [...existing.timeline] : [];

  if (submit) {
    const alreadySubmitted = existing && existing.status !== "draft";
    if (alreadySubmitted) {
      return NextResponse.json(
        { error: "You already have an application under review." },
        { status: 409 },
      );
    }
    timeline.push({ status: "submitted", at: now, note: "Received by the B.E.G.I.N committee." });
  } else if (!existing) {
    timeline.push({ status: "draft", at: now, note: "Application started." });
  }

  const patch: Partial<Application> = {
    status,
    tier,
    loanPurpose: String(data.loanPurpose ?? ""),
    businessName: String(data.businessName ?? user.businessName),
    amountRequested: data.amountRequested ? Number(data.amountRequested) : null,
    submittedAt: submit ? now : existing?.submittedAt ?? null,
    timeline,
    data,
  };

  const application = existing
    ? await store.updateApplication(user.id, patch)
    : await store.createApplication({
        id: `app_${randomUUID()}`,
        userId: user.id,
        reference: makeReference(),
        updatedAt: now,
        reviewNote: null,
        ...patch,
        status,
        timeline,
      } as Application);

  return NextResponse.json({ application });
}

export const PUT = storeGuard(put);
