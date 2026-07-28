/**
 * The 41 products, as researched.
 *
 * Every field here is carried over from `research/<archetype>/<product>.md` and
 * the July 2026 meta-report, including the caveats. `confidence` is the grade the
 * research pass gave the *headline numbers* for that product, and `caveat` is the
 * specific reason it isn't higher — a card with a caveat is showing you the thing
 * a competitive landscape usually deletes.
 *
 * Nothing in this file is estimated to fill a gap. Where the research hit an
 * information floor, the field says so.
 */

export type Confidence = "high" | "medium" | "low";

export type Archetype =
  | "search"
  | "memory"
  | "capture"
  | "cohort"
  | "gateway";

export type Product = {
  name: string;
  archetype: Archetype;
  /** Funding or ownership, point-in-time July 2026. */
  funding: string;
  /** The traction headline, in the terms the source stated it. */
  traction: string;
  /** How the product actually gets at company data. */
  mechanism: string;
  /** Published list price, quoted, open-source, or nothing public. */
  pricing: "published" | "quote-only" | "open-source" | "none public";
  confidence: Confidence;
  /** Why the confidence isn't higher, or what the number can't carry. */
  caveat?: string;
};

export const ARCHETYPES: { id: Archetype; label: string; blurb: string }[] = [
  {
    id: "search",
    label: "Enterprise search",
    blurb:
      "Connect everything, rank it, answer over it. The oldest shape and the best funded.",
  },
  {
    id: "memory",
    label: "Memory infrastructure",
    blurb:
      "Not a product an employee opens — a substrate other people's agents remember through.",
  },
  {
    id: "capture",
    label: "Meeting capture",
    blurb:
      "Own the conversation before it becomes a document. Increasingly unwilling to stay an ingestion source.",
  },
  {
    id: "cohort",
    label: "Company Brain cohort",
    blurb:
      "The companies using the phrase itself. The widest quality spread of any group here.",
  },
  {
    id: "gateway",
    label: "LLM gateway",
    blurb:
      "The model-routing layer underneath all of the above. Where data residency is decided.",
  },
];

export const PRICING_LABELS: Record<Product["pricing"], string> = {
  published: "list price published",
  "quote-only": "quote only",
  "open-source": "open source",
  "none public": "nothing public",
};

