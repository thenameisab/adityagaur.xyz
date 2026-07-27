/**
 * The Work registry.
 *
 * To add a page: create `src/content/work/<slug>/index.mdx` with a `meta` export,
 * then add one line here. Nothing else — the route, metadata, JSON-LD, sitemap
 * entry, and index card all derive from `meta`.
 *
 * The key must equal the folder name; `buildEntries` fails the build if it doesn't.
 */

import { buildWorkEntries, type EntryModule } from "@/lib/content";

import * as loam from "./loam/index.mdx";

const modules: Record<string, EntryModule> = {
  loam: loam as EntryModule,
};

export const workEntries = buildWorkEntries(modules);
