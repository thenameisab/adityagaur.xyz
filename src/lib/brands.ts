/**
 * The brand registry — every product this site names, and the domain its logo
 * comes from.
 *
 * Logos are served by logo.dev as plain images, resolved at build time into the
 * static HTML. There is no SDK and no client script: a `<Brand>` is an `<img>`
 * with a URL, which is what keeps the "zero runtime dependencies" claim true.
 *
 * Two rules govern this file, and they exist because a logo is a factual claim
 * about who made a thing:
 *
 * 1. **A name not in this registry fails the build.** Same contract as `meta`
 *    validation and the contrast checks — a typo in prose should stop a deploy,
 *    not ship a monogram of the letter "N".
 *
 * 2. **`domain: null` is a real answer.** It means "this product is named on the
 *    site and it deliberately has no logo" — either logo.dev has nothing for it,
 *    or the domain can't be attributed with confidence. Those entries render as
 *    text, exactly as they did before. Guessing a domain would put another
 *    company's mark next to a competitor's name, and on the Company Brain page
 *    that is a research error, not a styling one.
 *
 * `note` records why a domain resolves to something other than the obvious
 * thing, so the next person doesn't "fix" it.
 */

/**
 * Publishable key, safe in client HTML by design — logo.dev issues it for
 * exactly this use, and it ends up in the static output either way.
 * `NEXT_PUBLIC_LOGO_DEV_TOKEN` overrides it at build time for key rotation.
 */
export const LOGO_TOKEN =
  process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "pk_FbB1eTBFQSCfscytM00Kbg";

export const LOGO_HOST = "https://img.logo.dev";

export type BrandEntry = {
  /** How the name is set in type. Canonical — overrides the author's casing. */
  name: string;
  /** Logo source domain, or null for a deliberate no-logo entry. */
  domain: string | null;
  /** Other spellings that resolve here, lowercased. */
  aliases?: string[];
  /** Why this domain, when it isn't the obvious one. */
  note?: string;
};

/**
 * Keyed by normalized name (see `normalize`). Grouped by where the names appear
 * so the list stays auditable against the content.
 */
