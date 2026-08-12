/**
 * Verbatim user quotes from the research calls, anonymised.
 *
 * Every quote was cross-checked character-for-character against the call
 * notes before being included; analyst paraphrases that merely read like
 * quotes were excluded. Attribution is by role and segment only — the
 * speakers were interviewed for internal research, not for publication,
 * so their names and employers stay out of the repo entirely.
 */

export type Quote = {
  text: string;
  /** Role + segment, never a name or company. */
  who: string;
  theme: "pricing" | "quality" | "accents" | "churn" | "praise" | "onboarding";
};

export const QUOTES: Quote[] = [
  {
    text: "I'm amazed and floored by ElevenLabs… it changed my skepticism.",
    who: "Filmmaker and producer, agency",
    theme: "praise",
  },
  {
    text: "Four and a half out of five… Indian voice choices still limited… high jump in plan pricing.",
    who: "Filmmaker and producer, agency",
    theme: "pricing",
  },
  {
    text: "We had to operate within pricing ceilings in the Indian market.",
    who: "Co-founder, voice-agent startup",
    theme: "pricing",
  },
  {
    text: "Once the grant ran out… we moved to Cartesia and OpenAI.",
    who: "Co-founder, voice-agent startup",
    theme: "churn",
  },
  {
    text: "UI is quite smooth and useful… better than most TTS models.",
    who: "Founder, B2B startup",
    theme: "praise",
  },
  {
    text: "Currently it's on the pricier side… I'd still wait six months or a year to see improvements before recommending paid use.",
    who: "Founder, B2B startup",
    theme: "pricing",
  },
  {
    text: "We went with Netcore… better explanation, sales support, and API fit.",
    who: "Senior marketing manager, SME",
    theme: "churn",
  },
  {
    text: "We needed something that worked quickly and had Indian voice options.",
    who: "Senior marketing manager, SME",
    theme: "accents",
  },
  {
    text: "I have to do multiple runs to even get close to the real accent.",
    who: "Content creator",
    theme: "accents",
  },
  {
    text: "We actually supplement ElevenLabs with voice actors.",
    who: "Agency producer",
    theme: "accents",
  },
  {
    text: "Integration was easy but the cost scaled very quickly, without transparency.",
    who: "Engineering lead, B2B SME",
    theme: "pricing",
  },
  {
    text: "The onboarding can be so much better here.",
    who: "Product growth lead, SME",
    theme: "onboarding",
  },
  {
    text: "It was fairly easy to learn and use… no complaints.",
    who: "Senior AI product manager, enterprise",
    theme: "praise",
  },
  {
    text: "Pronunciation issues throughout and decided to leave the starter plan.",
    who: "Creator, B2C",
    theme: "churn",
  },
];
