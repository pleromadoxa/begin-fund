/**
 * One-off migration: local JSON store -> The Cellar.
 * Run: node scripts/migrate-local-to-cellar.mjs
 *
 * Idempotent: rows are upserted (merge-duplicates), so re-running is safe.
 * Uses CELLAR_REST_URL when present (same shape as the app), else CELLAR_URL/rest.
 */
import { readFileSync, existsSync } from "node:fs";

const REST = (process.env.CELLAR_REST_URL || (process.env.CELLAR_URL ? `${process.env.CELLAR_URL}/rest` : "")).replace(/\/+$/, "");
const SEAL = process.env.CELLAR_SEAL;

if (!REST || !SEAL) {
  console.error("CELLAR_REST_URL (or CELLAR_URL) and CELLAR_SEAL must be set (see .env.local)");
  process.exit(1);
}

const HEADERS = {
  Authorization: `Bearer ${SEAL}`,
  apikey: SEAL,
  "Content-Type": "application/json",
  // Upsert semantics — safe to re-run over an already-migrated database.
  Prefer: "resolution=merge-duplicates,return=representation",
};

let failures = 0;

async function upsert(table, rows) {
  for (const row of rows) {
    try {
      const res = await fetch(`${REST}/${table}`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        failures += 1;
        console.error(`  ✗ ${table} ${row.id}: ${res.status} ${await res.text()}`);
      } else {
        console.log(`  ✓ ${table} ${row.id}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`  ✗ ${table} ${row.id}: ${(error as Error).message}`);
    }
  }
}

if (!existsSync(".data/begin-db.json")) {
  console.error("No .data/begin-db.json found — nothing to migrate from this directory.");
  process.exit(1);
}

const db = JSON.parse(readFileSync(".data/begin-db.json", "utf8"));

console.log(`migrating ${db.users.length} users, ${db.applications.length} applications…`);

await upsert(
  "users",
  db.users.map((u) => ({
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    phone: u.phone,
    business_name: u.businessName,
    password_hash: u.passwordHash,
    created_at: u.createdAt,
    session_epoch: null,
  })),
);

await upsert(
  "applications",
  db.applications.map((a) => ({
    id: a.id,
    user_id: a.userId,
    status: a.status,
    tier: a.tier,
    reference: a.reference,
    amount_requested: a.amountRequested,
    loan_purpose: a.loanPurpose,
    business_name: a.businessName,
    submitted_at: a.submittedAt,
    updated_at: a.updatedAt,
    review_note: a.reviewNote,
    timeline: a.timeline,
    data: a.data,
  })),
);

const users = await fetch(`${REST}/users?select=id,email&order=created_at.asc`, {
  headers: { Authorization: `Bearer ${SEAL}`, apikey: SEAL },
}).then((r) => r.json());
const apps = await fetch(`${REST}/applications?select=id,reference,status&order=updated_at.desc`, {
  headers: { Authorization: `Bearer ${SEAL}`, apikey: SEAL },
}).then((r) => r.json());

console.log("verify users:", JSON.stringify(users));
console.log("verify applications:", JSON.stringify(apps));
if (failures) {
  console.error(`done with ${failures} failure(s) — fix and re-run (upserts are idempotent).`);
  process.exit(1);
}
console.log("done.");
