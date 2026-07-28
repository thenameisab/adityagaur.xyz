"use client";

import { useMemo, useState } from "react";
import styles from "./SearchDemo.module.css";

/**
 * The wiki's search, verbatim — run against a synthetic corpus.
 *
 * The scoring ladder below is the production one, carried over unchanged:
 * exact title 1000, title prefix 800 minus length, title substring 600 minus
 * position, body substring 200 minus capped position, else out. Linear scan,
 * top ten, minimum two characters. What's synthetic is the corpus: the real
 * index carries internal page content, so this one is a stand-in with the
 * same shape — title plus a 500-character body prefix per page.
 */

type Doc = { title: string; body: string };

const CORPUS: Doc[] = [
  { title: "PAN verification", body: "Validates a PAN against the source registry and returns the holder name, status and category. Rate limits, retry semantics and the sandbox test values are listed below. Response arrives in under a second for verified numbers." },
  { title: "PAN-Aadhaar link status", body: "Checks whether a PAN is linked to an Aadhaar number. Returns linked, not-linked or invalid. Used by onboarding flows that must confirm compliance before account creation." },
  { title: "GST taxpayer lookup", body: "Fetches registration details for a GSTIN: legal name, trade name, state, registration date and filing status. Cached for six hours; force refresh with the header documented here." },
  { title: "Bank account verification", body: "Penny-drop verification of an account number and IFSC. Returns the registered holder name for fuzzy matching against the applicant. Failure modes and NPCI downtime handling documented." },
  { title: "Payroll data connector", body: "Pulls salary credits and employer information with employee consent. Setup requires the consent flow described in the onboarding guide. Refresh cadence is monthly." },
  { title: "Onboarding a new client", body: "The end-to-end checklist: sandbox keys, KYC of the client entity, rate plan assignment, webhook registration, and the go-live review. Sales owns steps one and two." },
  { title: "Webhook signatures", body: "Every callback is signed. Verify the HMAC before trusting the payload; sample code in four languages. Rotation policy and replay-window details below." },
  { title: "Sandbox environment", body: "Test credentials, deterministic test values for every verification API, and the differences from production behaviour. The sandbox never calls source registries." },
  { title: "Rate limits and quotas", body: "Default per-minute limits by plan, burst behaviour, the 429 response shape, and how to request a raise. Enterprise plans get dedicated throughput." },
  { title: "Incident process", body: "Who declares, who communicates, where the timeline lives. Postmortems within five working days, blameless, using the template linked here." },
  { title: "PRD template", body: "The standard shape for a product requirements document: problem, evidence, proposal, scope cuts, launch checklist. Copy the page, do not edit the template." },
  { title: "Glossary", body: "Internal shorthand decoded. Every acronym a new hire will meet in week one, each with one sentence and a link to the owning page." },
];

/** The production scorer, unchanged. */
function score(query: string, doc: Doc): number {
  const ql = query.toLowerCase();
  const t = doc.title.toLowerCase();
  const b = doc.body.toLowerCase();
  if (t === ql) return 1000;
  if (t.startsWith(ql)) return 800 - t.length;
  const ti = t.indexOf(ql);
  if (ti >= 0) return 600 - ti;
  const bi = b.indexOf(ql);
  if (bi >= 0) return 200 - Math.min(bi, 200);
  return -1;
}

function excerpt(body: string, query: string): { pre: string; hit: string; post: string } | null {
  const i = body.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return null;
  const start = Math.max(0, i - 40);
  return {
    pre: (start > 0 ? "…" : "") + body.slice(start, i),
    hit: body.slice(i, i + query.length),
    post: body.slice(i + query.length, i + query.length + 90) + "…",
  };
}

const INDEX_BYTES = JSON.stringify(
  CORPUS.map((d) => ({ title: d.title, url: "/x/", body: d.body.slice(0, 500) })),
).length;

export default function SearchDemo() {
  const [query, setQuery] = useState("pan");

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return CORPUS.map((doc) => ({ doc, s: score(query.trim(), doc) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10);
  }, [query]);

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <label className={`${styles.label} type-eyebrow-3`} htmlFor="wiki-q">
          Search — as if you pressed ⌘K
        </label>
        <input
          id="wiki-q"
          className={`${styles.input} type-body-2`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="two characters minimum"
          autoComplete="off"
          spellCheck={false}
        />
        <p className={`${styles.meta} type-body-4`}>
          {CORPUS.length} pages · index {INDEX_BYTES.toLocaleString()} bytes ·
          linear scan, no fetch after first load
        </p>
      </div>

      <ol className={styles.results} aria-live="polite">
        {results.map(({ doc, s }) => {
          const ex = excerpt(doc.body, query.trim());
          const tier =
            s >= 1000 ? "exact title" : s >= 700 ? "title prefix" : s >= 400 ? "title match" : "body match";
          return (
            <li key={doc.title} className={styles.result}>
              <div className={styles.resultHead}>
                <span className={`${styles.resultTitle} type-body-2`}>{doc.title}</span>
                <span className={`${styles.tier} type-body-4`}>
                  {tier} · {s}
                </span>
              </div>
              {ex && tier === "body match" ? (
                <p className={`${styles.excerpt} type-body-4`}>
                  {ex.pre}
                  <mark className={styles.mark}>{ex.hit}</mark>
                  {ex.post}
                </p>
              ) : null}
            </li>
          );
        })}
        {query.trim().length >= 2 && results.length === 0 ? (
          <li className={`${styles.empty} type-body-3`}>
            Nothing. The real one fails the same way — no fuzzy matching, on
            purpose.
          </li>
        ) : null}
        {query.trim().length < 2 ? (
          <li className={`${styles.empty} type-body-3`}>
            Type two characters. Below that, every query would match everything.
          </li>
        ) : null}
      </ol>
    </div>
  );
}
