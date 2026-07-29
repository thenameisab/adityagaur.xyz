"use client";

import { useMemo, useState } from "react";
import Artifact from "./Artifact";
import {
  A3_BRACKETS,
  A3_DEFAULT_VOLUME,
  A3_FLAT,
  A3_INTERFACE,
  A3_MAX_VOLUME,
  BUNDLE,
} from "./engine-data";
import { count, inr } from "./settlement";
import {
  computeFlatRevenue,
  computeVolumeRevenue,
  parseRate,
  toRupees,
  type OutcomeHits,
} from "./volume-pricing";
import styles from "./finlog.module.css";

/**
 * THE FOUR MODELS — chapter 004's artifact.
 *
 * One interface, one real bracket schedule, and the same volume priced three ways
 * on one axis, plus the fourth model in its own panel because it is not a curve.
 * The arithmetic is `volume-pricing.ts` running in the browser — the port that
 * `scripts/verify-volume-pricing.ts` diffs against the seeded build over 309
 * volumes — so what the reader drags is genuinely computed rather than read off
 * stored points.
 *
 * THE CURVES ARE EXACT, NOT SAMPLED, and this is a real departure from the plan
 * worth recording. §7.4 budgets 4ms per frame for regenerating a path decimated
 * to 120 sample points. Both halves of that turn out to be unnecessary once the
 * geometry is looked at properly: all three revenue functions are piecewise
 * LINEAR in volume, so each is drawn from its exact vertices — three points for
 * tier, two per bracket for slab, two for flat — and a sampled approximation
 * could only ever be a worse version of the same line. And the curves do not
 * depend on the slider at all: volume is the x-axis, so dragging moves a marker
 * along fixed geometry rather than redrawing it.
 *
 * That leaves nothing regenerating per frame, which is a better answer to a
 * performance budget than meeting it. The one recompute on drag is a single
 * `computeVolumeRevenue` call per model for the readout, which is the arithmetic
 * the artifact exists to show.
 *
 * THE SLAB DROP IS THE POINT, AND IT IS DRAWN AS A DISCONTINUITY. Whole-volume
 * pricing reprices every unit at the bracket the period's TOTAL lands in, so
 * revenue FALLS at a threshold: on these real brackets it drops ₹30,522.56
 * between 50,000 calls and 50,001 and does not recover until 62,500. Connecting
 * those two points with a sloped line would draw values the function never takes.
 * They are drawn as two separate segments with the fall between them, which is
 * what a jump discontinuity is.
 *
 * NO TRANSITION ON THE MARKER, per §7.2 item 4. Direct manipulation has to be
 * 1:1; a tweened response to a drag reads as lag, not smoothness. The marker moves
 * on the same frame as the thumb.
 */

/** Normalised plot space. The drawing stretches to whatever width its column
 *  resolves to (`preserveAspectRatio="none"`), which is what keeps the axis
 *  labels — all of them HTML — aligned to the geometry under text zoom instead of
 *  frozen at authoring size. Every segment here is straight, so a non-uniform
 *  stretch maps lines to lines and verticals to verticals: the fall stays a fall. */
const VB = 1000;

const single = (total: number): OutcomeHits => ({
  successful: total,
  successfulNoData: 0,
  failed: 0,
  inProgress: 0,
});

type Segment = { points: { x: number; y: number }[] };

