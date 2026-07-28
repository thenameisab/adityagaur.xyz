"use client";

import { useState } from "react";
import styles from "./ThreadView.module.css";

/**
 * The same three emails, delivered two ways.
 *
 * Left is what a naive sequencer produces: three separate messages, three
 * subjects, three chances to be filed as bulk. Right is what the script does:
 * one thread, with `In-Reply-To` and `References` set from the first message's
 * `Message-ID`, so the follow-ups arrive underneath the original.
 *
 * The headers shown are the ones `sendInThread_` actually writes.
 */

type Mode = "separate" | "threaded";

const MESSAGES = [
  {
    day: "Mon 09:12",
    subject: "Northwind HR x Cadence",
    preview:
      "The integration backlog is the one roadmap item that doesn't ship…",
    headers: ["Message-ID: <a19f…@mail.gmail.com>"],
  },
  {
    day: "Thu 09:41",
    subject: "Re: Northwind HR x Cadence",
    preview:
      "The concrete version: we'd build and maintain a verified connector…",
    headers: [
      "In-Reply-To: <a19f…@mail.gmail.com>",
      "References: <a19f…@mail.gmail.com>",
    ],
  },
  {
    day: "Mon 09:08",
    subject: "Re: Northwind HR x Cadence",
    preview: "I'll park this for the time being. If a tech alliance is worth…",
    headers: [
      "In-Reply-To: <a19f…@mail.gmail.com>",
      "References: <a19f…@mail.gmail.com>",
    ],
  },
];

const SEPARATE_SUBJECTS = [
  "Northwind HR x Cadence",
  "Following up — integrations",
  "One last note on connectors",
];

export default function ThreadView() {
  const [mode, setMode] = useState<Mode>("threaded");
  const threaded = mode === "threaded";

  return (
    <div className={styles.root}>
      <div className={styles.controls} role="group" aria-label="Delivery shape">
        <button
          type="button"
          className={`${styles.control} type-body-3`}
          aria-pressed={mode === "separate"}
          onClick={() => setMode("separate")}
        >
          Three separate sends
        </button>
        <button
          type="button"
          className={`${styles.control} type-body-3`}
          aria-pressed={threaded}
          onClick={() => setMode("threaded")}
        >
          One thread, two replies
        </button>
      </div>

      <div className={styles.inbox}>
        <p className={`${styles.inboxLabel} type-eyebrow-3`}>
          {threaded ? "The prospect's inbox — one row" : "The prospect's inbox — three rows"}
        </p>

        <ul className={styles.list} data-threaded={threaded ? "true" : undefined}>
          {MESSAGES.map((m, i) => (
            <li
              key={i}
              className={styles.message}
              data-nested={threaded && i > 0 ? "true" : undefined}
            >
              <div className={styles.messageHead}>
                <span className={`${styles.subject} type-body-3`}>
                  {threaded ? m.subject : SEPARATE_SUBJECTS[i]}
                </span>
                <span className={`${styles.day} type-body-4`}>{m.day}</span>
              </div>
              <p className={`${styles.preview} type-body-4`}>{m.preview}</p>
              <pre className={`${styles.headers} type-body-4`}>
                <code>
                  {threaded
                    ? m.headers.join("\n")
                    : `Message-ID: <${["a19f", "c40b", "e77d"][i]}…@mail.gmail.com>`}
                </code>
              </pre>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.reading}>
        <p className={`${styles.readingLabel} type-eyebrow-3`}>
          What that costs
        </p>
        <ul className={styles.notes}>
          {(threaded
            ? [
                "One row in the inbox, so the follow-up reads as a continuation rather than a second cold approach.",
                "The whole exchange carries one subject and one Message-ID lineage, which is the signal filters use to treat a conversation as a conversation.",
                "The reader gets the earlier context underneath, so email two can be four lines instead of a re-introduction.",
                "A reply lands in the same thread, which is what makes automatic halt detection a one-line check.",
              ]
            : [
                "Three rows, three subjects, and no lineage tying them together.",
                "Each send is judged on its own, and message two arrives with nothing behind it.",
                "Every follow-up has to re-introduce itself, which is why sequences drift into paragraphs of throat-clearing.",
                "A reply to any one of the three is a separate thread to reconcile against the sheet.",
              ]
          ).map((line) => (
            <li key={line} className={`${styles.note} type-body-3`}>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
