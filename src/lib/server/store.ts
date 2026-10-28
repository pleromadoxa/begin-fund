import { LocalStore } from "./local-store";
import { TinyZipperStore } from "./tinyzipper-store";
import type { Application, User } from "../types";

export interface Store {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  /** Batch user lookup (used by the committee panel — avoids N+1 queries). */
  findUsersByIds(ids: string[]): Promise<User[]>;
  updateUser(id: string, patch: Partial<User>): Promise<User | null>;
  createApplication(app: Application): Promise<Application>;
  getApplicationByUser(userId: string): Promise<Application | null>;
  /** Committee tool: fetch one application by id (avoids listing everything). */
  getApplicationById(id: string): Promise<Application | null>;
  /** True when another application already uses this reference. */
  referenceExists(reference: string): Promise<boolean>;
  updateApplication(userId: string, patch: Partial<Application>): Promise<Application | null>;
  listApplications(): Promise<Application[]>;
  /** Committee tool: update any application by its id. */
  adminUpdateApplication(
    id: string,
    patch: Partial<Application>,
  ): Promise<Application | null>;
  /** Issues a single-use password-reset token; returns the raw token. */
  createResetToken(userId: string): Promise<string>;
  /** Atomically consumes a reset token; returns the user id, or null. */
  consumeResetToken(token: string): Promise<string | null>;
}

let store: Store | null = null;

const cellarConfigured = () =>
  !!(
    process.env.CELLAR_REST_URL ||
    process.env.CELLAR_URL ||
    process.env.TINYZIPPER_CELLAR_ID
  ) &&
  !!(
    process.env.CELLAR_SEAL ||
    process.env.TINYZIPPER_SERVICE_SEAL
  );

/**
 * Dual-mode data layer.
 * Uses The Cellar (sealed Postgres by Zipper) when credentials are configured,
 * otherwise the built-in local store — identical interface either way.
 */
export function getStore(): Store {
  if (store) return store;
  store = cellarConfigured() ? new TinyZipperStore() : new LocalStore();
  return store;
}