export default function PricingModels() {
  const [volume, setVolume] = useState(A3_DEFAULT_VOLUME);

  /** Exact vertices for all three curves, plus the axis maximum they share.
   *  Computed once — nothing here depends on `volume`. */
  const geometry = useMemo(() => {
    const flatRate = parseRate(A3_FLAT.successful);

    // FLAT — one straight line through the origin.
    const flatAtMax = toRupees(computeFlatRevenue(single(A3_MAX_VOLUME), A3_FLAT));

    // TIER — continuous and piecewise linear, so its vertices are exactly the
    // thresholds plus the two ends.
    const tierVertices = [0, ...A3_BRACKETS.map((b) => b.maxHits).filter((c): c is number => c != null), A3_MAX_VOLUME]
      .filter((v, i, a) => v <= A3_MAX_VOLUME && a.indexOf(v) === i)
      .sort((a, b) => a - b)
      .map((total) => ({
        total,
        revenue: toRupees(computeVolumeRevenue("tier", single(total), A3_BRACKETS).revenue),
      }));

    // SLAB — one segment per bracket, because the function jumps between them.
    // A bracket governs totals in (minHits, maxHits], so its segment runs from
    // that opening bound to its cap, and consecutive segments do not join.
    const slabSegments: { total: number; revenue: number }[][] = [];
    for (const bracket of A3_BRACKETS) {
      const from = bracket.minHits;
      const to = Math.min(bracket.maxHits ?? A3_MAX_VOLUME, A3_MAX_VOLUME);
      if (from >= A3_MAX_VOLUME) continue;
      // The first bracket genuinely passes through the origin; later ones open
      // one call past the previous cap, which is where the fall lands.
      const start = from === 0 ? 0 : from + 1;
      slabSegments.push(
        [start, to].map((total) => ({
          total,
          revenue: toRupees(computeVolumeRevenue("slab", single(total), A3_BRACKETS).revenue),
        }))
      );
    }

    const maxRevenue = Math.max(
      flatAtMax,
      ...tierVertices.map((v) => v.revenue),
      ...slabSegments.flat().map((v) => v.revenue)
    );

    const sx = (total: number) => (total / A3_MAX_VOLUME) * VB;
    const sy = (revenue: number) => VB - (revenue / maxRevenue) * VB;
    const toSeg = (pts: { total: number; revenue: number }[]): Segment => ({
      points: pts.map((p) => ({ x: sx(p.total), y: sy(p.revenue) })),
    });

    // Where slab climbs back to the value it had before the first fall. Computed
    // rather than stated: the recovery point is the threshold's revenue divided
    // by the next bracket's rate, and it is exactly 62,500 on these brackets.
    const firstCap = A3_BRACKETS[0].maxHits ?? 0;
    const beforeFall = toRupees(computeVolumeRevenue("slab", single(firstCap), A3_BRACKETS).revenue);
    const afterFall = toRupees(
      computeVolumeRevenue("slab", single(firstCap + 1), A3_BRACKETS).revenue
    );
    const nextRate = toRupees(parseRate(A3_BRACKETS[1].rateSuccessful));
    const recoversAt = Math.ceil(beforeFall / nextRate);

    return {
      flatRate,
      maxRevenue,
      sx,
      sy,
      flat: toSeg([
        { total: 0, revenue: 0 },
        { total: A3_MAX_VOLUME, revenue: flatAtMax },
      ]),
      tier: toSeg(tierVertices),
      slab: slabSegments.map(toSeg),
      thresholds: A3_BRACKETS.map((b) => b.maxHits).filter((c): c is number => c != null && c < A3_MAX_VOLUME),
      fall: { at: firstCap, from: beforeFall, to: afterFall, recoversAt },
    };
  }, []);

  /** The three answers at the chosen volume — one call each, on every change. */
  const at = useMemo(() => {
    const hits = single(volume);
    const tier = computeVolumeRevenue("tier", hits, A3_BRACKETS);
    const slab = computeVolumeRevenue("slab", hits, A3_BRACKETS);
    return {
      flat: toRupees(computeFlatRevenue(hits, A3_FLAT)),
      tier: toRupees(tier.revenue),
      slab: toRupees(slab.revenue),
      /** Which bracket the whole volume repriced into. */
      slabBand: slab.bands[0],
      agree: tier.revenue === slab.revenue,
    };
  }, [volume]);

  const models = [
    { id: "flat", name: "Flat", value: at.flat, rate: `₹${A3_FLAT.successful} every call` },
    {
      id: "tier",
      name: "Graduated",
      value: at.tier,
      rate: "each band's own rate, on that band's calls",
    },
    {
      id: "slab",
      name: "Whole-volume",
      value: at.slab,
      rate: at.slabBand
        ? `₹${A3_BRACKETS.find((b) => b.minHits === at.slabBand!.minHits)?.rateSuccessful} on every call`
        : "—",
    },
  ];

  return (
    <Artifact
      name="The four models"
      caption={
        <>
          {`One interface on one real bracket schedule, with thresholds at ${count(
            50000
          )} and ${count(200000)} calls. `}
          Drag the volume. Graduated and whole-volume agree to the paisa inside the
          first band and part company the instant it is crossed, which is the
          non-obvious thing about volume pricing and the reason a system needs
          both. The fourth model is not a curve, and the panel below says why.
        </>
      }
    >
      <div className={styles.sheet} data-money>
        <div className={styles.sheetHead}>
          <p className="type-eyebrow-3 text-faint">Same month, priced three ways</p>
          <p className="type-figure-3 text-secondary">{A3_INTERFACE}</p>
        </div>

        {/* The control. A native range input, so keyboard, screen reader and
            touch all work without a line of code — and the step is 500 calls,
            coarse enough that a keyboard arrow moves a visible amount and fine
            enough to land either side of a threshold. */}
        <div className={styles.volumeControl}>
          <label className="type-eyebrow-3 text-faint" htmlFor="finlog-a3-volume">
            Monthly volume
          </label>
          <input
            id="finlog-a3-volume"
            className={styles.volumeSlider}
            type="range"
            min={0}
            max={A3_MAX_VOLUME}
            step={500}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-describedby="finlog-a3-readout"
          />
          <output className={`${styles.volumeValue} type-figure-2`} htmlFor="finlog-a3-volume">
            {`${count(volume)} calls`}
          </output>
        </div>

        {/* The plot. Geometry in SVG, every word in HTML, both reading the same
            grid — the §6 rule, and the reason the labels survive a text zoom. */}
        <div className={styles.plot}>
          <div className={styles.plotYAxis}>
            <p className="type-figure-3 text-faint">{inr(geometry.maxRevenue, 0)}</p>
            <p className="type-figure-3 text-faint">{inr(0, 0)}</p>
          </div>

          <svg
            className={styles.plotSvg}
            viewBox={`0 0 ${VB} ${VB}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeLinecap="butt"
              vectorEffect="non-scaling-stroke"
            >
              {/* The two thresholds, full height — the dates-equivalent here:
                  the volumes at which an answer changes. */}
              {geometry.thresholds.map((t) => (
                <line
                  key={t}
                  className={styles.plotThreshold}
                  x1={geometry.sx(t)}
                  y1={0}
                  x2={geometry.sx(t)}
                  y2={VB}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              <polyline
                className={styles.plotFlat}
                points={geometry.flat.points.map((p) => `${p.x},${p.y}`).join(" ")}
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                className={styles.plotTier}
                points={geometry.tier.points.map((p) => `${p.x},${p.y}`).join(" ")}
                vectorEffect="non-scaling-stroke"
              />
              {/* One polyline per bracket, deliberately not joined. */}
              {geometry.slab.map((seg, i) => (
                <polyline
                  key={i}
                  className={styles.plotSlab}
                  points={seg.points.map((p) => `${p.x},${p.y}`).join(" ")}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {/* THE FALL. Each threshold's drop drawn as what it is: a vertical
                  step from the last value of one bracket to the first of the next.
                  This is the chapter's headline and the one mark on the plot that
                  is not a rate. */}
              {geometry.slab.slice(0, -1).map((seg, i) => {
                const end = seg.points[seg.points.length - 1];
                const nextStart = geometry.slab[i + 1].points[0];
                // A tick at each end of the fall. Without them the first
                // threshold's drop is 7px of vertical hairline and reads as a
                // kink in the line rather than a break in the function — the
                // fall is ₹30,522.56 against an axis spanning ₹10,25,970, so it
                // is genuinely small and no scaling of the plot changes that.
                // Marking both included endpoints is also the standard way to
                // draw a step, so the convention and the legibility agree.
                const TICK = 14;
                return (
                  <g key={`fall-${i}`} className={styles.plotFall}>
                    <line
                      x1={end.x}
                      y1={end.y}
                      x2={nextStart.x}
                      y2={nextStart.y}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={end.x - TICK}
                      y1={end.y}
                      x2={end.x + TICK}
                      y2={end.y}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={nextStart.x - TICK}
                      y1={nextStart.y}
                      x2={nextStart.x + TICK}
                      y2={nextStart.y}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}

              {/* Where the reader is. Moves on the drag's own frame. */}
              <line
                className={styles.plotMarker}
                x1={geometry.sx(volume)}
                y1={0}
                x2={geometry.sx(volume)}
                y2={VB}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          {/* THE X AXIS IS POSITIONED FROM THE SAME FRACTION THE GEOMETRY IS, and
              that is a bug fix rather than a refinement. Laid out with
              `justify-content: space-between` — the obvious build — the four
              labels sit at 0 / 33 / 67 / 100% while their thresholds are at 0 /
              16.7 / 66.7 / 100%, so the label reading "50,000" pointed 59px away
              from the line at 50,000 and the plot named the wrong volumes. Only
              measuring caught it; the CSS looked correct.

              Each label now takes its own position from `sx()`, the same scale
              the SVG's thresholds use, so the two cannot drift apart — and
              because the position is a percentage of a container that stretches
              with the drawing, it survives a text zoom the way A4's grid does.
              The inline custom property is the same category as globals.css §11's
              `--i`: a computed position CSS has no way to derive. */}
          <div className={styles.plotXAxis}>
            {[0, ...geometry.thresholds, A3_MAX_VOLUME].map((t, i, all) => (
              <p
                key={t}
                className={`${styles.plotXLabel} type-figure-3 text-faint`}
                style={{ "--at": (t / A3_MAX_VOLUME) * 100 } as React.CSSProperties}
                // The two end labels are anchored to the drawing's edges rather
                // than centred on them, or half of each would hang outside it.
                data-anchor={i === 0 ? "start" : i === all.length - 1 ? "end" : "mid"}
              >
                {count(t)}
              </p>
            ))}
          </div>
        </div>

        {/* The three answers. A money column, so it is measured as one: the
            figures are the comparison, and they line up on their decimal. */}
        <dl className={styles.modelReadout} id="finlog-a3-readout">
          {models.map((m) => (
            <div key={m.id} className={styles.modelRow} data-model={m.id}>
              <dt className={`${styles.modelName} type-body-4 text-secondary`}>
                {m.name}
                <span className={`${styles.modelRate} text-faint`}>{m.rate}</span>
              </dt>
              <dd className={`${styles.modelValue} type-figure-2`} data-sig="settled">
                {inr(m.value)}
              </dd>
            </div>
          ))}
        </dl>

        {/* The one sentence the plot cannot say by itself, and it changes with the
            volume — because whether the two volume models agree is a fact ABOUT
            the chosen volume, not a caption. */}
        <p className={`${styles.plotVerdict} type-body-3 text-secondary`} aria-live="polite">
          {at.agree
            ? `Inside the first band the two volume models are the same number to the paisa: ${inr(
                at.tier
              )} either way. Nothing distinguishes them yet.`
            : `${inr(at.tier)} graduated against ${inr(
                at.slab
              )} whole-volume, on identical brackets and identical usage, a difference of ${inr(
                Math.abs(at.tier - at.slab)
              )}, because whole-volume repriced every call at the band the total landed in.`}
        </p>

        <div className={styles.fallNote} data-rule>
          <p className="type-eyebrow-3 text-faint">The fall</p>
          <p className="type-body-4 text-secondary">
            {`At ${count(geometry.fall.at)} calls whole-volume bills ${inr(
              geometry.fall.from
            )}. At ${count(geometry.fall.at + 1)} it bills ${inr(
              geometry.fall.to
            )} — ${inr(geometry.fall.from - geometry.fall.to)} less for one more call, and it does not climb back past the earlier figure until ${count(
              geometry.fall.recoversAt
            )}. `}
            Not a rounding artefact and not a boundary to smooth away: it is what
            whole-volume pricing contractually is, and an engine that cannot render
            the drop has implemented graduated pricing with the other name on it.
          </p>
        </div>

        {/* THE FOURTH MODEL. Its own panel, because a bundle is a collapse rather
            than a rate and has no answer to give along a volume axis. */}
        <div className={styles.bundlePanel} data-rule>
          <div className={styles.sheetHead}>
            <p className="type-eyebrow-3 text-faint">The fourth model: a bundle</p>
            <p className="type-figure-3 text-secondary">{BUNDLE.period}</p>
          </div>
          <p className="type-body-4 text-secondary">
            {`Three interfaces billed as one product at one agreed price. The anchor line carries all ${count(
              BUNDLE.stitchedCalls
            )} calls; the other two bill nothing, and those two zeroes are not gaps. A bundle has no curve on the axis above because its answer does not vary with one interface's volume, which is exactly why it is a fourth model and not a fourth rate.`}
          </p>
          <dl className={styles.bundleMembers}>
            {BUNDLE.members.map((m) => (
              <div key={m.name} className={styles.bundleMember}>
                <dt className="type-body-4 text-secondary">
                  {m.name}
                  {m.anchor && <span className={`${styles.modelRate} text-faint`}>anchor</span>}
                </dt>
                <dd className="type-figure-3 text-muted">{`${count(m.calls)} calls`}</dd>
                <dd className="type-figure-3" data-sig={m.anchor ? "settled" : "absent"}>
                  {m.anchor ? inr(Number(BUNDLE.billed)) : inr(0)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Artifact>
  );
}
