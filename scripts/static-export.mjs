import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Static marketing export (out/) for plain file hosting — FTP, hPanel File
 * Manager, any shared host that serves files. Server-only routes cannot
 * exist as static files, so they are moved aside for the duration of the
 * build and restored afterwards:
 *
 *   src/app/api        — auth / applications / admin API handlers
 *   src/app/apply      — server-rendered wizard (cookie-guarded)
 *   src/app/dashboard  — server-rendered dashboard (cookie-guarded)
 *   src/app/admin      — committee panel (cookie-guarded)
 *   src/proxy.ts       — middleware redirects (unsupported in export)
 *
 * What survives in out/: the landing page, gallery, and the sign-in /
 * sign-up shells (their forms need the API, so they are display-only in a
 * static deployment). `npm run build` still produces the full SSR app.
 */

const STASH = ".static-export-stash";
const SERVER_ONLY = [
  "src/app/api",
  "src/app/apply",
  "src/app/dashboard",
  "src/app/admin",
  "src/proxy.ts",
];

const stashName = (p) => p.replace(/\//g, "__");

if (existsSync(STASH)) {
  console.error(
    `static-export: ${STASH}/ already exists — a previous run was interrupted.\n` +
      "Restore the paths from it into the project root, delete the folder, then re-run.",
  );
  process.exit(1);
}

mkdirSync(STASH, { recursive: true });
const moved = [];

try {
  for (const p of SERVER_ONLY) {
    if (!existsSync(p)) continue;
    renameSync(p, `${STASH}/${stashName(p)}`);
    moved.push(p);
  }

  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "1" },
  });

  console.log(
    `static-export: out/ is ready. Server-only paths moved aside: ${moved.join(", ")}`,
  );
  console.log(
    "static-export: upload the CONTENTS of out/ to your web root (e.g. public_html).",
  );
} finally {
  for (const p of moved) {
    renameSync(`${STASH}/${stashName(p)}`, p);
  }
  rmSync(STASH, { recursive: true, force: true });
}
