/**
 * The three ICPs, as the capstone's comparison table defined them.
 *
 * Reproduced dimension-for-dimension from the source. The named exemplar
 * companies the source used (an airline, a voice-agent startup, a business
 * YouTuber) are replaced by their categories — the framework is the work,
 * the example names were decoration.
 */

export type IcpId = "enterprise" | "sme" | "creator";

export const ICPS: { id: IcpId; label: string; example: string; thesis: string }[] = [
  {
    id: "enterprise",
    label: "Enterprise",
    example: "A national airline",
    thesis: "Cost reduction and automation — voice AI as a strategic advantage.",
  },
  {
    id: "sme",
    label: "SME & startup",
    example: "A voice-agent startup",
    thesis: "Productivity gains — integrate voice AI deeply into workflows.",
  },
  {
    id: "creator",
    label: "Creator & individual",
    example: "A business-content YouTuber",
    thesis: "Creativity and speed — human-like voice content without a studio.",
  },
];

export type Dimension = {
  key: string;
  label: string;
  /** Values ordered enterprise, sme, creator. */
  values: [string, string, string];
  /** Group for the comparator's section rail. */
  group: "who" | "usage" | "economics" | "risk";
};

export const DIMENSIONS: Dimension[] = [
  {
    key: "definition",
    label: "Definition",
    group: "who",
    values: [
      "Large companies with advanced technical and security requirements, deploying to customers at scale",
      "Mid-sized companies expecting a feature-rich product that drives real cost or productivity gains",
      "Power users, creators and individual professionals with creative and productivity use cases",
    ],
  },
  {
    key: "maturity",
    label: "AI maturity",
    group: "who",
    values: [
      "Level 3 — fully embedded: multi-user, priority support, infra-level integration",
      "Level 2 — integrated into workflows via APIs and basic automations",
      "Level 1 — just getting started: TTS, instant cloning",
    ],
  },
  {
    key: "size",
    label: "Company size",
    group: "who",
    values: ["5,000+ FTEs", "250–1,000 FTEs", "1–10 people"],
  },
  {
    key: "revenue",
    label: "Revenue",
    group: "who",
    values: ["$1 billion+", "$100 million+", "n/a"],
  },
  {
    key: "decision",
    label: "Decision makers",
    group: "who",
    values: [
      "CPO, Head of Innovation, Head of Strategy, CXOs",
      "Founder, product lead, marketing manager",
      "The buyer themselves",
    ],
  },
  {
    key: "blockers",
    label: "Decision blockers",
    group: "who",
    values: [
      "Procurement, the economic buyer, internal build teams",
      "Prioritisation, competing tools, internal recommendations",
      "Budget, low awareness, mismatched expectations",
    ],
  },
  {
    key: "use-case",
    label: "Business use case",
    group: "usage",
    values: [
      "Automate L1/L2 support, L&D content, voice content at scale",
      "Sales and marketing productivity, replace human voice-over dependency",
      "“Easy content” at scale — reels, YouTube-to-newsletter pipelines",
    ],
  },
  {
    key: "volume",
    label: "Daily content volume",
    group: "usage",
    values: ["25–50 hours", "1–10 hours", "under 1 hour"],
  },
  {
    key: "frequency",
    label: "Frequency of use",
    group: "usage",
    values: ["Multiple times per hour", "Multiple times per day", "A few times a week"],
  },
  {
    key: "features",
    label: "Most valued features",
    group: "usage",
    values: [
      "Voice agents, RBAC, SSO, custom voice models",
      "APIs, professional voice cloning, multi-account management",
      "TTS, ease of use",
    ],
  },
  {
    key: "cost-reduction",
    label: "Estimated cost reduction",
    group: "economics",
    values: ["Up to 90%", "Up to 70%", "n/a — the gain is speed"],
  },
  {
    key: "tat",
    label: "Turnaround-time gain",
    group: "economics",
    values: ["50–100×", "10–100×", "10–20×"],
  },
  {
    key: "cycle",
    label: "Sales cycle",
    group: "economics",
    values: ["6–8 months", "1–3 months", "Up to 1 month"],
  },
  {
    key: "contract",
    label: "Contract shape",
    group: "economics",
    values: ["1–3 year contracts", "Monthly or annual SaaS", "Monthly SaaS"],
  },
  {
    key: "budget",
    label: "Annual budget",
    group: "economics",
    values: ["$500K+", "~$25K", "$500–$1,500"],
  },
  {
    key: "upsell",
    label: "Upsell potential",
    group: "economics",
    values: ["Medium", "Very high", "High"],
  },
  {
    key: "cross-sell",
    label: "Cross-sell potential",
    group: "economics",
    values: ["Very high", "High", "Low"],
  },
  {
    key: "retention-risk",
    label: "Retention risk",
    group: "risk",
    values: [
      "Slow integration, unrealised ROI against SLAs, poor support or docs",
      "Price competition, the shift to a “cool new tool”",
      "Price perception, infrequent usage",
    ],
  },
  {
    key: "compliance",
    label: "Compliance risk",
    group: "risk",
    values: ["Very high", "Medium to high", "Low"],
  },
  {
    key: "security",
    label: "Security risk",
    group: "risk",
    values: ["Very high", "High", "Medium"],
  },
];
