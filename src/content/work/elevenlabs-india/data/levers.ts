/**
 * The capstone's initiative portfolio, from its own levers database.
 *
 * One record per initiative or research workstream the squad tracked. The
 * source database carries per-person ownership; here that collapses to a
 * single `mine` flag — the page names nobody, it only marks which levers
 * were this author's. Revenue contributions are the growth model's own
 * modelled targets (₹ crore of the ₹66.9 Cr modelled growth), not results;
 * `null` means the source never priced the lever.
 *
 * The three `cancelled` entries are kept deliberately: all three were fully
 * specced and then abandoned with no recorded reason, which §8 of the page
 * treats as a finding about process, not a gap in the data.
 */

export type Lever = {
  name: string;
  focus: "acquisition" | "retention" | "monetization" | "research";
  /** Understand = research; Define = a specced initiative. */
  kind: "lever" | "research";
  status: "defined" | "wip" | "cancelled";
  /** Target ICPs, empty when the source left the field blank. */
  icps: ("enterprise" | "sme" | "creator")[];
  /** Modelled annual revenue contribution, ₹ crore. null = never priced. */
  revenueCr: number | null;
  /** Owned or co-owned by the author. */
  mine: boolean;
};

export const LEVERS: Lever[] = [
  // ── Acquisition ──
  {
    name: "Partner-led growth: AWS Marketplace",
    focus: "acquisition",
    kind: "lever",
    status: "defined",
    icps: ["enterprise", "sme"],
    revenueCr: 12.35,
    mine: true,
  },
  {
    name: "Event-led growth: a flagship voice-AI summit",
    focus: "acquisition",
    kind: "lever",
    status: "defined",
    icps: ["enterprise", "sme", "creator"],
    revenueCr: 24.7,
    mine: false,
  },
  {
    name: "Account-based marketing",
    focus: "acquisition",
    kind: "lever",
    status: "defined",
    icps: ["enterprise"],
    revenueCr: 4.12,
    mine: false,
  },
  {
    name: "Content loops",
    focus: "acquisition",
    kind: "lever",
    status: "defined",
    icps: ["creator"],
    revenueCr: null,
    mine: false,
  },
  {
    name: "Paid ads",
    focus: "acquisition",
    kind: "lever",
    status: "wip",
    icps: ["sme", "creator"],
    revenueCr: null,
    mine: true,
  },
  {
    name: "Organic & SEO audit",
    focus: "acquisition",
    kind: "research",
    status: "defined",
    icps: ["sme", "creator"],
    revenueCr: null,
    mine: false,
  },
  {
    name: "QuickStart API journey",
    focus: "acquisition",
    kind: "lever",
    status: "cancelled",
    icps: ["sme"],
    revenueCr: null,
    mine: false,
  },

  // ── Engagement & retention ──
  {
    name: "Nexus 50 — a closed-door quarterly forum",
    focus: "retention",
    kind: "lever",
    status: "defined",
    icps: ["enterprise", "sme"],
    revenueCr: 5.99,
    mine: true,
  },
  {
    name: "Voice for Voice — credits for regional-language audio",
    focus: "retention",
    kind: "lever",
    status: "defined",
    icps: ["sme", "creator"],
    revenueCr: 5.99,
    mine: false,
  },
  {
    name: "Resurrection campaigns",
    focus: "retention",
    kind: "lever",
    status: "defined",
    icps: ["sme", "creator"],
    revenueCr: 0.27,
    mine: false,
  },
  {
    name: "Build with ElevenLabs — developer workshops",
    focus: "retention",
    kind: "lever",
    status: "defined",
    icps: ["enterprise", "sme"],
    revenueCr: null,
    mine: true,
  },
  {
    name: "ElevenCreator Lounge",
    focus: "retention",
    kind: "lever",
    status: "cancelled",
    icps: ["creator"],
    revenueCr: null,
    mine: false,
  },
  {
    name: "Quarterly business reviews",
    focus: "retention",
    kind: "lever",
    status: "cancelled",
    icps: ["enterprise"],
    revenueCr: null,
    mine: false,
  },

  // ── Monetization ──
  {
    name: "Metered pricing with micro-top-ups",
    focus: "monetization",
    kind: "lever",
    status: "defined",
    icps: ["sme", "creator"],
    revenueCr: 6.69,
    mine: true,
  },
  {
    name: "Pricing & packaging rework",
    focus: "monetization",
    kind: "lever",
    status: "wip",
    icps: [],
    revenueCr: null,
    mine: true,
  },
  {
    name: "Pricing-today teardown",
    focus: "monetization",
    kind: "research",
    status: "defined",
    icps: [],
    revenueCr: null,
    mine: true,
  },

  // ── Research foundation ──
  {
    name: "User calling — 69 research calls",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: ["enterprise", "sme", "creator"],
    revenueCr: null,
    mine: true,
  },
  {
    name: "ICP framework",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: ["enterprise", "sme", "creator"],
    revenueCr: null,
    mine: true,
  },
  {
    name: "Product onboarding teardown",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: [],
    revenueCr: null,
    mine: true,
  },
  {
    name: "Market research",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: ["enterprise", "sme", "creator"],
    revenueCr: null,
    mine: true,
  },
  {
    name: "Market sizing",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: [],
    revenueCr: null,
    mine: false,
  },
  {
    name: "User segmentation (RFM)",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: ["enterprise", "sme", "creator"],
    revenueCr: null,
    mine: false,
  },
  {
    name: "Product research",
    focus: "research",
    kind: "research",
    status: "defined",
    icps: [],
    revenueCr: null,
    mine: false,
  },
];

/**
 * The growth model's lever → revenue table, as stated. ₹ crore of modelled
 * growth per lever family; the parts sum to the model's own ₹66.9 Cr total.
 */
export const GROWTH_MODEL = {
  goal: { fromCr: 30, toCr: 90 },
  contributions: [
    { label: "Events", cr: 24.7, family: "acquisition" as const },
    { label: "AWS Marketplace", cr: 12.35, family: "acquisition" as const },
    { label: "Metered pricing", cr: 6.69, family: "monetization" as const },
    { label: "Nexus 50", cr: 5.99, family: "retention" as const },
    { label: "Voice for Voice", cr: 5.99, family: "retention" as const },
    { label: "Existing acquisition channels", cr: 5.66, family: "acquisition" as const },
    { label: "ABM", cr: 4.12, family: "acquisition" as const },
    { label: "Existing E&R initiatives", cr: 1.14, family: "retention" as const },
    { label: "Resurrection", cr: 0.27, family: "retention" as const },
  ],
};

/** The churn-factor analysis: six factors coded from the call notes. */
export const CHURN_FACTORS = [
  { label: "Pricing & transparency", insights: 50, pct: 27, icps: "SME & creator" },
  { label: "Audio quality & pronunciation", insights: 45, pct: 23.5, icps: "SME & creator" },
  { label: "Unclear feature journey", insights: 33, pct: 18.1, icps: "Creator" },
  { label: "Reliability & latency", insights: 32, pct: 17, icps: "SME" },
  { label: "API integration & cost ramp", insights: 27, pct: 14.9, icps: "Enterprise & SME" },
  { label: "Missing locales & accents", insights: 23, pct: 12, icps: "SME & creator" },
];
