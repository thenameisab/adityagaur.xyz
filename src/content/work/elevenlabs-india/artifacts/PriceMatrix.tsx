"use client";

import { useState } from "react";
import { MODULES, PLANS } from "../data/pricing-today";
import { fmtUsd } from "../data/pricing";
import styles from "./PriceMatrix.module.css";

/**
 * The whole public ladder: ten metered modules by six plans.
 *
 * The table renders the complexity as complexity — that is the finding, so
 * no simplification. Pick a module and its row expands into allowance and
 * overage across every plan, with the overage drawn as a bar so the rate
 * curve (cheaper per unit as the plan grows) is visible without reading
 * every number. An em dash in the overage column means the plan will not
 * sell you more at any price, which for Free and Starter is the cliff.
 */

function fmtUnits(n: number, unit: string): string {
  if (unit === "1,000 characters") {
    const chars = n * 1_000;
    if (chars >= 1_000_000) return `${chars / 1_000_000}M chars`;
    return `${chars / 1_000}k chars`;
  }
  const short = unit === "generation" ? "gens" : unit === "hour" ? "h" : "min";
  return `${n.toLocaleString("en-IN")} ${short}`;
}

export default function PriceMatrix() {
  const [moduleId, setModuleId] = useState("tts");
  const mod = MODULES.find((m) => m.id === moduleId)!;
  const maxRate = Math.max(...mod.overageM.map((r) => r ?? 0));

  return (
    <div className={styles.root}>
      <div className={styles.picker} role="tablist" aria-label="Metered module">
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.id === moduleId}
            className={`${styles.pickBtn} type-body-4`}
            data-active={m.id === moduleId || undefined}
            onClick={() => setModuleId(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <table className={styles.table}>
        <caption className={styles.tableCaption}>
          {mod.label}: allowance and overage per plan
        </caption>
        <thead>
          <tr>
            <th scope="col" className="type-body-4">Plan</th>
            <th scope="col" className="type-body-4">$/month</th>
            <th scope="col" className="type-body-4">Included</th>
            <th scope="col" className="type-body-4">
              Overage per {mod.unit}
            </th>
          </tr>
        </thead>
        <tbody>
          {PLANS.map((plan, i) => {
            const rate = mod.overageM[i];
            return (
              <tr key={plan.id}>
                <th scope="row" className={`${styles.planCell} type-body-3`}>
                  {plan.label}
                </th>
                <td className={`${styles.numCell} type-body-3`}>
                  {plan.priceM === 0 ? "$0" : fmtUsd(plan.priceM)}
                </td>
                <td className={`${styles.numCell} type-body-3`}>
                  {fmtUnits(mod.included[i], mod.unit)}
                </td>
                <td className={styles.rateCell}>
                  {rate === null ? (
                    <span className={`${styles.noSale} type-body-3`}>
                      — plan stops
                    </span>
                  ) : (
                    <span className={styles.rateWrap}>
                      <span
                        className={styles.rateBar}
                        style={{ inlineSize: `${(rate / maxRate) * 100}%` }}
                        aria-hidden="true"
                      />
                      <span className={`${styles.rateNum} type-body-3`}>
                        {fmtUsd(rate)}
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className={`${styles.note} type-body-4`}>
        Ten modules, six plans, four unit types, and a different overage rate
        in almost every cell — sixty pricing decisions before a buyer knows
        what a month costs.
      </p>
    </div>
  );
}
