import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Zipper's The Stage serves the SSR bundle from the standalone server.
  output: "standalone",
  // The dashboard + application pages are auth-driven (cookie reads on every
  // request), so route-level caching is disabled in favour of dynamic rendering.
  cacheComponents: false,
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
