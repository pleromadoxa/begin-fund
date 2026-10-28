import { randomUUID } from "crypto";

/**
 * Zipper Mail (TinyZipper) transactional email.
 *
 * Primary path  : HTTP API  POST ZIPPER_EMAIL_API_URL  (Bearer send key)
 * Fallback path : SMTP      smtp.tinyzipper.com:587 STARTTLS (nodemailer)
 *
 * Secrets live only in .env.local / platform env — never in the browser.
 * All senders here are non-throwing: a delivery failure is logged and
 * returned as { ok: false } so it never breaks the request it serves.
 */

const API_URL = () => process.env.ZIPPER_EMAIL_API_URL || "";
const SEND_KEY = () => process.env.ZIPPER_EMAIL_SEND_KEY || "";
const FROM_EMAIL = () =>
  process.env.ZIPPER_EMAIL_FROM_ADDRESS || "ministryofcommerce@mail.tinyzipper.com";
const FROM_NAME = () => process.env.ZIPPER_EMAIL_FROM_NAME || "Ministry Of Commerce LW";
const SMTP_HOST = () => process.env.ZIPPER_SMTP_HOST || "smtp.tinyzipper.com";
const SMTP_PORT = () => Number(process.env.ZIPPER_SMTP_PORT || 587);
const SMTP_USER = () => process.env.ZIPPER_SMTP_USER || "";
const SMTP_PASS = () => process.env.ZIPPER_SMTP_PASSWORD || "";

/** Committee/admin inbox — receives committee notifications & test sends. */
export const ADMIN_EMAIL = () =>
  process.env.ADMIN_EMAIL || "begin@loveworldcommerce.org";

export interface MailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Optional classification tags (Zipper uses these for suppression logic). */
  tags?: string[];
}

export interface MailResult {
  ok: boolean;
  transport: "api" | "smtp" | "none";
  status?: number;
  error?: string;
}

export function mailConfigured(): boolean {
  return !!(API_URL() && SEND_KEY()) || !!(SMTP_HOST() && SMTP_USER());
}

async function sendViaApi(payload: MailPayload): Promise<MailResult> {
  const res = await fetch(API_URL(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SEND_KEY()}`,
      "Content-Type": "application/json",
      // Safe retry token — Zipper de-duplicates on this key.
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      from: { email: FROM_EMAIL(), name: FROM_NAME() },
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(payload.tags?.length ? { tags: payload.tags } : {}),
    }),
    cache: "no-store",
  });

  if (res.ok) return { ok: true, transport: "api", status: res.status };

  const body = await res.text().catch(() => "");
  let message = `Zipper Mail API ${res.status}`;
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: string };
    message = parsed.message || parsed.error || message;
  } catch {
    /* keep generic */
  }
  return { ok: false, transport: "api", status: res.status, error: message };
}

async function sendViaSmtp(payload: MailPayload): Promise<MailResult> {
  if (!SMTP_USER() || !SMTP_PASS()) {
    return { ok: false, transport: "smtp", error: "SMTP credentials not configured" };
  }
  const nodemailer = (await import("nodemailer")).default;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST(),
    port: SMTP_PORT(),
    secure: false, // STARTTLS on 587
    requireTLS: true,
    auth: { user: SMTP_USER(), pass: SMTP_PASS() },
  });
  try {
    const info = await transport.sendMail({
      from: `"${FROM_NAME()}" <${FROM_EMAIL()}>`,
      to: Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    return { ok: true, transport: "smtp", status: 250, error: info.messageId };
  } finally {
    transport.close();
  }
}

/**
 * Send a transactional email. Tries the HTTP API first; on API failure it
 * falls back to SMTP. Never throws.
 */
export async function sendMail(payload: MailPayload): Promise<MailResult> {
  if (!mailConfigured()) {
    console.warn("[mail] Zipper Mail not configured — skipping send");
    return { ok: false, transport: "none", error: "Mail not configured" };
  }

  let result: MailResult;
  try {
    result = await sendViaApi(payload);
    if (!result.ok) console.warn(`[mail] API path failed (${result.error}) — trying SMTP`);
  } catch (error) {
    result = { ok: false, transport: "api", error: (error as Error).message };
  }

  if (result.ok) {
    console.log(`[mail] sent "${payload.subject}" via api`);
    return result;
  }

  try {
    const smtp = await sendViaSmtp(payload);
    if (smtp.ok) console.log(`[mail] sent "${payload.subject}" via smtp`);
    else console.warn(`[mail] smtp fallback failed: ${smtp.error}`);
    return smtp;
  } catch (error) {
    const message = (error as Error).message;
    console.error(`[mail] both transports failed: ${message}`);
    return { ok: false, transport: "smtp", error: message };
  }
}
