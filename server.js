/**
 * Zipper The Stage SSR entry.
 *
 * The Stage's runtime launcher hands the process a malformed/undefined port
 * (ERR_SOCKET_BAD_PORT before app code runs). This root entry normalises the
 * environment FIRST, then boots the Next standalone server:
 *   - PORT is sanitised (plain numbers, host:port forms) — fallback 19300,
 *     The Stage's published listen port;
 *   - HOSTNAME defaults to 0.0.0.0 so the health probe can reach us.
 */
const path = require("path");

function safePort(raw, fallback) {
  if (raw == null || raw === "") return fallback;
  let value = String(raw).trim();
  if (value.includes(":")) value = value.slice(value.lastIndexOf(":") + 1);
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 65536 ? parsed : fallback;
}

process.env.NODE_ENV = "production";
process.env.PORT = String(
  safePort(process.env.PORT, safePort(process.env.LISTEN_PORT, 19300)),
);
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

require(path.join(__dirname, ".next", "standalone", "server.js"));
