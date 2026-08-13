import styles from "./Arch.module.css";

/**
 * An architecture diagram, drawn rather than photographed.
 *
 * Every other figure on a work page is either a screenshot of the real product
 * or a working artifact. A system diagram is neither: it is an argument about
 * how the parts relate, and the honest medium for that is a drawing. Drawing it
 * as inline SVG on the site's own tokens buys three things a raster export
 * doesn't — it stays sharp at any zoom, it repaints when the reader changes
 * theme, and its labels are real text a screen reader and a crawler can read.
 *
 * The layout is deliberately dumb: nodes go in columns, left to right, and the
 * component computes positions from the spec. There is no routing solver. An
 * edge between adjacent rows is a straight line; anything else is an orthogonal
 * three-segment path through the gutter between its two columns. Diagrams that
 * need more than that need to be simpler diagrams.
 */

export type ArchNode = {
  id: string;
  label: string;
  /** Second line, set smaller — a technology, a count, a qualifier. */
  sub?: string;
  /** `accent` for the load-bearing node, `muted` for context, `stop` for a refusal. */
  kind?: "default" | "accent" | "muted" | "stop";
};

export type ArchColumn = {
  /** Stage name, printed above the column in small caps. */
  label?: string;
  nodes: ArchNode[];
};

export type ArchEdge = {
  from: string;
  to: string;
  /** Printed at the midpoint of the run. Keep it to two or three words. */
  label?: string;
  /** A dashed edge is a path that is possible rather than routine. */
  dashed?: boolean;
};

const NODE_W = 168;
const NODE_H = 62;
const COL_GAP = 104;
const ROW_GAP = 18;
const PAD_X = 10;
const PAD_TOP = 22; // room for the column labels
const PAD_BOTTOM = 6;

export default function Arch({
  columns,
  edges = [],
  label,
}: {
  columns: ArchColumn[];
  edges?: ArchEdge[];
  /** Accessible name for the whole drawing. */
  label: string;
}) {
  const colHeights = columns.map(
    (c) => c.nodes.length * NODE_H + (c.nodes.length - 1) * ROW_GAP,
  );
  const bodyH = Math.max(...colHeights);
  const width = PAD_X * 2 + columns.length * NODE_W + (columns.length - 1) * COL_GAP;
  const height = PAD_TOP + bodyH + PAD_BOTTOM;

  /** Where every node landed, so the edges can find them by id. */
  const box = new Map<string, { x: number; y: number; col: number }>();
  columns.forEach((col, ci) => {
    const x = PAD_X + ci * (NODE_W + COL_GAP);
    const top = PAD_TOP + (bodyH - colHeights[ci]) / 2;
    col.nodes.forEach((node, ni) => {
      box.set(node.id, { x, y: top + ni * (NODE_H + ROW_GAP), col: ci });
    });
  });

  function path(edge: ArchEdge) {
    const a = box.get(edge.from);
    const b = box.get(edge.to);
    if (!a || !b) return null;

    const ay = a.y + NODE_H / 2;
    const by = b.y + NODE_H / 2;
    const forward = b.col > a.col;
    const x1 = forward ? a.x + NODE_W : a.x;
    const x2 = forward ? b.x : b.x + NODE_W;

    // Same row, next column over: a straight run, which is most of them.
    if (Math.abs(ay - by) < 1) return { d: `M ${x1} ${ay} L ${x2} ${by}`, mx: (x1 + x2) / 2, my: ay };

    // Otherwise turn once in a gutter and once at the target's row. Which
    // gutter matters: a run that skips a column turns as LATE as possible, so
    // its long horizontal segment sits in the source's own lane rather than
    // cutting across the diagram at the target's row and reading as if it
    // came out of whatever box it passed.
    const skips = Math.abs(b.col - a.col) > 1;
    const gutter = COL_GAP / 2;
    const mid = skips
      ? forward
        ? x2 - gutter
        : x2 + gutter
      : forward
        ? x1 + gutter
        : x1 - gutter;
    return {
      d: `M ${x1} ${ay} L ${mid} ${ay} L ${mid} ${by} L ${x2} ${by}`,
      mx: mid,
      my: (ay + by) / 2,
    };
  }

  return (
    <svg
      className={styles.root}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* One marker, inheriting the stroke colour of the path that uses it. */}
        <marker
          id="arch-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 7 4 L 0 7 z" fill="context-stroke" />
        </marker>
      </defs>

      {columns.map((col, ci) =>
        col.label ? (
          <text
            key={`l${ci}`}
            className={styles.colLabel}
            x={PAD_X + ci * (NODE_W + COL_GAP)}
            y={12}
          >
            {col.label}
          </text>
        ) : null,
      )}

      {edges.map((edge, i) => {
        const p = path(edge);
        if (!p) return null;
        return (
          <g key={`e${i}`}>
            <path
              className={`${styles.edge} ${edge.dashed ? styles.dashed : ""}`}
              d={p.d}
              markerEnd="url(#arch-arrow)"
            />
            {edge.label ? (
              <text className={styles.edgeLabel} x={p.mx} y={p.my - 6}>
                {edge.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {columns.flatMap((col) =>
        col.nodes.map((node) => {
          const b = box.get(node.id)!;
          const kind = node.kind ?? "default";
          return (
            <g key={node.id} className={styles[kind]}>
              <rect
                className={styles.box}
                x={b.x}
                y={b.y}
                width={NODE_W}
                height={NODE_H}
                rx={2}
              />
              <text
                className={styles.label}
                x={b.x + 12}
                y={node.sub ? b.y + 26 : b.y + NODE_H / 2 + 4}
              >
                {node.label}
              </text>
              {node.sub ? (
                <text className={styles.sub} x={b.x + 12} y={b.y + 44}>
                  {node.sub}
                </text>
              ) : null}
            </g>
          );
        }),
      )}
    </svg>
  );
}
