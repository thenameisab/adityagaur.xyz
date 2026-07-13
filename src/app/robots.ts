import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required so robots.txt renders to a static file under `output: 'export'`.
export const dynamic = "force-static";

// Explicitly welcomes AI answer-engine crawlers — the point of this site is to be a
// citable, accurate source for "Aditya Gaur" queries in AI search and assistants.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