const REGISTRY: BrandEntry[] = [
  // ── Enterprise search / agentic platforms (Company Brain landscape) ──
  { name: "Glean", domain: "glean.com" },
  {
    name: "Microsoft 365 Copilot",
    domain: "microsoft.com",
    aliases: ["microsoft 365 copilot", "microsoft copilot", "copilot", "microsoft"],
    note: "logo.dev has the Microsoft mark, not a Copilot-specific one.",
  },
  { name: "Guru", domain: "getguru.com" },
  {
    name: "Sana → Workday",
    domain: "sanalabs.com",
    aliases: ["sana", "sana labs"],
    note: "Sana's own mark; the arrow in the label carries the acquisition.",
  },
  { name: "Workday", domain: "workday.com" },
  { name: "Notion AI", domain: "notion.com", aliases: ["notion ai"] },
  { name: "Notion", domain: "notion.com" },
  { name: "Hebbia", domain: "hebbia.ai" },
  { name: "Coveo", domain: "coveo.com" },
  { name: "Onyx", domain: "onyx.app" },
  { name: "GoSearch", domain: "gosearch.ai" },
  { name: "Dashworks", domain: "dashworks.ai" },
  { name: "Elastic", domain: "elastic.co" },

  // ── Memory infrastructure ──
  { name: "Mem0", domain: "mem0.ai" },
  { name: "Letta", domain: "letta.com" },
  {
    name: "Zep / Graphiti",
    domain: "getzep.com",
    aliases: ["zep", "graphiti", "zep / graphiti"],
  },
  { name: "Cognee", domain: "cognee.ai" },
  { name: "Supermemory", domain: "supermemory.ai" },
  { name: "LlamaIndex", domain: "llamaindex.ai" },

  // ── Meeting capture ──
  { name: "Fireflies", domain: "fireflies.ai" },
  { name: "Otter", domain: "otter.ai" },
  { name: "Fathom", domain: "fathom.video" },
  { name: "Circleback", domain: "circleback.ai" },
  { name: "Read AI", domain: "read.ai", aliases: ["read ai"] },

  // ── The Company Brain cohort ──
  // Six deliberate nulls. These are the low-confidence and anonymized rows: the
  // page's whole argument is about what the research could and couldn't verify,
  // and an unverified logo would undercut it in the one place it matters most.
  { name: "Hyper", domain: null, note: "No confidently attributable domain." },
  { name: "Memory Store", domain: null, note: "No confidently attributable domain." },
  { name: "GBrain", domain: null, note: "Open-source project, no brand domain." },
  { name: "GStack", domain: null, note: "Open-source project, no brand domain." },
  { name: "Savant", domain: null, note: "Near-zero public footprint; name is ambiguous." },
  { name: "Cerenovus", domain: null, note: "Near-zero public footprint." },
  { name: "Dust", domain: "dust.tt" },
  {
    name: "Needle",
    domain: null,
    note: "needle.app resolves to an unrelated company's mark. Left blank on purpose.",
  },
  { name: "Agno / Scout", domain: "agno.com", aliases: ["agno", "scout", "agno / scout"] },

  // ── LLM gateways ──
  { name: "Kong", domain: "konghq.com" },
  { name: "TrueFoundry", domain: "truefoundry.com" },
  { name: "Databricks", domain: "databricks.com" },
  { name: "LiteLLM", domain: "litellm.ai" },
  { name: "Portkey", domain: "portkey.ai" },
  { name: "OpenRouter", domain: "openrouter.ai" },
  { name: "Martian", domain: "withmartian.com" },
  { name: "Vellum", domain: "vellum.ai" },
  { name: "Eden AI", domain: "edenai.co", aliases: ["eden ai"] },

  // ── Category exemplars, integration-islands census ──
  // The ConnectiveLayer plate lists six categories of system with a few real
  // products under each, because "surface area" is an abstraction until you see
  // fifteen marks belonging to six categories in one frame.
  //
  // These are examples OF A CATEGORY and the artifact says so in as many words.
  // They are not a claim about any company's stack, anyone's customer list, or
  // the author's own tooling — which is the only footing on which a logo can
  // appear next to a category name at all. Every domain below was checked with
  // `fallback=404` and returns a real mark rather than a monogram.
  { name: "Freshdesk", domain: "freshdesk.com" },
  { name: "Intercom", domain: "intercom.com" },
  { name: "Gusto", domain: "gusto.com" },
  { name: "Rippling", domain: "rippling.com" },
  { name: "Chargebee", domain: "chargebee.com" },
  { name: "SAP", domain: "sap.com" },
  { name: "NetSuite", domain: "netsuite.com", aliases: ["oracle netsuite"] },
  { name: "Snowflake", domain: "snowflake.com" },

  // ── Named in prose: SaaS the essays and case studies reference ──
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "HubSpot", domain: "hubspot.com" },
  { name: "Slack", domain: "slack.com" },
  { name: "Linear", domain: "linear.app" },
  { name: "Zapier", domain: "zapier.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Zendesk", domain: "zendesk.com" },
  {
    name: "Confluence",
    domain: "atlassian.com",
    note: "logo.dev resolves every Atlassian product to the parent mark.",
  },
  {
    name: "Jira",
    domain: "atlassian.com",
    note: "logo.dev resolves every Atlassian product to the parent mark.",
  },
  { name: "Zoho CRM", domain: "zoho.com", aliases: ["zoho", "zoho crm"] },
  {
    name: "Gmail",
    domain: "google.com",
    note: "logo.dev returns the Google mark for every google.com subdomain.",
  },
  {
    name: "Google Sheets",
    domain: "google.com",
    aliases: ["google sheets", "sheets"],
    note: "Parent Google mark — see Gmail.",
  },
  {
    name: "Google Apps Script",
    domain: "google.com",
    aliases: ["google apps script", "apps script"],
    note: "Parent Google mark — see Gmail.",
  },
  { name: "GitHub", domain: "github.com" },
  { name: "Anthropic", domain: "anthropic.com" },
  { name: "Claude", domain: "claude.com" },
  { name: "Claude Code", domain: "claude.com", aliases: ["claude code"] },
  { name: "OpenAI", domain: "openai.com" },
  { name: "Perplexity", domain: "perplexity.ai" },

  // ── Named in prose: the markdown apps Loam is measured against ──
  { name: "Typora", domain: "typora.io" },
  { name: "iA Writer", domain: "ia.net", aliases: ["ia writer"] },
  { name: "Nota", domain: null, note: "No confidently attributable domain." },
  {
    name: "VS Code",
    domain: null,
    aliases: ["vs code", "vscode", "visual studio code"],
    note: "code.visualstudio.com resolves to the plain Microsoft mark, which reads as the wrong product.",
  },
  {
    name: "Xcode",
    domain: null,
    note: "No Xcode-specific mark; apple.com would read as the wrong product.",
  },

  // ── Named on the personal wiki (real employers/education) ──
  { name: "Tartan", domain: "tartanhq.com" },
  { name: "Mindflow", domain: "mindflow.io" },
  { name: "ESSEC", domain: "essec.edu", aliases: ["essec business school"] },

  // ── Named on the ElevenLabs-India case study ──
  { name: "ElevenLabs", domain: "elevenlabs.io", aliases: ["11labs", "eleven labs"] },
  {
    name: "AWS Marketplace",
    domain: "aws.amazon.com",
    aliases: ["aws", "aws marketplace", "amazon web services"],
  },
  { name: "GrowthX", domain: "growthx.club" },
  /* Stripe is already registered with the essays group above. */
  { name: "Razorpay", domain: "razorpay.com" },
  { name: "Paddle", domain: "paddle.com" },
  { name: "Whimsical", domain: "whimsical.com" },

  // ── Named in `meta.stack` ──
  { name: "Next.js", domain: "nextjs.org", aliases: ["nextjs", "next"] },
  { name: "React", domain: "react.dev" },
  { name: "TypeScript", domain: "typescriptlang.org" },
  { name: "Tailwind", domain: "tailwindcss.com", aliases: ["tailwind css", "tailwindcss"] },
  { name: "Vite", domain: "vite.dev" },
  { name: "Node.js", domain: "nodejs.org", aliases: ["nodejs", "node"] },
  { name: "PostgreSQL", domain: "postgresql.org", aliases: ["postgres"] },
  { name: "Python", domain: "python.org" },
  { name: "Chart.js", domain: "chartjs.org", aliases: ["chartjs"] },
  { name: "Cloudflare", domain: "cloudflare.com" },
  {
    name: "Cloudflare Pages",
    domain: "cloudflare.com",
    aliases: ["cloudflare pages", "pages functions"],
  },
  { name: "Neon Postgres", domain: "neon.com", aliases: ["neon", "neon postgres"] },
  { name: "Vercel", domain: "vercel.com" },
  { name: "Swift", domain: "swift.org" },
  { name: "SwiftUI", domain: "swift.org", note: "Swift's mark — SwiftUI has none of its own." },
  { name: "swift-markdown", domain: "swift.org", note: "A Swift package; Swift's mark." },
  { name: "WebKit", domain: "webkit.org" },
  {
    name: "JavaScriptCore",
    domain: "webkit.org",
    note: "JavaScriptCore ships inside WebKit.",
  },
  { name: "Zustand", domain: null, note: "A library with no brand domain." },
  { name: "Remotion", domain: "remotion.dev" },

  // ── Stack entries that are formats or facts, not products ──
  // Registered as nulls so the stack row can ask about every value without a
  // caller needing to know which ones are brands.
  { name: "CSS custom properties", domain: null },
  { name: "CSV", domain: null },
  { name: "Markdown", domain: null },
  { name: "Vanilla JS", domain: null },
  { name: "Static hosting", domain: null },
  { name: "Zero dependencies", domain: null },
  { name: "6 LLM providers", domain: null },
  { name: "Parallel research agents", domain: null },
];

