import { readFileSync, writeFileSync } from "node:fs";

/**
 * Stage post-build hardening (Zipper The Stage SSR runtime).
 *
 * The generated standalone server does `parseInt(process.env.PORT, 10) || 3000`
 * which crashes the container with ERR_SOCKET_BAD_PORT when the runtime hands
 * it a malformed or out-of-range value (observed on The Stage). This patch
 * replaces that line with a resolver that:
 *   - accepts plain numbers ("19300"), host:port forms ("0.0.0.0:19300"),
 *   - checks PORT then LISTEN_PORT,
 *   - clamps to the valid TCP range,
 *   - falls back to 19300 (The Stage's published listen port).
 */
const target = ".next/standalone/server.js";
let src;
try {
  src = readFileSync(target, "utf8");
} catch {
  console.error("stage-postbuild: .next/standalone/server.js not found — is output standalone?");
  process.exit(1);
}

const ORIGINAL = "const currentPort = parseInt(process.env.PORT, 10) || 3000";
const PATCHED = `const currentPort = (() => {
  for (const candidate of [process.env.PORT, process.env.LISTEN_PORT]) {
    if (candidate == null || candidate === "") continue;
    let value = String(candidate).trim();
    if (value.includes(":")) value = value.slice(value.lastIndexOf(":") + 1);
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) return parsed;
  }
  return 19300;
})()`;

if (!src.includes(ORIGINAL)) {
  if (src.includes("currentPort")) {
    console.log("stage-postbuild: port resolver already customized — leaving as-is");
    process.exit(0);
  }
  console.error("stage-postbuild: expected port line not found in standalone server");
  process.exit(1);
}

writeFileSync(target, src.replace(ORIGINAL, PATCHED));
console.log("stage-postbuild: hardened standalone port resolver (fallback 19300)");
