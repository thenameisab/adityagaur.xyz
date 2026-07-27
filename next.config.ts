import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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

  // MDX carries the long-form Work and Writing pages (BUILD-BRIEF §2).
  pageExtensions: ["ts", "tsx", "mdx"],
};

// `rehype-slug` gives every heading a stable id so the table-of-contents rail can
// link to it. It leaves an explicitly authored `id` alone, which is what keeps the
// hand-written section anchors in the Integration Islands essay working.
// `src/lib/toc.ts` derives the rail from the same slugger, so the two agree.
//
// Prose styling still comes from the element mapping in src/mdx-components.tsx
// pointing at `.prose` in globals.css — there is no plugin doing that.
// The plugin is named as a string, not imported: Next passes these options
// through to the MDX loader and requires them to be serializable, so a function
// reference fails the build.
const withMDX = createMDX({
  options: {
    rehypePlugins: [["rehype-slug", {}]],
  },
});

export default withMDX(nextConfig);
