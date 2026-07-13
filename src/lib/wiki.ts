// Clean, PUBLIC wiki content — hand-authored, first-person, present-tense.
// Hard rules (see the personal-website privacy standard):
//  - No sourcing / verification / provenance language.
//  - No addresses, neighborhoods, view-counts, or inferred life-patterns.
//  - No specific financial holdings, amounts, or apps.
//  - Travel is city-level only.
// This file is the ONLY source for the public wiki. Nothing is imported from the private wiki.

export type WikiSection = {
  heading?: string;
  body?: string[]; // paragraphs
  list?: string[];
};

export type WikiEntry = {
  slug: string;
  title: string;
  category: "work" | "life";
  kicker: string; // short label under the title
  summary: string; // first-person one-liner (used in cards, meta description, JSON-LD)
  sections: WikiSection[];
  related?: string[];
};

export const wikiEntries: WikiEntry[] = [
  // ───────────────────────── WORK ─────────────────────────
  {
    slug: "chief-of-staff",
    title: "Being a Chief of Staff",
    category: "work",
    kicker: "How I work",
    summary:
      "I turn founder intent into systems — the roadmaps, GTM motions, and operating rhythms that let a company move fast without breaking.",
    sections: [
      {
        body: [
          "Chief of Staff is the role I kept gravitating toward before I had the title for it. It sits close enough to the founders to hear what they actually mean, and close enough to the team to make it real. The job is translation: taking \"we should probably do something about this\" and turning it into an owner, a plan, and a date.",
          "In practice that means I build the connective tissue — go-to-market motions, sales and revenue operations, OKR and planning rhythms, and the internal systems that keep product, sales, and ops pointed at the same goal.",
        ],
      },
      {
        heading: "What I actually spend time on",
        list: [
          "Standing up go-to-market and demand-generation from zero, and making the pipeline predictable.",
          "Fundraising strategy and investor narrative — aligning the story with where the business is really going.",
          "Org and operating design: OKRs, planning cadences, and the rituals that keep a team in sync.",
          "Increasingly, building the AI agents and internal tooling that automate the busywork so the team does fewer things by hand.",
        ],
      },
    ],
    related: ["tartan", "building-with-ai", "mindflow"],
  },
  {
    slug: "tartan",
    title: "Tartan",
    category: "work",
    kicker: "Currently · Chief of Staff",
    summary:
      "I'm Chief of Staff at Tartan, a fintech company building API infrastructure — where I own GTM, operating strategy, and fundraising.",
    sections: [
      {
        body: [
          "Tartan is a fintech company building API infrastructure, based in Gurugram. As Chief of Staff I work across the whole surface of the business: architecting the go-to-market and marketing functions, designing the org and OKR structure, and driving fundraising strategy.",
          "It's the kind of stage I like most — early enough that the systems don't exist yet, so you get to build them, and fast enough that getting them right actually matters.",
        ],
      },
    ],
    related: ["chief-of-staff", "building-with-ai"],
  },
  {
    slug: "mindflow",
    title: "Mindflow",
    category: "work",
    kicker: "2022–2025 · Paris",
    summary:
      "For three years in Paris I was Chief of Staff and Strategy Manager at Mindflow, leading partnerships and investor relations.",
    sections: [
      {
        body: [
          "Mindflow is where I spent three years in Paris as Chief of Staff and Strategy Manager. I led the strategic partner program, built out co-selling and integration motions, and ran investor relations through a seed raise.",
          "A lot of what I know about turning partnerships into pipeline — and about keeping a cross-functional team aligned through fast growth — I learned here.",
        ],
      },
    ],
    related: ["chief-of-staff", "essec"],
  },
  {
    slug: "essec",
    title: "ESSEC Business School",
    category: "work",
    kicker: "Master's in Management",
    summary:
      "I earned my Master's in Management at ESSEC, on the Private Equity and Venture Capital track.",
    sections: [
      {
        body: [
          "I did my Master's in Management at ESSEC Business School in France, specializing on the Private Equity and Venture Capital track. It's where the founder instincts I'd built running my own company met the formal side of how capital and strategy move at scale.",
          "That combination — building things, then studying how they get funded and scaled — is the throughline of everything I've done since.",
        ],
      },
    ],
    related: ["mindflow", "investing"],
  },
  {
    slug: "building-with-ai",
    title: "Building with AI",
    category: "work",
    kicker: "AI Builder",
    summary:
      "I build AI agents and internal tools to automate real operating workflows — and I build in the open, including this site.",
    sections: [
      {
        body: [
          "The \"AI Builder\" half of how I describe myself is literal. I build local AI agents and internal tooling to automate the operating workflows a Chief of Staff would otherwise do by hand — research, reporting, pipeline hygiene, the repeatable stuff that quietly eats a week.",
          "I'm most interested in the boring, high-leverage applications: not demos, but systems that keep working after I stop paying attention to them. This site is one of those experiments — built and maintained with AI as a collaborator.",
        ],
      },
    ],
    related: ["chief-of-staff", "tartan"],
  },

  // ───────────────────────── LIFE ─────────────────────────
  {
    slug: "cars",
    title: "Cars & EVs",
    category: "life",
    kicker: "Hobby",
    summary:
      "I treat my car as an ongoing project, not a finished purchase — and I'm genuinely into where EVs are heading.",
    sections: [
      {
        body: [
          "I drive a VW Taigun and I treat it the way some people treat a garden — always one more thing to tweak. Wheels, stance, the small styling decisions that most people never notice: that's the fun part. I'll happily go down a rabbit hole comparing setups for weeks before committing.",
          "I'm also genuinely interested in the EV transition — not as hype, but as an engineering and ownership question. What's actually reliable, what's worth waiting for, what the next few years look like.",
        ],
      },
    ],
    related: ["coffee"],
  },
  {
    slug: "coffee",
    title: "Coffee",
    category: "life",
    kicker: "Hobby",
    summary:
      "I take home coffee more seriously than strictly necessary — good gear, dialed-in, every morning.",
    sections: [
      {
        body: [
          "Coffee is my daily ritual and my favorite excuse to over-optimize something small. I brew at home with gear I've deliberately chosen, and I care about the details — grind, consistency, the difference a good grinder actually makes.",
          "It's the same instinct I bring to everything else: understand the system, dial it in, then enjoy that it just works.",
        ],
      },
    ],
    related: ["cars"],
  },
  {
    slug: "cricket",
    title: "Cricket",
    category: "life",
    kicker: "Hobby",
    summary:
      "Cricket is the constant — I follow it closely enough that it's basically a second job.",
    sections: [
      {
        body: [
          "I've followed cricket my whole life. Live scores are always one tab away, and I'll defend a strong opinion about a match to anyone who'll listen. I also play the mobile cricket-management games more than I'd admit in a job interview.",
          "It's the thing that's stayed exactly the same no matter which city or role I was in.",
        ],
      },
    ],
    related: ["music"],
  },
  {
    slug: "music",
    title: "Music",
    category: "life",
    kicker: "Taste",
    summary:
      "Punjabi music at the core, devotional roots, and a global pop playlist layered on top.",
    sections: [
      {
        body: [
          "My taste sits at an intersection: Punjabi music is the core, there's a devotional thread that comes out around festivals and traditions, and a steady layer of Western pop over the top. It's the soundtrack to the commute, the work, and the coffee.",
          "It's probably the most honest map of where I'm from and where I've been.",
        ],
      },
    ],
    related: ["cricket", "travel"],
  },
  {
    slug: "travel",
    title: "Cities I've lived in",
    category: "life",
    kicker: "Travel",
    summary:
      "My career has moved through New Delhi, Paris, and Berlin — and I've explored a good chunk of Europe along the way.",
    sections: [
      {
        body: [
          "I've built my life and work across a few cities: New Delhi, then Paris for several years, with a running thread through Berlin, and now back in the Delhi NCR region. Along the way I got to explore a good stretch of Europe — the kind of travel that comes from actually living somewhere rather than visiting.",
          "Moving between very different places changed how I work: you learn to read context fast and not assume the way things worked in the last place is the way they work here.",
        ],
      },
    ],
    related: ["mindflow", "music"],
  },
  {
    slug: "investing",
    title: "Markets & investing",
    category: "life",
    kicker: "Interest",
    summary:
      "Markets and investing are a genuine intellectual interest — a natural extension of my PE/VC training.",
    sections: [
      {
        body: [
          "I find markets genuinely interesting to think about — how capital moves, how businesses get valued, why some bets compound and others don't. It's a natural extension of the Private Equity and Venture Capital side of my training, and of the fundraising work I do day to day.",
          "It's the lens I enjoy applying to the world, more than any particular position.",
        ],
      },
    ],
    related: ["essec", "chief-of-staff"],
  },
  {
    slug: "style",
    title: "Style",
    category: "life",
    kicker: "Interest",
    summary:
      "Smart-casual, brand-aware, and biased toward things that are well-made and last.",
    sections: [
      {
        body: [
          "My taste in clothes runs smart-casual and considered — I'd rather have a few well-made pieces than a lot of disposable ones. Same philosophy as the coffee and the car: understand quality, choose deliberately, keep it a while.",
        ],
      },
    ],
    related: ["coffee", "cars"],
  },
];

export const wikiCategories: { id: WikiEntry["category"]; label: string; blurb: string }[] = [
  { id: "work", label: "Work", blurb: "What I do, and the companies and training behind it." },
  { id: "life", label: "Life", blurb: "The things I care about outside of work." },
];

export function getEntry(slug: string) {
  return wikiEntries.find((e) => e.slug === slug);
}

export function entriesByCategory(category: WikiEntry["category"]) {
  return wikiEntries.filter((e) => e.category === category);
}
