import styles from "./ConnectiveLayer.module.css";

/**
 * The three-tier stack from section VI: systems of engagement on top, a neutral
 * connective layer in the middle, systems of record beneath.
 *
 * Authored SVG rather than an image, per BUILD-BRIEF §5.3, and a server component
 * because nothing here needs to be interactive. The struck-through link between
 * two engagement tools is deliberate: what the architecture forbids is as much
 * the point as what it permits.
 */

const ENGAGEMENT = ["CRM", "Helpdesk", "HR portal", "Finance UI"];
const RECORD = ["HRMS", "Payroll", "ERP", "Billing"];

const W = 660;
const H = 310;
const BOX_W = 118;
const BOX_H = 40;
const GAP = 22;
const ROW_W = ENGAGEMENT.length * BOX_W + (ENGAGEMENT.length - 1) * GAP;
const X0 = (W - ROW_W) / 2;

const TOP_Y = 52;
const BAND_Y = 138;
const BAND_H = 52;
const BOT_Y = 240;

const cx = (i: number) => X0 + i * (BOX_W + GAP) + BOX_W / 2;

function Arrow({ x, from, to }: { x: number; from: number; to: number }) {
  const dir = to > from ? 1 : -1;
  const tip = to - 6 * dir;
  return (
    <>
      <line className={styles.flow} x1={x} x2={x} y1={from} y2={tip} />
      <polygon
        className={styles.arrowHead}
        points={`${x - 3.5},${tip} ${x + 3.5},${tip} ${x},${to}`}
      />
    </>
  );
}

export default function ConnectiveLayer() {
  return (
    <div className={styles.root} data-scrollx>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="A three-tier stack. Systems of engagement — CRM, helpdesk, HR portal, finance UI — connect downward into a single neutral connective layer holding the shared model, governance, and semantics. That layer connects down to the systems of record: HRMS, payroll, ERP, billing. Engagement tools do not connect to each other."
      >
        <text className={styles.tierLabel} x={X0} y={TOP_Y - 14}>
          Systems of engagement
        </text>
        {ENGAGEMENT.map((name, i) => (
          <g key={name}>
            <rect
              className={styles.node}
              x={X0 + i * (BOX_W + GAP)}
              y={TOP_Y}
              width={BOX_W}
              height={BOX_H}
              rx={4}
            />
            <text
              className={styles.nodeText}
              x={cx(i)}
              y={TOP_Y + BOX_H / 2 + 4}
              textAnchor="middle"
            >
              {name}
            </text>
          </g>
        ))}

        {/* Engagement → connective layer */}
        {ENGAGEMENT.map((name, i) => (
          <Arrow key={`d-${name}`} x={cx(i)} from={TOP_Y + BOX_H} to={BAND_Y} />
        ))}

        {/* The forbidden peer-to-peer link between two engagement tools. Drawn
            between the two centre boxes so it clears the left-aligned tier label. */}
        <path
          className={styles.forbidden}
          d={`M ${cx(1)} ${TOP_Y + BOX_H / 2} C ${cx(1)} ${TOP_Y - 26}, ${cx(2)} ${TOP_Y - 26}, ${cx(2)} ${TOP_Y + BOX_H / 2}`}
        />
        <g transform={`translate(${(cx(1) + cx(2)) / 2}, ${TOP_Y - 20})`}>
          <line className={styles.forbiddenMark} x1={-5} y1={-5} x2={5} y2={5} />
          <line className={styles.forbiddenMark} x1={5} y1={-5} x2={-5} y2={5} />
        </g>
        <text
          className={styles.forbiddenText}
          x={(cx(1) + cx(2)) / 2}
          y={TOP_Y - 33}
          textAnchor="middle"
        >
          not to each other
        </text>

        {/* The connective layer */}
        <rect
          className={styles.band}
          x={X0 - 16}
          y={BAND_Y}
          width={ROW_W + 32}
          height={BAND_H}
          rx={6}
        />
        <text
          className={styles.bandTitle}
          x={W / 2}
          y={BAND_Y + 21}
          textAnchor="middle"
        >
          Neutral connective tissue &mdash; yours, not a vendor&rsquo;s
        </text>
        <text
          className={styles.bandSub}
          x={W / 2}
          y={BAND_Y + 39}
          textAnchor="middle"
        >
          shared model · governance · semantics
        </text>

        {/* Connective layer → records */}
        {RECORD.map((name, i) => (
          <Arrow key={`r-${name}`} x={cx(i)} from={BAND_Y + BAND_H} to={BOT_Y} />
        ))}

        <text className={styles.tierLabel} x={X0} y={BOT_Y - 14}>
          Systems of record
        </text>
        {RECORD.map((name, i) => (
          <g key={name}>
            <rect
              className={styles.node}
              x={X0 + i * (BOX_W + GAP)}
              y={BOT_Y}
              width={BOX_W}
              height={BOX_H}
              rx={4}
            />
            <text
              className={styles.nodeText}
              x={cx(i)}
              y={BOT_Y + BOX_H / 2 + 4}
              textAnchor="middle"
            >
              {name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
