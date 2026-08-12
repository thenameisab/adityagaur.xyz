/**
 * The user-research database, anonymised.
 *
 * Generated once from the capstone's Notion research CSV (113 rows, of which
 * 69 are real call records; the rest were placeholders or blank). Names,
 * companies, and roles were dropped AT GENERATION TIME — they never entered
 * this repo or its history. What remains is exactly what the charts need:
 * the shape of the research sprint, not the identities inside it.
 *
 * Field notes:
 * - `icp`: the researcher's own segmentation. `sme` merges the source's
 *   "Startup/SME" and "SME" labels; `agency` was tracked separately there
 *   and is kept separate here.
 * - `status`: `done` merges "Insights Ready" and "Done" — both mean the call
 *   happened and produced notes. `lead` is a contact that never became a
 *   call. 55 of 69 records are completed calls.
 * - `date`: ISO day of the call where recorded. The sprint ran 13–24 April
 *   2025, peaking at 19 calls on the 15th.
 * - `usedElevenLabs`: null means the notes never said either way.
 */

export type Call = {
  icp: "enterprise" | "sme" | "agency" | "creator" | null;
  segment: "b2b" | "b2c" | null;
  size: "startup" | "mid" | "large" | "agency" | null;
  industry: string | null;
  source: "network" | "linkedin" | "paid-ads" | "reddit" | "form" | "community" | "other";
  status: "done" | "scheduled" | "lead";
  userType: "decision-maker" | "influencer" | "user" | null;
  usedElevenLabs: boolean | null;
  date: string | null;
};

