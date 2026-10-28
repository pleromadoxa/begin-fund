import { promises as fs } from "fs";
import path from "path";
import type { Application, User } from "../types";

/**
 * LocalStore — the built-in persistence engine.
 * Stores users and applications in a JSON file under `.data/`.
 * Swap to TinyZipper (see tinyzipper.ts) by setting these env vars:
 *   TINYZIPPER_CELLAR_ID  (your "seller" — the database)
 *   TINYZIPPER_SERVICE_SEAL (your "armory" — authentication)
 */
export class LocalStore {
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    this.file = path.join(process.cwd(), ".data", "begin-db.json");
  }

  private async read(): Promise<{ users: User[]; applications: Application[] }> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      return JSON.parse(raw);
    } catch {
      return { users: [], applications: [] };
    }
  }

  private async write(data: { users: User[]; applications: Application[] }) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(data, null, 2), "utf8");
  }

  /** Serialize writes to avoid interleaved read-modify-write cycles. */
  private mutate<T>(fn: (db: Awaited<ReturnType<LocalStore["read"]>>) => T | Promise<T>): Promise<T> {
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

  async updateApplication(
    userId: string,
    patch: Partial<Application>,
  ): Promise<Application | null> {
    return this.mutate((db) => {
      const app = db.applications.find((a) => a.userId === userId);
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
}
