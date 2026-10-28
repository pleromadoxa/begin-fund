import type { NextConfig } from "next";

// STATIC_EXPORT=1 (npm run build:static) builds the static marketing site
// into out/ for plain file hosting (FTP / hPanel File Manager). Without it
// the build is standalone SSR — served by The Stage or Hostinger Web Apps —
// which runs the API routes, auth and middleware at runtime.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Zipper's The Stage serves the SSR bundle from the standalone server.
  output: staticExport ? "export" : "standalone",
  // The dashboard + application pages are auth-driven (cookie reads on every
  // request), so route-level caching is disabled in favour of dynamic rendering.
  cacheComponents: false,
  // headers() only apply to the SSR runtime — a static export cannot serve them,
  // and the /_next/image optimizer does not exist on static hosts either.
  ...(staticExport
    ? { images: { unoptimized: true } }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
              ],
            },
          ];
        },
      }),
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
