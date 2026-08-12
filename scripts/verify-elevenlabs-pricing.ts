/**
 * THE ELEVENLABS-INDIA PRICING CHECK.
 *
 * The pricing simulator on /work/elevenlabs-india prints money, so the same
 * contract that governs FinLog's volume-pricing port applies here: the pure
 * engine is diffed against a golden file whose expected values were produced
 * by an INDEPENDENT implementation (Python, exact integer arithmetic), not
 * by calling the engine itself. A drift in either ladder's data or in the
 * band arithmetic fails the deploy instead of shipping a wrong number.
 *
 * 504 cases: every plan × a volume sweep chosen to sit on band boundaries,
 * one character to each side of them, and rounding-hostile odd values.
 *
 * Run: npx tsx scripts/verify-elevenlabs-pricing.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  costTodayM,
  costProposedM,
} from "../src/content/work/elevenlabs-india/data/pricing";
import type { PlanId } from "../src/content/work/elevenlabs-india/data/pricing-today";

type GoldenCase = {
  plan: PlanId;
  chars: number;
  today: number | null;
  proposed: number | null;
};

const golden: GoldenCase[] = JSON.parse(
  readFileSync(join(__dirname, "elevenlabs-pricing-golden.json"), "utf8"),
);

let failures = 0;

for (const c of golden) {
  const today = costTodayM(c.plan, c.chars);
  const proposed = costProposedM(c.plan, c.chars);
  if (today !== c.today) {
    failures++;
    console.error(
      `FAIL today    ${c.plan} @ ${c.chars}: engine ${today}, golden ${c.today}`,
    );
  }
  if (proposed !== c.proposed) {
    failures++;
    console.error(
      `FAIL proposed ${c.plan} @ ${c.chars}: engine ${proposed}, golden ${c.proposed}`,
    );
  }
}

if (failures > 0) {
  console.error(`\nelevenlabs-pricing: ${failures} mismatches across ${golden.length} cases.`);
  process.exit(1);
}

console.log(`elevenlabs-pricing: ${golden.length} cases, both ladders match the golden file.`);