export const PRODUCTS: Product[] = [
  // ── Enterprise search / agentic platforms ──────────────────────────────
  {
    name: "Glean",
    archetype: "search",
    funding: "$150M Series F at $7.2B, June 2025",
    traction: "~$300M revenue run-rate, May 2026",
    mechanism:
      "Connectors in three modes — indexed, live retrieval, hybrid — mirroring source-system ACLs into its own index.",
    pricing: "quote-only",
    confidence: "high",
    caveat:
      "The $300M mixes per-seat and consumption revenue, so it is a run-rate rather than contracted ARR. Every dollar figure for pricing is third-party.",
  },
  {
    name: "Microsoft 365 Copilot",
    archetype: "search",
    funding: "Not applicable — Microsoft",
    traction: "Work IQ data/memory/inference layer announced 2026",
    mechanism:
      "Inherits the tenant's existing Microsoft 365 permissions rather than granting new ones. Strong inside the ecosystem, weak on Salesforce, Confluence and Slack.",
    pricing: "published",
    confidence: "medium",
    caveat:
      "Work IQ is brand new and unproven. It is the closest an incumbent has come to an organisational context graph, which means this row needs rechecking in twelve months.",
  },
  {
    name: "Guru",
    archetype: "search",
    funding: "No disclosed round since 2020",
    traction: "Not established in this pass",
    mechanism:
      "Verified Cards: each unit of knowledge carries a named verifier and a review cadence, and goes stale on a clock.",
    pricing: "quote-only",
    confidence: "low",
    caveat:
      "Six years of funding silence while direct peers raised through 2026. Self-serve pricing was withdrawn in favour of custom quotes.",
  },
  {
    name: "Sana → Workday",
    archetype: "search",
    funding: "Acquired for ~$1.1B, November 2025",
    traction: "Cited in Workday's best new-ACV quarter in five years",
    mechanism:
      "Agent and search layer sitting on Workday's HRMS as the identity backbone.",
    pricing: "quote-only",
    confidence: "high",
    caveat:
      "Sana's own docs confirm that “shared” integrations do not auto-mirror source ACLs — a vendor-acknowledged over-exposure risk.",
  },
  {
    name: "Notion AI",
    archetype: "search",
    funding: "$11B valuation, December 2025",
    traction: "~$600M ARR, roughly half attributed to AI",
    mechanism:
      "Batch ingest to embeddings in a vector store, queried at read time. Not live retrieval.",
    pricing: "published",
    confidence: "medium",
    caveat:
      "The valuation comes from a secondary tender, not a priced round. Pricing was cross-checked between trackers, not against Notion directly.",
  },
  {
    name: "Hebbia",
    archetype: "search",
    funding: "$130M Series B at ~$700M, July 2024",
    traction: "ARR ~$13M — a 2024 figure, never updated",
    mechanism:
      "Matrix: a grid interface running multi-step analysis across large unstructured document libraries.",
    pricing: "quote-only",
    confidence: "low",
    caveat:
      "Two years without a round in a category where peers raised aggressively. This is a genuine information gap, not a finding.",
  },
  {
    name: "Coveo",
    archetype: "search",
    funding: "Public — TSX: CVO",
    traction: "FY26 revenue $148.3M, up 11%, net loss widening",
    mechanism: "Crawl and index into Coveo's own cloud, then generative answering over it.",
    pricing: "quote-only",
    confidence: "high",
  },
  {
    name: "Onyx",
    archetype: "search",
    funding: "$10M seed, March 2025",
    traction: "~31k GitHub stars; Netflix, Ramp and Thales deployments",
    mechanism:
      "Hybrid keyword and vector retrieval over 50+ indexing connectors, with ACL mirroring. MIT core, self-hostable.",
    pricing: "published",
    confidence: "medium",
    caveat: "Funding is thin relative to the traction, which usually resolves one way or the other quickly.",
  },
  {
    name: "GoSearch",
    archetype: "search",
    funding: "Static since February 2022",
    traction: "No independently verified customer logos found",
    mechanism:
      "Federated live retrieval combined with selective indexing — the surviving example of the navigate-don't-index bet.",
    pricing: "published",
    confidence: "low",
    caveat:
      "The architecture claim is the company's own marketing. Nothing independent corroborates the customer base.",
  },
  {
    name: "Dashworks",
    archetype: "search",
    funding: "Acquired by HubSpot; standalone product sunset July 2025",
    traction: "No longer exists as an independent product",
    mechanism:
      "No pre-indexing at all: query-time retrieval against every source. It never built a persistent context layer before being folded in.",
    pricing: "none public",
    confidence: "high",
    caveat: "Pricing shown anywhere for Dashworks is historical. You cannot buy it.",
  },
  {
    name: "Elastic",
    archetype: "search",
    funding: "Public — no figure taken in this pass",
    traction: "Infrastructure, configured and operated by the customer",
    mechanism: "Index and mirror ACLs. A search platform, not a turnkey assistant.",
    pricing: "published",
    confidence: "medium",
    caveat: "Priced by deployment shape rather than seats, so no per-user number is comparable to the rest of this column.",
  },

  // ── Memory / context infrastructure ────────────────────────────────────
  {
    name: "Mem0",
    archetype: "memory",
    funding: "$24M total, including a $20M Series A in October 2025",
    traction: "~61.4k GitHub stars",
    mechanism: "Two-phase fact extraction and consolidation over conversation history.",
    pricing: "published",
    confidence: "high",
    caveat: "Its recall and latency benchmarks are vendor-authored and were never independently reproduced.",
  },
  {
    name: "Letta",
    archetype: "memory",
    funding: "$10M seed at ~$70M, September 2024",
    traction: "Flagship repo now labelled legacy; pivoting to Letta Code",
    mechanism: "Memory blocks — labelled, size-limited units of context the agent edits.",
    pricing: "published",
    confidence: "high",
    caveat: "High confidence in the facts, and the facts describe a strategic pivot. Read the row, not the funding number.",
  },
  {
    name: "Zep / Graphiti",
    archetype: "memory",
    funding: "$500K corroborable — the widely-repeated ~$5M is unverified",
    traction: "Graphiti at 29,028 stars, verified against the GitHub API",
    mechanism: "Temporal knowledge graph: entities and relationship edges that carry validity intervals.",
    pricing: "published",
    confidence: "low",
    caveat: "The funding figure in circulation could not be sourced. That gap is the finding.",
  },
  {
    name: "Cognee",
    archetype: "memory",
    funding: "$7.5M seed, February 2026",
    traction: "29,063 stars, ~200 contributors",
    mechanism: "Extract–cognify–load: build a graph from documents, then query the graph rather than the chunks.",
    pricing: "published",
    confidence: "high",
    caveat: "Benchmarks are self-run, as with everything else in this archetype.",
  },
  {
    name: "Supermemory",
    archetype: "memory",
    funding: "$2.6–3M seed, October 2025",
    traction: "28.5k stars; ships a feature literally called Company Brain",
    mechanism:
      "Fact extraction with supersession — it knows that moving to a new city replaces the old one rather than contradicting it.",
    pricing: "published",
    confidence: "medium",
    caveat:
      "Very early. The user count is investor-sourced. The commit history is the load-bearing evidence here, not the funding.",
  },
  {
    name: "LlamaIndex",
    archetype: "memory",
    funding: "$27.5M total; the ~$93M valuation is unverified",
    traction: "~51k stars",
    mechanism: "A memory module inside a much larger RAG and agent framework, not a memory product.",
    pricing: "published",
    confidence: "medium",
  },

  // ── Meeting and workspace capture ──────────────────────────────────────
  {
    name: "Fireflies",
    archetype: "capture",
    funding: "~$19M raised in total",
    traction: "$1B valuation via a June 2025 secondary sale",
    mechanism: "Transcription, then AskFred and a cross-meeting knowledge layer over the archive.",
    pricing: "published",
    confidence: "medium",
    caveat: "A secondary sale is not a priced round. The ratio of valuation to capital raised is unusual enough to check.",
  },
  {
    name: "Otter",
    archetype: "capture",
    funding: "~$70–73M, last round 2021",
    traction: "Crossed $100M ARR in March 2025; 35M+ users",
    mechanism:
      "Its own speech recognition stack, repositioned in April 2026 as a conversational knowledge engine.",
    pricing: "published",
    confidence: "high",
    caveat: "Traction is well sourced; the funding data is five years stale.",
  },
  {
    name: "Fathom",
    archetype: "capture",
    funding: "~$22–30M including a $17M Series A, September 2024",
    traction: "ARR from ~$100K to ~$30M, 2022 to 2025",
    mechanism: "Capture and automation. Has not tried to become the knowledge layer.",
    pricing: "published",
    confidence: "medium",
    caveat: "The funding total is a range because sources disagree.",
  },
  {
    name: "Circleback",
    archetype: "capture",
    funding: "$2.5M seed",
    traction: "~$16.8M ARR estimated, with 4–8 employees",
    mechanism: "Capture, notes and automations. The smallest team in the set by an order of magnitude.",
    pricing: "published",
    confidence: "low",
    caveat: "The ARR estimate is aggregator-sourced and, at this headcount, extraordinary enough to want a second source.",
  },
  {
    name: "Read AI",
    archetype: "capture",
    funding: "~$81M total at a $450M valuation, October 2024",
    traction: "~112 employees",
    mechanism: "Meeting capture plus Ask Read search and engagement analytics across the archive.",
    pricing: "published",
    confidence: "medium",
  },

  // ── The Company Brain cohort ───────────────────────────────────────────
  {
    name: "Hyper",
    archetype: "cohort",
    funding: "Undisclosed",
    traction: "~$1K MRR across 50+ teams in 12 days, founder-reported",
    mechanism: "Continuous background indexing into a fact graph that carries provenance per fact.",
    pricing: "none public",
    confidence: "low",
    caveat: "Every number is self-reported in a launch thread. The architecture, unusually for this cohort, is inspectable.",
  },
  {
    name: "Memory Store",
    archetype: "cohort",
    funding: "Undisclosed",
    traction: "No independent traction data found",
    mechanism: "Continuous sync from Slack, Gmail and meeting tools, with no manual filing step.",
    pricing: "published",
    confidence: "low",
    caveat: "$150 per user per month is the boldest price in the cohort and the only one published.",
  },
  {
    name: "GBrain",
    archetype: "cohort",
    funding: "Not a company — an open-source project",
    traction: "26,794 stars, verified against the GitHub API",
    mechanism: "CLI and webhook capture into a local Postgres with pgvector. Self-hosted by default.",
    pricing: "open-source",
    confidence: "high",
  },
  {
    name: "GStack",
    archetype: "cohort",
    funding: "Not a company — an open-source project",
    traction: "123,495 stars in about four and a half months, re-verified live",
    mechanism:
      "Agent orchestration for software delivery that consumes GBrain as its memory backend. Adjacent to the category rather than in it.",
    pricing: "open-source",
    confidence: "high",
    caveat:
      "The count is real. What it measures — genuine adoption, viral distribution, or campaign inflation — is not something a star count can tell you.",
  },
  {
    name: "Savant",
    archetype: "cohort",
    funding: "Undisclosed",
    traction: "The smallest public footprint in the cohort",
    mechanism: "Connector-based, per the marketing site. Nothing further is inspectable.",
    pricing: "none public",
    confidence: "low",
    caveat: "A demo booking form and a YC listing are the entire evidence base.",
  },
  {
    name: "Cerenovus",
    archetype: "cohort",
    funding: "Undisclosed",
    traction: "Near-zero public footprint",
    mechanism: "Not determinable. The site returned almost no indexable content on fetch.",
    pricing: "none public",
    confidence: "low",
    caveat: "This row is an information floor, and pre-seed opacity is a real market condition rather than a research failure.",
  },
  {
    name: "Dust",
    archetype: "cohort",
    funding: "$5.5M seed → $16M Series A → $40M Series B, May 2026",
    traction: "300K+ agents across 3,000+ organisations",
    mechanism:
      "Scheduled background sync rather than live retrieval. The MIT-licensed repo carries the actual production system.",
    pricing: "published",
    confidence: "high",
  },
  {
    name: "Needle",
    archetype: "cohort",
    funding: "Seed secured, no figure disclosed",
    traction: "Pivoted twice; now a vertical sales-agent product",
    mechanism:
      "Collection-based RAG in the earlier product, still live as SDKs. The current product is an agent, not a brain.",
    pricing: "published",
    confidence: "low",
  },
  {
    name: "Agno / Scout",
    archetype: "cohort",
    funding: "Unconfirmed — the funding pages were inaccessible",
    traction: "Agno at 41,335 stars; Scout at 640",
    mechanism: "An agent framework with 19 vector-database backends. Scout is the company-brain application on top.",
    pricing: "open-source",
    confidence: "low",
    caveat: "Low confidence on funding, high on the repository data, which is pulled directly from the API. Both are in the same row.",
  },

  // ── LLM gateways ───────────────────────────────────────────────────────
  {
    name: "Kong",
    archetype: "gateway",
    funding: "$345M total at a $2B valuation, October 2024",
    traction: "~43.8k stars on the core gateway",
    mechanism: "Provider-agnostic routing with load-balancing strategies, layered on the Konnect control plane.",
    pricing: "quote-only",
    confidence: "high",
    caveat: "Self-hosting is genuine but less independently validated than LiteLLM's.",
  },
  {
    name: "TrueFoundry",
    archetype: "gateway",
    funding: "$21.3M disclosed, Series A February 2025",
    traction: "1,600+ models behind one API, per the company",
    mechanism: "Latency-based and weighted routing with failover. Deployable inside a customer's own environment.",
    pricing: "published",
    confidence: "medium",
    caveat: "The $73M valuation in circulation is an unverified estimate.",
  },
  {
    name: "Databricks",
    archetype: "gateway",
    funding: "$188B strategic round, July 2026",
    traction: "Not meaningful at this scale",
    mechanism: "Gateway billed through consumption units on top of whatever it routes. No air-gapped deployment.",
    pricing: "quote-only",
    confidence: "high",
  },
  {
    name: "Cloudflare",
    archetype: "gateway",
    funding: "Public — NYSE: NET",
    traction: "$2.17B FY25 revenue, up 30% year over year",
    mechanism:
      "Edge-hosted routing, caching and guardrails. Structurally cloud-bound, and not integrated with Cloudflare's own data-localisation product.",
    pricing: "published",
    confidence: "high",
  },
  {
    name: "LiteLLM",
    archetype: "gateway",
    funding: "Murky — sources give a $1.6–4M seed range",
    traction: "~54.3k stars",
    mechanism:
      "MIT-licensed proxy with documented routing strategies, dual-licensed with a gated enterprise directory. Genuinely air-gappable.",
    pricing: "open-source",
    confidence: "low",
    caveat: "Funding conflicts between sources. The licence structure and the code are verifiable, which is what matters for an embedding decision.",
  },
  {
    name: "Portkey",
    archetype: "gateway",
    funding: "$18M raised, then acquired by Palo Alto Networks in May 2026",
    traction: "Now sold inside Prisma AIRS",
    mechanism: "Load balancing across keys, provider fallback, conditional routing. The gateway itself is MIT-licensed.",
    pricing: "published",
    confidence: "high",
    caveat: "Published pricing predates the acquisition and will be repackaged.",
  },
  {
    name: "OpenRouter",
    archetype: "gateway",
    funding: "$113M Series B at ~$1.3B, May 2026",
    traction: "~25T tokens per week across 8M+ developers",
    mechanism: "Reliability-first automatic routing with pass-through provider pricing plus a platform fee. Hosted only.",
    pricing: "published",
    confidence: "high",
  },
  {
    name: "Martian",
    archetype: "gateway",
    funding: "$9M seed plus an undisclosed strategic round",
    traction: "A ~$1.3B valuation is rumoured and unsourced",
    mechanism: "Per-query model selection on cost, skill and uptime. SaaS only, no self-host evidence found.",
    pricing: "published",
    confidence: "low",
    caveat:
      "This is the one figure in the whole pass I would refuse to put in a deck. It appears everywhere and originates nowhere.",
  },
  {
    name: "Vellum",
    archetype: "gateway",
    funding: "~$25.5M total, $20M Series A July 2025",
    traction: "Swisscom, Redfin, Drata and Headspace named as customers",
    mechanism: "Bring-your-own-keys routing with retry and fallback, deployable into a customer VPC.",
    pricing: "quote-only",
    confidence: "medium",
    caveat: "Public pricing exists but stops short of the tiers that matter; third-party summaries disagree.",
  },
  {
    name: "Eden AI",
    archetype: "gateway",
    funding: "~$4.8M total",
    traction: "200k+ developers claimed",
    mechanism: "Smart routing and failover across providers at a 5.5% platform fee. EU routing is not the same as EU residency.",
    pricing: "published",
    confidence: "medium",
  },
];