export const CALLS: Call[] = [
  { icp: null, segment: null, size: null, industry: "News/Media/Publishing", source: "reddit", status: "lead", userType: null, usedElevenLabs: true, date: null },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Product/SaaS", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-13" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "CCAAS", source: "linkedin", status: "scheduled", userType: "influencer", usedElevenLabs: null, date: "2025-04-15" },
  { icp: "creator", segment: null, size: null, industry: "Product/SaaS", source: "reddit", status: "lead", userType: null, usedElevenLabs: true, date: null },
  { icp: "sme", segment: "b2c", size: "mid", industry: null, source: "linkedin", status: "scheduled", userType: "user", usedElevenLabs: null, date: null },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Product/SaaS", source: "network", status: "done", userType: "influencer", usedElevenLabs: false, date: null },
  { icp: "agency", segment: "b2c", size: "agency", industry: "News/Media/Publishing", source: "reddit", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-15" },
  { icp: null, segment: null, size: null, industry: "Product/SaaS", source: "reddit", status: "lead", userType: null, usedElevenLabs: true, date: null },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Voice AI", source: "linkedin", status: "done", userType: "influencer", usedElevenLabs: null, date: "2025-04-15" },
  { icp: "sme", segment: "b2c", size: "startup", industry: "Voice AI", source: "other", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Product/SaaS", source: "form", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Product/SaaS", source: "network", status: "done", userType: "user", usedElevenLabs: false, date: null },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Dating", source: "network", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Consulting", source: "network", status: "scheduled", userType: "influencer", usedElevenLabs: false, date: "2025-04-13" },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Consulting", source: "community", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "News/Media/Publishing", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2c", size: "startup", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "enterprise", segment: "b2c", size: "large", industry: "News/Media/Publishing", source: "network", status: "done", userType: "influencer", usedElevenLabs: false, date: "2025-04-15" },
  { icp: null, segment: null, size: null, industry: "Transportation", source: "form", status: "lead", userType: null, usedElevenLabs: true, date: null },
  { icp: "sme", segment: "b2c", size: "startup", industry: "Voice AI", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Product/SaaS", source: "linkedin", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Voice AI", source: "linkedin", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "enterprise", segment: "b2c", size: "large", industry: "Aviation", source: "network", status: "done", userType: "influencer", usedElevenLabs: false, date: "2025-04-13" },
  { icp: "sme", segment: "b2c", size: "startup", industry: "Education", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-15" },
  { icp: null, segment: null, size: null, industry: null, source: "paid-ads", status: "lead", userType: null, usedElevenLabs: null, date: null },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Product/SaaS", source: "network", status: "scheduled", userType: "influencer", usedElevenLabs: null, date: "2025-04-15" },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Consulting", source: "network", status: "done", userType: "user", usedElevenLabs: false, date: "2025-04-13" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: null, segment: null, size: null, industry: "Other", source: "form", status: "lead", userType: null, usedElevenLabs: null, date: null },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Consulting", source: "network", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: null, segment: null, size: null, industry: null, source: "paid-ads", status: "lead", userType: null, usedElevenLabs: null, date: null },
  { icp: "enterprise", segment: "b2c", size: "large", industry: "Marketing", source: "linkedin", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "enterprise", segment: "b2c", size: "large", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: null, date: "2025-04-17" },
  { icp: "agency", segment: "b2c", size: "agency", industry: "News/Media/Publishing", source: "linkedin", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Voice Bots", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-13" },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Product/SaaS", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Consulting", source: "linkedin", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: null, segment: null, size: null, industry: null, source: "paid-ads", status: "lead", userType: null, usedElevenLabs: null, date: null },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Consulting", source: "linkedin", status: "done", userType: "decision-maker", usedElevenLabs: null, date: "2025-04-15" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2c", size: "startup", industry: "Product/SaaS", source: "other", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Software Development", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Consulting", source: "linkedin", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Product/SaaS", source: "community", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-14" },
  { icp: null, segment: null, size: null, industry: null, source: "paid-ads", status: "lead", userType: null, usedElevenLabs: null, date: null },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Data Analysis", source: "linkedin", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Product/SaaS", source: "linkedin", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Product/SaaS", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: null },
  { icp: "sme", segment: "b2b", size: "mid", industry: "Product/SaaS", source: "network", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2c", size: "startup", industry: "AI", source: "linkedin", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Product/SaaS", source: "other", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-14" },
  { icp: "sme", segment: "b2b", size: "mid", industry: "AI", source: "linkedin", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "sme", segment: "b2c", size: "mid", industry: "designer", source: "other", status: "done", userType: "user", usedElevenLabs: true, date: "2025-04-17" },
  { icp: "sme", segment: "b2c", size: "mid", industry: "Voice Bots", source: "network", status: "done", userType: "user", usedElevenLabs: false, date: "2025-04-15" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Consulting", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: null, date: "2025-04-17" },
  { icp: "enterprise", segment: "b2c", size: "large", industry: "Industrial/Engineering", source: "network", status: "done", userType: "user", usedElevenLabs: false, date: "2025-04-13" },
  { icp: "sme", segment: "b2c", size: "mid", industry: "Consulting", source: "network", status: "done", userType: "user", usedElevenLabs: false, date: null },
  { icp: "agency", segment: "b2b", size: "agency", industry: "training", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "sme", segment: "b2b", size: "startup", industry: null, source: "other", status: "done", userType: "decision-maker", usedElevenLabs: null, date: null },
  { icp: "agency", segment: "b2c", size: "agency", industry: "Voice AI", source: "network", status: "done", userType: "user", usedElevenLabs: null, date: "2025-04-16" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Product/SaaS", source: "network", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-13" },
  { icp: null, segment: null, size: null, industry: null, source: "network", status: "lead", userType: null, usedElevenLabs: null, date: null },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "CCAAS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "agency", segment: "b2b", size: "agency", industry: "Consulting", source: "linkedin", status: "done", userType: "user", usedElevenLabs: null, date: "2025-04-15" },
  { icp: "sme", segment: "b2b", size: "startup", industry: "Product/SaaS", source: "network", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-15" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "Consulting", source: "other", status: "done", userType: "decision-maker", usedElevenLabs: true, date: "2025-04-16" },
  { icp: "enterprise", segment: "b2b", size: "large", industry: "News/Media/Publishing", source: "other", status: "done", userType: "influencer", usedElevenLabs: true, date: "2025-04-24" },
];
