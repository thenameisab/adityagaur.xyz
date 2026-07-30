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
import * as billingPlatform from "./billing-platform/index.mdx";
import * as outreachSequencer from "./outreach-sequencer/index.mdx";
import * as wealthlens from "./wealthlens/index.mdx";
import * as internalWiki from "./internal-wiki/index.mdx";
import * as syncConsoleRework from "./sync-console-rework/index.mdx";
import * as policyPrototype from "./policy-prototype/index.mdx";
import * as mgmtDash from "./mgmt-dash/index.mdx";
import * as crmDashboard from "./crm-dashboard/index.mdx";

const modules: Record<string, EntryModule> = {
  loam: loam as EntryModule,
  "billing-platform": billingPlatform as EntryModule,
  "outreach-sequencer": outreachSequencer as EntryModule,
  wealthlens: wealthlens as EntryModule,
  "internal-wiki": internalWiki as EntryModule,
  "sync-console-rework": syncConsoleRework as EntryModule,
  "policy-prototype": policyPrototype as EntryModule,
  "mgmt-dash": mgmtDash as EntryModule,
  "crm-dashboard": crmDashboard as EntryModule,
};

export const workEntries = buildWorkEntries(modules);
