import { createHash, randomBytes, randomUUID } from "crypto";
import type { Application, Tier, User } from "../types";

/**
 * TinyZipperStore — "The Cellar" (sealed Postgres) adapter.
 *
 * Activated automatically when credentials are present in `.env.local`:
 *   CELLAR_REST_URL   <- PostgREST-shaped REST surface of the cellar
 *   CELLAR_SEAL       <- service capability seal (zc_…) — SERVER ONLY
 *
 * The B.E.G.I.N chambers (`users`, `applications`, `password_resets`) are
 * created on the cellar via the sealed-SQL hatch (POST /query):
 *
 *   CREATE TABLE users (id text PRIMARY KEY, full_name text, email text NOT NULL,
 *     phone text, business_name text, password_hash text NOT NULL,
 *     created_at timestamptz, session_epoch timestamptz);
 *   CREATE TABLE applications (id text PRIMARY KEY, user_id text NOT NULL, status text,
 *     tier int, reference text, amount_requested numeric, loan_purpose text,
 *     business_name text, submitted_at timestamptz, updated_at timestamptz,
 *     review_note text, timeline jsonb, data jsonb);
 *   CREATE TABLE password_resets (id text PRIMARY KEY, user_id text NOT NULL,
 *     token_hash text NOT NULL, expires_at timestamptz NOT NULL,
 *     used boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL);
 *
 * Reliability contract (from the Cellar docs):
 *   - every request runs under a 7.5s server budget and answers a structured
 *     `503 cellar_timeout` with `Retry-After: 1`; responses carry `Server-Timing`
 *     (resolve / run / total) which we surface when debugging.
 *   - READS retry on 429/503 honoring Retry-After with jittered backoff.
 *   - WRITES are never blind-retried (they throw a structured CellarError).
 *
 * Never expose the service seal in the browser — it lives only on the server.
 * All data access from the app goes through /api routes.
 */

const REST_BASE = () => {
  const explicit = process.env.CELLAR_REST_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const cellar = process.env.CELLAR_URL || process.env.TINYZIPPER_CELLAR_ID;
  if (cellar) return `${cellar.replace(/\/+$/, "")}/rest`;
  // Legacy variable pair from the original handoff.
  return `https://tinyzipper.com/api/v1/cellar/${process.env.TINYZIPPER_CELLAR_ID}/rest`;
};

const SEAL = () =>
  process.env.CELLAR_SEAL || process.env.TINYZIPPER_SERVICE_SEAL || "";

const HEADERS = () => ({
  apikey: SEAL(),
  Authorization: `Bearer ${SEAL()}`,
  "Content-Type": "application/json",
});

export class CellarError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
    readonly serverTiming?: string,
  ) {
    super(message);
    this.name = "CellarError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Cellar REST call with the reliability contract applied:
 * reads retry on 429/503 (honoring Retry-After, jittered); writes never do.
 */
async function cellar(
  pathname: string,
  init: RequestInit = {},
  { readRetries = 2 }: { readRetries?: number } = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const isRead = method === "GET";
  let attempt = 0;

  for (;;) {
    const res = await fetch(`${REST_BASE()}${pathname}`, {
      ...init,
      headers: { ...HEADERS(), ...(init.headers as Record<string, string>) },
      cache: "no-store",
    });

    if (res.ok) return res;

    const text = await res.text().catch(() => "");
    const timing = res.headers.get("server-timing") ?? undefined;

    if (isRead && (res.status === 429 || res.status === 503) && attempt < readRetries) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const waitMs =
        (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 1) * 1000;
      // Jittered backoff on top of the server's hint.
      await sleep(waitMs + Math.random() * 250);
      attempt += 1;
      continue;
    }

    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* keep raw text */
    }

    // Never log the seal; timing hints are safe and pinpoint slow phases.
    console.warn(
      `[cellar] ${method} ${pathname} -> ${res.status}` +
        (timing ? ` (Server-Timing: ${timing})` : ""),
    );
    const message =
      (body as { message?: string } | null)?.message ||
      `Cellar ${method} ${pathname} failed with ${res.status}`;
    throw new CellarError(message, res.status, body, timing);
  }
}

async function rows<T = Record<string, unknown>>(
  res: Response,
): Promise<T[]> {
  const data = (await res.json().catch(() => [])) as T[] | T | null;
  if (Array.isArray(data)) return data;
  return data ? [data] : [];
}

/** jsonb columns may come back as objects or as JSON strings. */
function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    businessName: String(row.business_name ?? ""),
    passwordHash: String(row.password_hash ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    sessionEpoch: row.session_epoch ? Date.parse(String(row.session_epoch)) || 0 : 0,
  };
}

function rowToApp(row: Record<string, unknown>): Application {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    status: row.status as Application["status"],
    tier: (row.tier as Tier | null) ?? null,
    reference: String(row.reference ?? ""),
    amountRequested: row.amount_requested != null ? Number(row.amount_requested) : null,
    loanPurpose: String(row.loan_purpose ?? ""),
    businessName: String(row.business_name ?? ""),
    submittedAt: (row.submitted_at as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    reviewNote: (row.review_note as string | null) ?? null,
    timeline: asJson<Application["timeline"]>(row.timeline, []),
    data: asJson<Record<string, unknown>>(row.data, {}),
  };
}

const hashResetToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export class TinyZipperStore {
  async createUser(user: User): Promise<User> {
    const res = await cellar("/users", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        business_name: user.businessName,
        password_hash: user.passwordHash,
        created_at: user.createdAt,
        session_epoch: user.sessionEpoch ? new Date(user.sessionEpoch).toISOString() : null,
      }),
    });
    const created = await rows(res);
    if (!created.length) {
      throw new CellarError("Cellar insert returned no row", 500, null);
    }
    return rowToUser(created[0]);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const res = await cellar(
      `/users?email=eq.${encodeURIComponent(email)}&limit=1`,
    );
    const list = await rows(res);
    return list[0] ? rowToUser(list[0]) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const res = await cellar(`/users?id=eq.${encodeURIComponent(id)}&limit=1`);
    const list = await rows(res);
    return list[0] ? rowToUser(list[0]) : null;
  }

  /** Batch lookup — chunked `id=in.(…)` instead of one request per user. */
  async findUsersByIds(ids: string[]): Promise<User[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return [];
    const out: User[] = [];
    const CHUNK = 40;
    for (let i = 0; i < unique.length; i += CHUNK) {
      const chunk = unique.slice(i, i + CHUNK).map(encodeURIComponent);
      const res = await cellar(`/users?id=in.(${chunk.join(",")})`);
      out.push(...(await rows(res)).map(rowToUser));
    }
    return out;
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    const body: Record<string, unknown> = {};
    if (patch.fullName !== undefined) body.full_name = patch.fullName;
    if (patch.email !== undefined) body.email = patch.email;
    if (patch.phone !== undefined) body.phone = patch.phone;
    if (patch.businessName !== undefined) body.business_name = patch.businessName;
    if (patch.passwordHash !== undefined) body.password_hash = patch.passwordHash;
    if (patch.sessionEpoch !== undefined)
      body.session_epoch = patch.sessionEpoch
        ? new Date(patch.sessionEpoch).toISOString()
        : null;
    const res = await cellar(`/users?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(body),
    });
    const updated = await rows(res);
    return updated[0] ? rowToUser(updated[0]) : this.findUserById(id);
  }

  private appBody(app: Partial<Application>): Record<string, unknown> {
    return {
      user_id: app.userId,
      status: app.status,
      tier: app.tier,
      reference: app.reference,
      amount_requested: app.amountRequested,
      loan_purpose: app.loanPurpose,
      business_name: app.businessName,
      submitted_at: app.submittedAt,
      updated_at: app.updatedAt,
      review_note: app.reviewNote,
      timeline: app.timeline,
      data: app.data,
    };
  }

  async createApplication(app: Application): Promise<Application> {
    const res = await cellar("/applications", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ id: app.id, ...this.appBody(app) }),
    });
    const created = await rows(res);
    if (!created.length) {
      throw new CellarError("Cellar insert returned no row", 500, null);
    }
    return rowToApp(created[0]);
  }

  async getApplicationByUser(userId: string): Promise<Application | null> {
    const res = await cellar(
      `/applications?user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=1`,
    );
    const list = await rows(res);
    return list[0] ? rowToApp(list[0]) : null;
  }

  async getApplicationById(id: string): Promise<Application | null> {
    const res = await cellar(
      `/applications?id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    const list = await rows(res);
    return list[0] ? rowToApp(list[0]) : null;
  }

  async referenceExists(reference: string): Promise<boolean> {
    const res = await cellar(
      `/applications?reference=eq.${encodeURIComponent(reference)}&limit=1`,
    );
    return (await rows(res)).length > 0;
  }

  async updateApplication(
    userId: string,
    patch: Partial<Application>,
  ): Promise<Application | null> {
    const current = await this.getApplicationByUser(userId);
    if (!current) return null;
    const merged: Application = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    const res = await cellar(
      `/applications?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(this.appBody(merged)),
      },
    );
    const updated = await rows(res);
    return updated[0] ? rowToApp(updated[0]) : this.getApplicationByUser(userId);
  }

  async listApplications(): Promise<Application[]> {
    const res = await cellar("/applications?order=updated_at.desc");
    return (await rows(res)).map(rowToApp);
  }

  async adminUpdateApplication(
    id: string,
    patch: Partial<Application>,
  ): Promise<Application | null> {
    const res = await cellar(`/applications?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        ...this.appBody(patch),
        updated_at: new Date().toISOString(),
      }),
    });
    const updated = await rows(res);
    return updated[0] ? rowToApp(updated[0]) : null;
  }

  /** Issues a fresh reset token for a user; returns the raw token. */
  async createResetToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const res = await cellar("/password_resets", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id: `rst_${randomUUID()}`,
        user_id: userId,
        token_hash: hashResetToken(token),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        used: false,
        created_at: new Date().toISOString(),
      }),
    });
    const inserted = await rows(res);
    if (!inserted.length) {
      throw new CellarError("password_resets insert returned no row", 500, null);
    }
    return token;
  }

  /**
   * Atomically consumes a reset token: a single conditional UPDATE that only
   * flips `used` when the row is still unused and unexpired. The returned
   * representation decides the winner if two redemptions race.
   */
  async consumeResetToken(token: string): Promise<string | null> {
    const nowIso = new Date().toISOString();
    const res = await fetch(
      `${REST_BASE()}/password_resets?token_hash=eq.${hashResetToken(token)}` +
        `&used=eq.false&expires_at=gt.${encodeURIComponent(nowIso)}`,
      {
        method: "PATCH",
        headers: { ...HEADERS(), Prefer: "return=representation" },
        body: JSON.stringify({ used: true }),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const list = await rows<{ user_id?: unknown }>(res);
    return list[0]?.user_id ? String(list[0].user_id) : null;
  }
}
