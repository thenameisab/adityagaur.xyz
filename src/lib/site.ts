// Single source of truth for site identity, used by metadata, JSON-LD, sitemap, robots, llms.txt.
// TODO: confirm the production domain (Namecheap) before deploy — apex assumed to match the blog.
export const SITE_URL = "https://adityagaur.xyz";

export const person = {
  name: "Aditya Gaur",
  alternateNames: ["Aditya G", "Aditya G."],
  jobTitle: "Chief of Staff",
  worksFor: "Tartan (TartanHQ)",
  location: "Gurugram, India",
  // First-person, present-tense. No sourcing/verification language, ever.
  tagline: "Chief of Staff & AI Builder",
  summary:
    "Chief of Staff at Tartan, building GTM and operating systems for a fast-growing fintech — " +
    "and increasingly, the AI agents that run them. Previously strategy and Chief-of-Staff roles " +
    "across Paris and Berlin.",
  // TODO(Aditya): the public contact address. Until this is set, the footer and
  // the /about/ contact block render LinkedIn only — no placeholder ships.
  email: "",
  sameAs: [
    "https://www.linkedin.com/in/ad1tyagaur",
    "https://blog.adityagaur.xyz",
  ],
};

// Public routes, for sitemap + llms.txt. Keep in sync with the app/ pages.
// /styleguide/ is deliberately absent — it is excluded from the sitemap and robots.
export const routes = [
  { path: "/", title: "Home", priority: 1.0, blurb: "Overview and current work" },
  { path: "/work/", title: "Work", priority: 0.9, blurb: "Systems I've built and run, with outcomes" },
  { path: "/writing/", title: "Writing", priority: 0.8, blurb: "Essays on AI, strategy, and operations" },
  { path: "/wiki/", title: "Wiki", priority: 0.9, blurb: "Personal wiki — work and interests" },
  { path: "/about/", title: "About", priority: 0.8, blurb: "Bio, career timeline, and contact" },
  { path: "/colophon/", title: "Colophon", priority: 0.3, blurb: "How this site is built" },
];

// Old URLs that must not 404 after the IA change (BUILD-BRIEF §5.1).
export const redirects: { from: string; to: string }[] = [
  { from: "/journey/", to: "/about/" },
  { from: "/projects/", to: "/work/" },
  { from: "/essays/", to: "/writing/" },
  { from: "/contact/", to: "/about/" },
];
