import type { Application, Tier, User } from "../types";

/**
 * TinyZipperStore — "The Cellar" (sealed Postgres) adapter.
 *
 * Activated automatically when credentials are present in `.env.local`:
 *   CELLAR_REST_URL   <- PostgREST-shaped REST surface of the cellar
 *   CELLAR_SEAL       <- service capability seal (zc_…) — SERVER ONLY
 *
 * The two B.E.G.I.N chambers (`users`, `applications`) were created on the
 * `realtym` cellar via the sealed-SQL hatch (POST /query):
 *
 *   CREATE TABLE users (id text PRIMARY KEY, full_name text, email text NOT NULL,
 *     phone text, business_name text, password_hash text NOT NULL, created_at timestamptz);
 *   CREATE TABLE applications (id text PRIMARY KEY, user_id text NOT NULL, status text,
 *     tier int, reference text, amount_requested numeric, loan_purpose text,
 *     business_name text, submitted_at timestamptz, updated_at timestamptz,
 *     review_note text, timeline jsonb, data jsonb);
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

/**
 * Mint a per-user scoped seal (POST /session). The scope is subset-validated
 * against this seal's tables/ops — escalation is refused.
 *
 * The B.E.G.I.N web app keeps ALL Cellar access server-side (this seal never
 * reaches a browser), so this helper is for future direct-client features —
 * e.g. handing a short-TTL seal to an EventSource on /live. Least tables,
 * least ops, shortest TTL that fits the feature.
 */
export async function mintScopedSeal(options: {
  userId: string;
  tables: string[];
  ops: ("select" | "insert" | "update" | "delete")[];
  ttlSeconds: number;
}): Promise<{ seal: string; expiresAt?: string }> {
  const cellarUrl = (process.env.CELLAR_URL || "").replace(/\/+$/, "");
  const res = await fetch(`${cellarUrl}/session`, {
    method: "POST",
    headers: HEADERS(),
    body: JSON.stringify({
      user_id: options.userId,
      tables: options.tables,
      ops: options.ops,
      ttl_seconds: options.ttlSeconds,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new CellarError(
      `POST /session failed with ${res.status}`,
      res.status,
      text,
    );
  }
  const data = (await res.json()) as Record<string, unknown>;
  return {
    seal: String(data.access_token ?? data.seal ?? data.token ?? ""),
    expiresAt: data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000).toISOString()
      : undefined,
  };
}

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

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    const body: Record<string, unknown> = {};
    if (patch.fullName !== undefined) body.full_name = patch.fullName;
    if (patch.email !== undefined) body.email = patch.email;
    if (patch.phone !== undefined) body.phone = patch.phone;
    if (patch.businessName !== undefined) body.business_name = patch.businessName;
    if (patch.passwordHash !== undefined) body.password_hash = patch.passwordHash;
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
}
