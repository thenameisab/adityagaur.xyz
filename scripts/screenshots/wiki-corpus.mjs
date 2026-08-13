/**
 * A synthetic corpus for the wiki, shaped like the real workspace.
 *
 * The real wiki is compiled out of a live company Notion — 122 pages of
 * internal material that cannot be published. What can be published is the
 * compiler, so this stands in for the source: the same tree shape (section
 * landings with child pages, a glossary, an FAQ), the same kinds of page
 * (offering, runbook, definition), and prose written for a company that does
 * not exist.
 */

export const CORPUS = [
  { id: "home", title: "Home", parent: null, md: `
Everything the team needs to look up, in the fewest clicks we could manage.
Search with **⌘K** from any page.

If a page here is wrong, fix it in the workspace — this site rebuilds nightly.
` },

  { id: "offerings", title: "Offerings", parent: "home", md: `
One page per product surface we sell. Each page states what the endpoint does,
what it returns, who owns it, and what it costs us to serve.
` },
  { id: "identity-verification", title: "Identity verification", parent: "offerings", md: `
Validates a government identity number against the issuing registry and returns
a match verdict with the registered name. Used at onboarding, before any account
is funded.

**Endpoint** \`POST /v1/identity/verify\`

| Field | Type | Notes |
| --- | --- | --- |
| \`document_number\` | string | Uppercase, no spaces |
| \`name\` | string | As entered by the applicant |
| \`consent_ref\` | string | Consent artefact id, required |

Returns \`match\`, \`partial_match\` or \`no_match\`. A \`partial_match\` is a
fuzzy name hit on an exact document hit — treat it as a review queue item, never
as a pass.

**Owner** Platform · **SLA** 99.5% monthly · **Median latency** 340 ms
` },
  { id: "bank-account-check", title: "Bank account check", parent: "offerings", md: `
Confirms a bank account exists and is collecting, by depositing and immediately
reversing a nominal amount. Slower and more expensive than a registry lookup,
and the only method that proves the account is *live* rather than merely valid.

**Endpoint** \`POST /v1/accounts/penny-drop\`

Typical turnaround is eight seconds. Anything past thirty is the upstream bank,
not us — check the status page before escalating.
` },
  { id: "employment-lookup", title: "Employment lookup", parent: "offerings", md: `
Reads employment and contribution history from the national provident registry
with the applicant's consent. Returns employer name, tenure and last
contribution month.

Consent expires after 30 days. A cached response older than that must be
re-fetched; serving it is a compliance finding, not a performance optimisation.
` },
  { id: "income-estimate", title: "Income estimate", parent: "offerings", md: `
Derives a monthly income band from up to six months of statement data. Returns a
band and a confidence, never a single figure, because the underlying data does
not support one.

Bands are ₹25K wide up to ₹2L and ₹50K wide above it.
` },

  { id: "runbooks", title: "Runbooks", parent: "home", md: `
What to do when something is on fire, written before it was on fire.
` },
  { id: "declaring-an-incident", title: "Declaring an incident", parent: "runbooks", md: `
Anyone can declare. You do not need permission, and you will not be judged for a
false positive — an incident that turns out to be nothing costs twenty minutes.

1. Post in **#incidents** with the customer impact in one sentence.
2. Name an incident lead in the same message. If nobody volunteers in two
   minutes, the person who declared is the lead.
3. The lead runs the call and does not debug. That is the whole job.
4. Write the timeline as you go. Reconstructing it afterwards never works.

**Sev-1** means customers cannot transact. **Sev-2** means a surface is degraded
and there is a workaround. Everything else is a bug.
` },
  { id: "rotating-a-credential", title: "Rotating a credential", parent: "runbooks", md: `
Rotate in this order, always: issue the new credential, deploy it alongside the
old one, verify traffic on the new one, then revoke the old one. Reversing steps
three and four is how a rotation becomes an outage.

Partner credentials have a 24-hour overlap window by contract. Internal ones do
not, so schedule those outside office hours.
` },
  { id: "restoring-a-snapshot", title: "Restoring a snapshot", parent: "runbooks", md: `
Snapshots run hourly and are retained for fourteen days. A restore is a new
database, never an in-place overwrite — you promote it once you have compared
row counts against the last known-good hour.

Practice restore is the first Tuesday of the quarter. If it has not been
practised this quarter, it does not work.
` },

  { id: "engineering", title: "Engineering", parent: "home", md: `
How we build, review and ship. Short pages on purpose.
` },
  { id: "code-review", title: "Code review", parent: "engineering", md: `
One reviewer is enough. Two is a signal that the change is too large.

Review for correctness and for the next reader. Style is the formatter's job and
arguing about it in a pull request is a waste of two people.

A review that takes more than a day is a scheduling problem, not a thoroughness
problem — say so and split the change.
` },
  { id: "environments", title: "Environments", parent: "engineering", md: `
Three: **sandbox**, **staging**, **production**.

Sandbox is customer-facing and returns deterministic fixtures. It is the only
environment a partner ever sees, so a break there is a customer break.

Staging shares production's shape and none of its data. Nothing that identifies
a real person is permitted in it, and the seeding job enforces that rather than
asking.
` },
  { id: "on-call", title: "On-call", parent: "engineering", md: `
One primary, one secondary, weekly handover on Monday morning.

The handover note names what is still open, not what was closed. Anything you
silenced during your week is yours to un-silence or ticket before you hand over.
` },

  { id: "people-ops", title: "People & Ops", parent: "home", md: `
Leave, travel, equipment, and the small logistics nobody should have to ask
twice about.
` },
  { id: "leave", title: "Leave", parent: "people-ops", md: `
Eighteen days of privilege leave, eight casual, ten sick, per calendar year.
Up to thirty days carry forward.

Apply in the HR system, not in chat. Two or more consecutive sick days need a
certificate — that is a statutory requirement, not a trust signal.
` },
  { id: "travel-and-expenses", title: "Travel and expenses", parent: "people-ops", md: `
Book your own travel; claim it back within seven working days of returning.

Hotel cap is ₹5,000 a night domestically. Per-diem is ₹1,500 in metros and
₹1,000 elsewhere, no receipts needed against it. Anything above the cap needs
your manager's approval *before* the booking, not after.
` },
  { id: "equipment", title: "Equipment", parent: "people-ops", md: `
Laptop, monitor, keyboard, mouse, headphones. Ask in **#it-help** and it arrives
in two working days.

Everything is encrypted and enrolled in device management on the first boot. An
unmanaged device does not get network access, and there is no exception process
because the block is enforced at the gateway.
` },

  { id: "glossary", title: "Glossary", parent: "home", md: `
What an acronym means here, which is not always what it means elsewhere.
` },
  { id: "sla-vs-slo", title: "SLA vs SLO", parent: "glossary", md: `
An **SLO** is the target we hold ourselves to. An **SLA** is the number in a
contract with money attached to it.

Ours are deliberately different: the SLO is always tighter, so that missing it
is an internal conversation rather than a credit note.
` },
  { id: "tcv", title: "TCV", parent: "glossary", md: `
Total contract value — every rupee a signed contract commits to, across its full
term, including committed minimums but excluding usage above them.

Not ARR. Not booked revenue. When someone says "the deal is worth X", ask which
of the three they mean, because they will usually mean a different one from you.
` },
  { id: "dpd", title: "DPD", parent: "glossary", md: `
Days past due, counted from the first missed instalment and never reset by a
partial payment.

Soft bucket is 0–30, hard bucket is 90+, legal recourse begins at 180.
` },
  { id: "penny-drop", title: "Penny drop", parent: "glossary", md: `
A nominal credit and immediate reversal used to prove a bank account is live.
See **Bank account check** for the endpoint.
` },

  { id: "faqs", title: "FAQs", parent: "home", md: `
The questions that arrive most often, answered once.
` },
  { id: "who-approves-what", title: "Who approves what", parent: "faqs", md: `
Spend under ₹10,000: your manager. Under ₹1,00,000: your manager and finance.
Above that: a founder.

Anything touching a customer contract goes through legal regardless of amount,
including a one-line amendment.
` },
  { id: "how-do-i-get-access", title: "How do I get access", parent: "faqs", md: `
Access follows your team, not your request. If you are on the team, you already
have it; if you are not, the answer is a team change or a time-boxed grant with
an owner attached.

Ask in **#access-requests** with the system and the reason. Grants over seven
days need a named approver.
` },
  { id: "where-does-this-wiki-come-from", title: "Where does this wiki come from", parent: "faqs", md: `
It is compiled. Writers work in the company workspace; a build walks the tree
nightly, converts each page to static HTML, downloads every image, and publishes
the result behind the company sign-in.

Which means: your edit is live tomorrow, not now. If something needs to be right
today, say so and the build can be run by hand.
` },
];
