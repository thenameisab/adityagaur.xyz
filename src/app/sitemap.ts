import type { MetadataRoute } from "next";
import { SITE_URL, routes } from "@/lib/site";
import { wikiEntries } from "@/lib/wiki";

// Required so the sitemap renders to a static file under `output: 'export'`.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const top = routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));
  const wiki = wikiEntries.map((e) => ({
    url: `${SITE_URL}/wiki/${e.slug}/`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...top, ...wiki];
}
