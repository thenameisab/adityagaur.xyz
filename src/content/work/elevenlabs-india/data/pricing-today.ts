/**
 * ElevenLabs' public price ladder, as the capstone documented it in May 2025.
 *
 * Transcribed from the capstone's own compilation of elevenlabs.io/pricing —
 * second-hand, dated, and kept at its documented values on purpose: the page
 * analyses THIS ladder, so silently updating it to today's prices would break
 * every figure derived from it. Six tiers by ten metered modules, each module
 * with its own unit, allowance, and per-unit overage.
 *
 * All money is integer milli-dollars (1000 = $1) so the artifacts can do
 * exact arithmetic. Overage rates are per the unit stated on the module —
 * per 1,000 characters for TTS, per hour for STT, per minute or generation
 * elsewhere. `null` overage means the plan simply stops: no way to buy more
 * without changing plan, which is the mechanic §3 of the page is about.
 */

export type PlanId = "free" | "starter" | "creator" | "pro" | "scale" | "business";

export const PLANS: { id: PlanId; label: string; priceM: number }[] = [
  { id: "free", label: "Free", priceM: 0 },
  { id: "starter", label: "Starter", priceM: 5_000 },
  { id: "creator", label: "Creator", priceM: 22_000 },
  { id: "pro", label: "Pro", priceM: 99_000 },
  { id: "scale", label: "Scale", priceM: 330_000 },
  { id: "business", label: "Business", priceM: 1_320_000 },
];

export type Module = {
  id: string;
  label: string;
  /** What one unit is, singular, for captions: "1,000 characters", "hour". */
  unit: string;
  /** Allowance per plan, in units, ordered as PLANS. */
  included: [number, number, number, number, number, number];
  /** Overage per unit in milli-dollars, ordered as PLANS. null = cannot buy more. */
  overageM: [number | null, number | null, number | null, number | null, number | null, number | null];
};

export const MODULES: Module[] = [
  {
    id: "tts",
    label: "Text to Speech",
    unit: "1,000 characters",
    included: [20, 60, 200, 1_000, 4_000, 22_000],
    overageM: [null, null, 150, 120, 90, 60],
  },
  {
    id: "stt",
    label: "Speech to Text",
    unit: "hour",
    included: [2.5, 12.5, 62.85, 300, 1_100, 6_000],
    overageM: [null, null, 480, 400, 330, 220],
  },
  {
    id: "voice-changer",
    label: "Voice Changer",
    unit: "minute",
    included: [10, 30, 100, 500, 2_000, 11_000],
    overageM: [null, null, 300, 240, 180, 120],
  },
  {
    id: "sfx",
    label: "Sound Effects",
    unit: "generation",
    included: [50, 150, 500, 2_500, 10_000, 55_000],
    overageM: [null, null, 60, 50, 40, 20],
  },
  {
    id: "voice-isolator",
    label: "Voice Isolator",
    unit: "minute",
    included: [10, 30, 100, 500, 2_000, 11_000],
    overageM: [null, null, 300, 240, 180, 120],
  },
  {
    id: "conv-ai",
    label: "Conversational AI",
    unit: "minute",
    included: [15, 50, 250, 1_100, 3_600, 13_750],
    overageM: [null, null, 120, 110, 100, 96],
  },
  {
    id: "dub-auto-wm",
    label: "Dubbing — automatic, watermarked",
    unit: "minute",
    included: [5, 15, 50, 250, 1_000, 5_500],
    overageM: [null, null, 600, 480, 360, 240],
  },
  {
    id: "dub-auto",
    label: "Dubbing — automatic, no watermark",
    unit: "minute",
    included: [0, 0, 33, 167, 667, 3_667],
    overageM: [null, null, 900, 720, 540, 360],
  },
  {
    id: "dub-studio-wm",
    label: "Dubbing — Studio, watermarked",
    unit: "minute",
    included: [0, 6, 20, 100, 400, 2_200],
    overageM: [null, null, 1_500, 1_200, 900, 600],
  },
  {
    id: "dub-studio",
    label: "Dubbing — Studio, no watermark",
    unit: "minute",
    included: [0, 0, 0, 33, 167, 667],
    overageM: [null, null, null, 900, 720, 540],
  },
];

/**
 * ₹ per $, the capstone's own conversion — its tables price the $22 Creator
 * plan at ₹1,892, and 1892 / 22 = 86 exactly. Kept as the source's rate so
 * every INR figure on the page reproduces the source's tables.
 */
export const INR_PER_USD = 86;
