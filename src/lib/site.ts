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
  sameAs: [
    "https://www.linkedin.com/in/ad1tyagaur",
    "https://blog.adityagaur.xyz",
  ],
};

// Public routes, for sitemap + llms.txt. Keep in sync with the app/ pages.
export const routes = [
  { path: "/", title: "Home", priority: 1.0, blurb: "Overview and current work" },
  { path: "/journey/", title: "Journey", priority: 0.9, blurb: "Career timeline" },
  { path: "/wiki/", title: "Wiki", priority: 0.9, blurb: "Personal wiki — work and interests" },
  { path: "/projects/", title: "Systems", priority: 0.8, blurb: "Projects and systems I've built" },
  { path: "/essays/", title: "Essays", priority: 0.7, blurb: "Writing on AI, strategy, and operations" },
  { path: "/contact/", title: "Contact", priority: 0.5, blurb: "Get in touch" },
];
