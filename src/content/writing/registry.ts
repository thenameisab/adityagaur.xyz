/**
 * The Writing registry. Same contract as the Work registry: create
 * `src/content/writing/<slug>/index.mdx` with a `meta` export, add one line here.
 */

import { buildWritingEntries, type EntryModule } from "@/lib/content";

import * as integrationIslands from "./integration-islands/index.mdx";
import * as companyBrain from "./company-brain/index.mdx";

const modules: Record<string, EntryModule> = {
  "integration-islands": integrationIslands as EntryModule,
  "company-brain": companyBrain as EntryModule,
};

export const writingEntries = buildWritingEntries(modules);
