"use client";

import { useMemo, useState } from "react";
import styles from "./SequenceSim.module.css";

/**
 * The sequencer, run forward in time.
 *
 * This is a faithful port of the scheduling rules in `processOne_` — the same
 * daily cap, the same weekday gate, the same step delays, the same "one email
 * per tick" pacing, and the same halt-on-reply. What it does not model is Gmail
 * itself: sends always succeed here, and replies arrive on a fixed schedule
 * rather than whenever a human feels like answering.
 *
 * Determinism matters for a page that must render identically for every reader,
 * so the synthetic contacts and their reply days come from a small integer hash
 * rather than `Math.random`. Same inputs, same run, every time.
 */

type Status = "queued" | "active" | "replied" | "done" | "held";

type Contact = {
  id: number;
  name: string;
  /** Days after email 1 on which this contact answers, or null if they never do. */
  repliesOnDay: number | null;
  /** Inferred addresses start held, exactly as the real sheet does. */
  held: boolean;
};

type Event = {
  day: number;
  contact: number;
  step: 1 | 2 | 3;
  threaded: boolean;
};

type Row = {
  contact: Contact;
  status: Status;
  sent: (number | null)[];
  repliedDay: number | null;
};

/** A tiny deterministic hash. Enough to scatter a synthetic list convincingly. */
function hash(n: number): number {
  let h = (n + 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
}

const COMPANIES = [
  "Northwind HR",
  "Kestrel Payroll",
  "Alder Benefits",
  "Foxglove HCM",
  "Beacon People",
  "Tessellate",
  "Corvid Payroll",
  "Marlowe HRIS",
  "Pellucid",
  "Ridgeline Comp",
  "Suncatch HR",
  "Vellichor Pay",
];

/** 40 synthetic contacts, in the proportions of the real wave-one sheet:
    roughly a quarter of the addresses were inferred rather than verified. */
function buildContacts(count: number): Contact[] {
  return Array.from({ length: count }, (_, i) => {
    const h = hash(i);
    const replyRoll = h % 100;
    return {
      id: i,
      name: `${COMPANIES[i % COMPANIES.length]} ${String.fromCharCode(65 + (i % 26))}`,
      // A minority answer, and they answer somewhere in the first three weeks.
      repliesOnDay: replyRoll < 18 ? 2 + ((h >> 7) % 19) : null,
      held: (h >> 11) % 4 === 0,
    };
  });
}

type Config = {
  dailyCap: number;
  step2Days: number;
  step3Days: number;
  weekdaysOnly: boolean;
  releaseHeld: boolean;
};

type Result = {
  rows: Row[];
  events: Event[];
  /** Emails sent per day, for the bar strip. */
  perDay: number[];
  cappedDays: number[];
  skippedDays: number[];
  lastActiveDay: number;
};

const HORIZON = 30;

/** Day 0 is a Monday, so `day % 7 >= 5` is the weekend. */
function isWeekend(day: number): boolean {
  return day % 7 >= 5;
}

function run(contacts: Contact[], config: Config): Result {
  const rows: Row[] = contacts.map((contact) => ({
    contact,
    status: contact.held && !config.releaseHeld ? "held" : "queued",
    sent: [null, null, null],
    repliedDay: null,
  }));

  const events: Event[] = [];
  const perDay: number[] = [];
  const cappedDays: number[] = [];
  const skippedDays: number[] = [];
  let lastActiveDay = 0;

  for (let day = 0; day < HORIZON; day += 1) {
    if (config.weekdaysOnly && isWeekend(day)) {
      perDay.push(0);
      skippedDays.push(day);
      continue;
    }

    let sentToday = 0;

    for (const row of rows) {
      if (sentToday >= config.dailyCap) break;
      if (row.status === "held" || row.status === "replied" || row.status === "done") {
        continue;
      }

      // Reply check runs before any send, so an answer halts the sequence even
      // if this row was otherwise due a follow-up today.
      const replyDay = row.contact.repliesOnDay;
      if (
        replyDay !== null &&
        row.sent[0] !== null &&
        day >= row.sent[0] + replyDay
      ) {
        row.status = "replied";
        row.repliedDay = day;
        continue;
      }

      const [s1, s2, s3] = row.sent;
      if (s1 === null) {
        row.sent[0] = day;
        row.status = "active";
        events.push({ day, contact: row.contact.id, step: 1, threaded: false });
      } else if (s2 === null && day - s1 >= config.step2Days) {
        row.sent[1] = day;
        events.push({ day, contact: row.contact.id, step: 2, threaded: true });
      } else if (s2 !== null && s3 === null && day - s2 >= config.step3Days) {
        row.sent[2] = day;
        row.status = "done";
        events.push({ day, contact: row.contact.id, step: 3, threaded: true });
      } else {
        continue;
      }

      sentToday += 1;
    }

    perDay.push(sentToday);
    if (sentToday > 0) lastActiveDay = day;
    if (sentToday >= config.dailyCap) cappedDays.push(day);
  }

  return { rows, events, perDay, cappedDays, skippedDays, lastActiveDay };
}

const CONTACTS = buildContacts(40);

const STATUS_LABEL: Record<Status, string> = {
  queued: "Queued",
  active: "Active",
  replied: "Replied — halted",
  done: "Done",
  held: "Hold-VerifyEmail",
};

export default function SequenceSim() {
  const [dailyCap, setDailyCap] = useState(20);
  const [step2Days, setStep2Days] = useState(3);
  const [step3Days, setStep3Days] = useState(4);
  const [weekdaysOnly, setWeekdaysOnly] = useState(true);
  const [releaseHeld, setReleaseHeld] = useState(false);

  const result = useMemo(
    () =>
      run(CONTACTS, {
        dailyCap,
        step2Days,
        step3Days,
        weekdaysOnly,
        releaseHeld,
      }),
    [dailyCap, step2Days, step3Days, weekdaysOnly, releaseHeld],
  );

  const totals = useMemo(() => {
    const counts = { queued: 0, active: 0, replied: 0, done: 0, held: 0 } as Record<
      Status,
      number
    >;
    for (const row of result.rows) counts[row.status] += 1;
    return counts;
  }, [result]);

  const peak = Math.max(1, ...result.perDay);
  const totalSent = result.events.length;
  const threaded = result.events.filter((e) => e.threaded).length;

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={`${styles.label} type-body-4`} htmlFor="sim-cap">
            Daily cap
            <span className={styles.readout}>{dailyCap}</span>
          </label>
          <input
            id="sim-cap"
            className={styles.range}
            type="range"
            min={5}
            max={40}
            step={5}
            value={dailyCap}
            onChange={(e) => setDailyCap(Number(e.target.value))}
          />
          <p className={`${styles.hint} type-body-4`}>
            Apps Script allows 100 a day on a consumer account, 1,500 on Workspace.
            The cap is about the recipient, not the quota.
          </p>
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} type-body-4`} htmlFor="sim-step2">
            Wait before email 2
            <span className={styles.readout}>{step2Days}d</span>
          </label>
          <input
            id="sim-step2"
            className={styles.range}
            type="range"
            min={1}
            max={10}
            value={step2Days}
            onChange={(e) => setStep2Days(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} type-body-4`} htmlFor="sim-step3">
            Wait before email 3
            <span className={styles.readout}>{step3Days}d</span>
          </label>
          <input
            id="sim-step3"
            className={styles.range}
            type="range"
            min={1}
            max={10}
            value={step3Days}
            onChange={(e) => setStep3Days(Number(e.target.value))}
          />
        </div>

        <div className={styles.switches}>
          <button
            type="button"
            className={`${styles.switch} type-body-4`}
            aria-pressed={weekdaysOnly}
            onClick={() => setWeekdaysOnly((v) => !v)}
          >
            Weekdays only
          </button>
          <button
            type="button"
            className={`${styles.switch} type-body-4`}
            aria-pressed={releaseHeld}
            onClick={() => setReleaseHeld((v) => !v)}
          >
            Release the held addresses
          </button>
        </div>
      </div>

      <div className={styles.output}>
        <div className={styles.summary}>
          <div className={styles.metric}>
            <span className={`${styles.metricValue} type-headline-4`}>
              {totalSent}
            </span>
            <span className={`${styles.metricLabel} type-body-4`}>
              emails over 30 days
            </span>
          </div>
          <div className={styles.metric}>
            <span className={`${styles.metricValue} type-headline-4`}>
              {threaded}
            </span>
            <span className={`${styles.metricLabel} type-body-4`}>
              of them in-thread replies
            </span>
          </div>
          <div className={styles.metric}>
            <span className={`${styles.metricValue} type-headline-4`}>
              {totals.replied}
            </span>
            <span className={`${styles.metricLabel} type-body-4`}>
              sequences halted on a reply
            </span>
          </div>
          <div className={styles.metric}>
            <span className={`${styles.metricValue} type-headline-4`}>
              {result.cappedDays.length}
            </span>
            <span className={`${styles.metricLabel} type-body-4`}>
              days that hit the cap
            </span>
          </div>
        </div>

        <div className={styles.chart}>
          <div className={styles.bars} role="img" aria-label={
            `Daily send volume over 30 days, peaking at ${peak} emails. ` +
            `${result.cappedDays.length} days hit the cap of ${dailyCap}.`
          }>
            {result.perDay.map((n, day) => (
              <span
                key={day}
                className={styles.bar}
                data-weekend={
                  weekdaysOnly && isWeekend(day) ? "true" : undefined
                }
                data-capped={n >= dailyCap && n > 0 ? "true" : undefined}
                style={{ "--h": `${(n / peak) * 100}%` } as React.CSSProperties}
              />
            ))}
          </div>
          <p className={`${styles.chartNote} type-body-4`}>
            Day 1 to 30, starting on a Monday. Hollow columns are days the
            weekday gate skipped; filled-to-the-top columns are days the cap
            stopped the run with work still queued. The queue drains by day{" "}
            {result.lastActiveDay + 1}.
          </p>
        </div>

        <ol className={styles.roster}>
          {result.rows.slice(0, 12).map((row) => (
            <li key={row.contact.id} className={styles.rosterRow}>
              <span className={`${styles.rosterName} type-body-4`}>
                {row.contact.name}
              </span>
              <span className={styles.track} aria-hidden="true">
                {Array.from({ length: HORIZON }, (_, day) => {
                  const step = row.sent.findIndex((s) => s === day);
                  const isReply = row.repliedDay === day;
                  return (
                    <span
                      key={day}
                      className={styles.cell}
                      data-step={step >= 0 ? step + 1 : undefined}
                      data-reply={isReply ? "true" : undefined}
                    />
                  );
                })}
              </span>
              <span
                className={`${styles.rosterStatus} type-body-4`}
                data-status={row.status}
              >
                {STATUS_LABEL[row.status]}
              </span>
            </li>
          ))}
        </ol>
        <p className={`${styles.rosterNote} type-body-4`}>
          First 12 of 40 synthetic contacts. Squares are sends — 1, 2, 3 —
          and a ring is the reply that stops the rest.{" "}
          {totals.held > 0
            ? `${totals.held} rows are sitting in Hold-VerifyEmail and will never send until someone checks the address by hand.`
            : "The held rows have been released, so inferred addresses are now sending."}
        </p>
      </div>
    </div>
  );
}
