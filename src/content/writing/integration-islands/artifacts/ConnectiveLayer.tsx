import { BrandMark } from "@/components/Brand";
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

/**
 * The census under the diagram: six categories of system, with real products
 * under each.
 *
 * Why it is here at all. The tiers above are drawn as eight boxes labelled with
 * category names, and a category name is an abstraction — "surface area" reads as
 * a word rather than as a problem. Fifteen marks belonging to six categories in
 * one frame is the same claim made concrete, and it is the part of the argument a
 * diagram of empty rectangles cannot make.
 *
 * Why it is honest. These are examples OF EACH CATEGORY, labelled as such in the
 * note below the strip, and every name renders as text beside its mark. It is not
 * a claim about any company's stack, about the author's tooling, or about who uses
 * what. That distinction is the whole reason a logo may sit next to a category
 * name here and may NOT sit next to a number in FiveAnswers — a mark beside
 * "1,310 · Closed Won" would be asserting that a specific vendor produced a
 * specific figure, which is a fact nobody has.
 */
const CENSUS = [
  { category: "CRM", vendors: ["Salesforce", "HubSpot", "Zoho CRM"] },
  { category: "Support", vendors: ["Zendesk", "Freshdesk", "Intercom"] },
  { category: "Payroll & HR", vendors: ["Workday", "Gusto", "Rippling"] },
  { category: "Billing", vendors: ["Stripe", "Chargebee"] },
  { category: "ERP", vendors: ["SAP", "NetSuite"] },
  { category: "Warehouse", vendors: ["Snowflake", "Databricks"] },
] as const;

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
    <div className={styles.root}>
      <div className={styles.diagram} data-scrollx>
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
                rx={0}
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
            rx={0}
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
                rx={0}
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

      <div className={styles.census}>
        <p className={`${styles.censusHead} type-stamp`}>
          Six categories, one company
        </p>
        <ul className={styles.censusGrid}>
          {CENSUS.map((group) => (
            <li key={group.category} className={styles.censusGroup}>
              <span className={`${styles.censusCat} type-stamp`}>
                {group.category}
              </span>
              <span className={styles.censusRow}>
                {group.vendors.map((vendor) => (
                  <span key={vendor} className={styles.vendor}>
                    {/* Not `standalone`: the name is rendered right beside the
                        mark, so the mark is decorative and gets aria-hidden.
                        Standalone would make a screen reader read
                        "Salesforce logo Salesforce". */}
                    <BrandMark name={vendor} size={20} />
                    <span className={`${styles.vendorName} type-body-4`}>
                      {vendor}
                    </span>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className={`${styles.censusNote} type-body-4`}>
          Examples of each category, not any particular company&rsquo;s stack.
          Every one of these is a system of record for something, and every one of
          them holds a different opinion about who your customers are.
        </p>
      </div>
    </div>
  );
}
