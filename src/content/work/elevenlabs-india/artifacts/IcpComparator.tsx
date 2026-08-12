"use client";

import { useState } from "react";
import { ICPS, DIMENSIONS, type Dimension } from "../data/icps";
import styles from "./IcpComparator.module.css";

/**
 * The three-ICP framework, dimension by dimension.
 *
 * Four groups of dimensions; the reader picks a group and reads the three
 * customers side by side. The table is real table markup — a screen reader
 * gets the same comparison a sighted reader does — and the source's example
 * companies are replaced by their categories, which is all they ever added.
 */

const GROUPS: { id: Dimension["group"]; label: string }[] = [
  { id: "who", label: "Who they are" },
  { id: "usage", label: "How they use it" },
  { id: "economics", label: "The economics" },
  { id: "risk", label: "The risks" },
];

export default function IcpComparator() {
  const [group, setGroup] = useState<Dimension["group"]>("economics");
  const rows = DIMENSIONS.filter((d) => d.group === group);

  return (
    <div className={styles.root}>
      <div className={styles.picker} role="tablist" aria-label="Dimension group">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={group === g.id}
            className={`${styles.pickBtn} type-body-4`}
            data-active={group === g.id || undefined}
            onClick={() => setGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className={styles.scroll} data-scrollx>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={`${styles.dimHead} type-body-4`}>
                Dimension
              </th>
              {ICPS.map((icp) => (
                <th key={icp.id} scope="col" className={styles.icpHead}>
                  <span className={`${styles.icpLabel} type-body-2`}>{icp.label}</span>
                  <span className={`${styles.icpExample} type-body-4`}>
                    e.g. {icp.example.toLowerCase()}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.key}>
                <th scope="row" className={`${styles.dimCell} type-body-3`}>
                  {d.label}
                </th>
                {d.values.map((v, i) => (
                  <td key={i} className={`${styles.valueCell} type-body-3`}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
