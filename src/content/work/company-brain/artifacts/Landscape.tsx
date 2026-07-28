"use client";

import { useMemo, useState } from "react";
import {
  ARCHETYPES,
  PRICING_LABELS,
  PRODUCTS,
  type Archetype,
  type Confidence,
  type Product,
} from "./landscape-data";
import styles from "./Landscape.module.css";

/**
 * The landscape, with the confidence grades left in.
 *
 * Two filters and a selection. The filter that matters is the confidence one:
 * setting it to "high" is the reader watching two thirds of a market map
 * disappear, which is the argument the page is making, made operable rather
 * than asserted.
 *
 * All data is static and imported at build time — there is no fetch here, and
 * the whole grid is in the server-rendered HTML.
 */

const CONFIDENCE_ORDER: Confidence[] = ["high", "medium", "low"];

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

type ArchetypeFilter = Archetype | "all";
type ConfidenceFilter = Confidence | "all";

function matches(
  product: Product,
  archetype: ArchetypeFilter,
  confidence: ConfidenceFilter,
): boolean {
  if (archetype !== "all" && product.archetype !== archetype) return false;
  if (confidence !== "all" && product.confidence !== confidence) return false;
  return true;
}

export default function Landscape() {
  const [archetype, setArchetype] = useState<ArchetypeFilter>("all");
  const [confidence, setConfidence] = useState<ConfidenceFilter>("all");
  const [selected, setSelected] = useState<string>(PRODUCTS[0].name);

  const shown = useMemo(
    () => PRODUCTS.filter((p) => matches(p, archetype, confidence)),
    [archetype, confidence],
  );

  const counts = useMemo(() => {
    const byConfidence = { high: 0, medium: 0, low: 0 } as Record<
      Confidence,
      number
    >;
    for (const p of PRODUCTS) byConfidence[p.confidence] += 1;
    return byConfidence;
  }, []);

  const active =
    PRODUCTS.find((p) => p.name === selected) ?? PRODUCTS[0];

  const groups = ARCHETYPES.map((a) => ({
    ...a,
    items: shown.filter((p) => p.archetype === a.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <fieldset className={styles.filter}>
          <legend className={`${styles.legend} type-eyebrow-3`}>Archetype</legend>
          <div className={styles.pills}>
            <button
              type="button"
              className={styles.pill}
              aria-pressed={archetype === "all"}
              onClick={() => setArchetype("all")}
            >
              All {PRODUCTS.length}
            </button>
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                type="button"
                className={styles.pill}
                aria-pressed={archetype === a.id}
                onClick={() => setArchetype(a.id)}
              >
                {a.label}{" "}
                <span className={styles.pillCount}>
                  {PRODUCTS.filter((p) => p.archetype === a.id).length}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.filter}>
          <legend className={`${styles.legend} type-eyebrow-3`}>
            Confidence in the headline numbers
          </legend>
          <div className={styles.pills}>
            <button
              type="button"
              className={styles.pill}
              aria-pressed={confidence === "all"}
              onClick={() => setConfidence("all")}
            >
              Any
            </button>
            {CONFIDENCE_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                className={styles.pill}
                data-confidence={c}
                aria-pressed={confidence === c}
                onClick={() => setConfidence(c)}
              >
                {CONFIDENCE_LABEL[c]}{" "}
                <span className={styles.pillCount}>{counts[c]}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <p className={`${styles.tally} type-body-4`} aria-live="polite">
          {shown.length} of {PRODUCTS.length} shown
          {confidence !== "all"
            ? ` — ${PRODUCTS.length - shown.length} hidden by the filter`
            : ""}
        </p>
      </div>

      <div className={styles.body}>
        <div className={styles.map}>
          {groups.map((group) => (
            <section key={group.id} className={styles.group}>
              <h5 className={`${styles.groupName} type-eyebrow-3`}>
                {group.label}
              </h5>
              <p className={`${styles.groupBlurb} type-body-4`}>{group.blurb}</p>
              <ul className={styles.chips}>
                {group.items.map((p) => (
                  <li key={p.name}>
                    <button
                      type="button"
                      className={`${styles.chip} type-body-3`}
                      aria-pressed={p.name === active.name}
                      onClick={() => setSelected(p.name)}
                    >
                      <span
                        className={styles.dot}
                        aria-hidden="true"
                        data-confidence={p.confidence}
                      />
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {groups.length === 0 ? (
            <p className={`${styles.empty} type-body-3`}>
              Nothing in this archetype survives that confidence bar.
            </p>
          ) : null}
        </div>

        <aside className={styles.detail} aria-live="polite">
          <h5 className={`${styles.detailName} type-headline-4`}>
            {active.name}
          </h5>
          <p className={`${styles.detailArchetype} type-body-4`}>
            {ARCHETYPES.find((a) => a.id === active.archetype)?.label} ·{" "}
            {PRICING_LABELS[active.pricing]}
          </p>

          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt className={`${styles.key} type-eyebrow-3`}>Funding</dt>
              <dd className={`${styles.value} type-body-3`}>{active.funding}</dd>
            </div>
            <div className={styles.row}>
              <dt className={`${styles.key} type-eyebrow-3`}>Traction</dt>
              <dd className={`${styles.value} type-body-3`}>{active.traction}</dd>
            </div>
            <div className={styles.row}>
              <dt className={`${styles.key} type-eyebrow-3`}>Mechanism</dt>
              <dd className={`${styles.value} type-body-3`}>{active.mechanism}</dd>
            </div>
          </dl>

          <div
            className={styles.grade}
            data-confidence={active.confidence}
          >
            <span className={`${styles.gradeLabel} type-eyebrow-3`}>
              {CONFIDENCE_LABEL[active.confidence]} confidence
            </span>
            <p className={`${styles.gradeBody} type-body-3`}>
              {active.caveat ??
                "Corroborated across independent sources, with nothing outstanding worth flagging."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
