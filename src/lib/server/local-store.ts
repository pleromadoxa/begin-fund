import { promises as fs } from "fs";
import path from "path";
import { createHash, randomBytes, randomUUID } from "crypto";
import type { Application, User } from "../types";

/**
 * LocalStore — the built-in persistence engine.
 * Stores users, applications and password-reset tokens in a JSON file under
 * `.data/`. Swap to The Cellar by setting CELLAR_REST_URL + CELLAR_SEAL —
 * identical interface either way.
 */

interface ResetRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

interface LocalDb {
  users: User[];
  applications: Application[];
  password_resets: ResetRow[];
}

const hashResetToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export class LocalStore {
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    this.file = path.join(process.cwd(), ".data", "begin-db.json");
  }

  private async read(): Promise<LocalDb> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      const parsed = JSON.parse(raw) as Partial<LocalDb>;
      return {
        users: parsed.users ?? [],
        applications: parsed.applications ?? [],
        password_resets: parsed.password_resets ?? [],
      };
    } catch {
      return { users: [], applications: [], password_resets: [] };
    }
  }

  private async write(data: LocalDb) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(data, null, 2), "utf8");
  }

  /** Serialize writes to avoid interleaved read-modify-write cycles. */
  private mutate<T>(fn: (db: LocalDb) => T | Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const db = await this.read();
      const result = await fn(db);
      await this.write(db);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  async createUser(user: User): Promise<User> {
    return this.mutate((db) => {
      db.users.push(user);
      return user;
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const db = await this.read();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const db = await this.read();
    return db.users.find((u) => u.id === id) ?? null;
  }

  async findUsersByIds(ids: string[]): Promise<User[]> {
    const wanted = new Set(ids);
    const db = await this.read();
    return db.users.filter((u) => wanted.has(u.id));
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    return this.mutate((db) => {
      const user = db.users.find((u) => u.id === id);
      if (!user) return null;
      Object.assign(user, patch, { id: user.id });
      return user;
    });
  }

  async createApplication(app: Application): Promise<Application> {
    return this.mutate((db) => {
      db.applications.push(app);
      return app;
    });
  }

  async getApplicationByUser(userId: string): Promise<Application | null> {
    const db = await this.read();
    return (
      db.applications
        .filter((a) => a.userId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
    );
  }

  async getApplicationById(id: string): Promise<Application | null> {
    const db = await this.read();
    return db.applications.find((a) => a.id === id) ?? null;
  }

  async referenceExists(reference: string): Promise<boolean> {
    const db = await this.read();
    return db.applications.some((a) => a.reference === reference);
  }

  /** Patches the most recently updated application for the user — same
   *  selection as the Cellar adapter (they must agree). */
  async updateApplication(
    userId: string,
    patch: Partial<Application>,
  ): Promise<Application | null> {
    return this.mutate((db) => {
      const app = db.applications
        .filter((a) => a.userId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (!app) return null;
      const { id: _id, userId: _uid, ...rest } = patch;
      Object.assign(app, rest, { updatedAt: new Date().toISOString() });
      return app;
    });
  }

  /** Committee tool: list every application (not exposed to applicants). */
  async listApplications(): Promise<Application[]> {
    const db = await this.read();
    return db.applications;
  }

  /** Committee tool: update any application by its id. */
  async adminUpdateApplication(
    id: string,
    patch: Partial<Application>,
  ): Promise<Application | null> {
    return this.mutate((db) => {
      const app = db.applications.find((a) => a.id === id);
      if (!app) return null;
      const { id: _id, userId: _uid, ...rest } = patch;
      Object.assign(app, rest, { updatedAt: new Date().toISOString() });
      return app;
    });
  }

  async createResetToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");
    await this.mutate((db) => {
      db.password_resets.push({
        id: `rst_${randomUUID()}`,
        user_id: userId,
        token_hash: hashResetToken(token),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        used: false,
        created_at: new Date().toISOString(),
      });
    });
    return token;
  }

  /** Single-use consumption — serialized by mutate(), so races cannot double-spend. */
  async consumeResetToken(token: string): Promise<string | null> {
    const tokenHash = hashResetToken(token);
    return this.mutate((db) => {
      const row = db.password_resets.find(
        (r) => r.token_hash === tokenHash && !r.used && new Date(r.expires_at).getTime() >= Date.now(),
      );
      if (!row) return null;
      row.used = true;
      return row.user_id;
    });
  }
}
