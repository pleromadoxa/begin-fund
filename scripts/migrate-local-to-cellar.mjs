/**
 * One-off migration: local JSON store -> The Cellar.
 * Run: node scripts/migrate-local-to-cellar.mjs
 */
import { readFileSync } from "node:fs";

const BASE = process.env.CELLAR_URL;
const SEAL = process.env.CELLAR_SEAL;

if (!BASE || !SEAL) {
  console.error("CELLAR_URL and CELLAR_SEAL must be set (see .env.local)");
  process.exit(1);
}

const HEADERS = {
  Authorization: `Bearer ${SEAL}`,
  apikey: SEAL,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function rest(path, init = {}) {
  const res = await fetch(`${BASE}/rest/${path}`, {
    ...init,
    headers: { ...HEADERS, ...(init.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`${init.method || "GET"} /rest/${path} -> ${res.status}: ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

const db = JSON.parse(readFileSync(".data/begin-db.json", "utf8"));

console.log(`migrating ${db.users.length} users, ${db.applications.length} applications…`);

for (const u of db.users) {
  await rest("users", {
    method: "POST",
    body: JSON.stringify({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      phone: u.phone,
      business_name: u.businessName,
      password_hash: u.passwordHash,
      created_at: u.createdAt,
    }),
  });
  console.log("  user:", u.email);
}

for (const a of db.applications) {
  await rest("applications", {
    method: "POST",
    body: JSON.stringify({
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
    }),
  });
  console.log("  application:", a.reference, "-", a.businessName);
}

const users = await rest("users?select=id,email,business_name&order=created_at.asc");
const apps = await rest("applications?select=id,reference,status,business_name&order=updated_at.desc");
console.log("verify users:", JSON.stringify(users));
console.log("verify applications:", JSON.stringify(apps));
console.log("done.");
