import type { NextConfig } from "next";

/**
 * Static export configuration for Cloudflare Pages.
 *
 * The site is fully prerendered at build time (GitHub is the database), so
 * `output: "export"` emits a plain `out/` directory of HTML + assets that
 * Cloudflare Pages serves directly — no server runtime required.
 *
 * Image optimization is disabled because the Next.js image optimizer needs a
 * server; images are served as-is and cached by Cloudflare's CDN instead.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