/**
 * Normalize a name for lookup: casefold, collapse whitespace, drop a trailing
 * version token, and drop a trailing " API".
 *
 * The version strip is what lets `meta.stack` say "Next.js 16" and prose say
 * "Next.js" without two registry entries — and what makes "React 19" keep
 * working when it becomes "React 20". It only ever removes a *trailing* version,
 * so "Microsoft 365 Copilot" and "Mem0" survive intact.
 */
export function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s+api$/, "")
    .replace(/\s+v?\d+(\.\d+)*$/, "");
}

const BY_KEY = new Map<string, BrandEntry>();
for (const entry of REGISTRY) {
  for (const key of [normalize(entry.name), ...(entry.aliases ?? [])]) {
    const k = normalize(key);
    if (BY_KEY.has(k) && BY_KEY.get(k) !== entry) {
      // A duplicate key means two entries silently fight over one name. Fail at
      // import, which is build time, rather than resolving to whichever won.
      throw new Error(
        `brands.ts: "${k}" is claimed by both "${BY_KEY.get(k)!.name}" and "${entry.name}".`,
      );
    }
    BY_KEY.set(k, entry);
  }
}

/** The entry for a name, or undefined if the registry has never heard of it. */
export function findBrand(name: string): BrandEntry | undefined {
  return BY_KEY.get(normalize(name));
}

/**
 * The entry for a name, or a build failure.
 *
 * `context` names the caller in the error, because "unknown brand: Nexj.s" is
 * only useful if it also says which page said it.
 */
export function resolveBrand(name: string, context: string): BrandEntry {
  const entry = findBrand(name);
  if (!entry) {
    throw new Error(
      `${context}: "${name}" is not in the brand registry. Add it to src/lib/brands.ts — ` +
        `with \`domain: null\` if it should render without a logo.`,
    );
  }
  return entry;
}

/**
 * The image URL for a domain.
 *
 * `size` is the pixel size requested from logo.dev, not the CSS size — callers
 * ask for 2× so the mark stays sharp on retina. `fallback=404` is deliberate:
 * every domain in the registry was checked to return a real logo, so a 404 later
 * means the logo was pulled, and a broken image is a louder signal than a
 * monogram quietly standing in for a brand.
 */
export function logoSrc(domain: string, size = 48): string {
  const params = new URLSearchParams({
    token: LOGO_TOKEN,
    size: String(Math.min(Math.max(Math.round(size), 1), 800)),
    format: "png",
    retina: "true",
    fallback: "404",
  });
  return `${LOGO_HOST}/${domain}?${params}`;
}

/** Every entry, for the styleguide specimen. */
export function allBrands(): BrandEntry[] {
  return [...REGISTRY];
}
