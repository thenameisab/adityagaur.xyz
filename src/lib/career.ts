// Career timeline, extracted verbatim from the old TimelineScroll.tsx so the
// data outlives the component. Newest first.

export type Role = {
  /** Displayed as-is, in mono. */
  period: string;
  /** Sort key — the year the role started. */
  startYear: number;
  role: string;
  company: string;
  description: string;
};

export const career: Role[] = [
  {
    period: "2025 — Present",
    startYear: 2025,
    role: "Chief of Staff",
    company: "TartanHQ",
    description:
      "Driving a $2.5M acquisition and $15M+ Series A strategy. Architecting GTM and deploying local AI agents to automate internal workflows.",
  },
  {
    period: "2022 — 2025",
    startYear: 2022,
    role: "Chief of Staff, Strategy Manager",
    company: "Mindflow",
    description:
      "Led strategic partnerships and investor relations across 7 VC funds, securing a €5M seed round. Built the B2B pipeline from zero.",
  },
  {
    period: "2023 — 2024",
    startYear: 2023,
    role: "Venture Scout",
    company: "First Momentum Ventures",
    description:
      "Sourced and evaluated early-stage deep tech and fintech startups, and built the deal-flow pipeline behind investment decisions.",
  },
  {
    period: "2021",
    startYear: 2021,
    role: "Strategic Initiatives",
    company: "Powder",
    description:
      "Secured a €2.5M European Innovation Council grant and established 15 partner relationships.",
  },
  {
    period: "2018 — 2020",
    startYear: 2018,
    role: "Co-founder, Strategy & Ops",
    company: "Sordit",
    description:
      "Led a 7-person team across sales, marketing, and operations through early-stage scaling.",
  },
];
