import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static preview build for Zipper The Stage (SSR runtime is broken
  // platform-side — ERR_SOCKET_BAD_PORT in their launcher). Public pages
  // only; auth/API need the SSR deploy on `main`.
  output: "export",
  images: { unoptimized: true },
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
