import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: every route becomes real HTML in `out/`, rendered at build time.
  // This is the core AEO lever — AI crawlers (GPTBot, ClaudeBot, PerplexityBot) mostly
  // don't run JS, so the text must exist in the server-rendered HTML, not be hydrated in.
  output: "export",

  // Required for static export: the default next/image optimizer needs a server.
  // We serve images as-is (they're already remote/optimized).
  images: { unoptimized: true },

  // Emit /about/index.html style paths so any static host (Cloudflare Pages) serves clean URLs.
  trailingSlash: true,
};

export default nextConfig;
