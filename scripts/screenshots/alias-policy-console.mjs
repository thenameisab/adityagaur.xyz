/**
 * Turn the policy prototype into something publishable.
 *
 * The prototype's seed data is real: a live org chart, real work addresses,
 * real internal product names, real prospect names. This pass replaces every
 * one of those before a single pixel is captured. Employee ids are left alone
 * so the directory, the Jira board, the policy owners and the approval
 * workflows keep referring to each other correctly — only the identities they
 * resolve to change.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.argv[2];

const FIRST = [
  "Aarav", "Ananya", "Rehan", "Meera", "Kabir", "Divya", "Arjun", "Nisha",
  "Vikas", "Pooja", "Siddharth", "Ritu", "Aman", "Shalini", "Karan", "Neha",
  "Yash", "Tanya", "Nikhil", "Priya", "Rahul", "Sneha", "Varun", "Kavya",
  "Manav", "Ishita", "Dev", "Anjali", "Raghu", "Bhavna", "Sameer", "Lata",
];
const LAST = [
  "Iyer", "Menon", "Rao", "Bhatia", "Sinha", "Kulkarni", "Nair", "Deshmukh",
  "Chawla", "Pillai", "Sethi", "Bora", "Grewal", "Mahajan", "Vora", "Salvi",
];

/** Deterministic: the nth employee always gets the same synthetic identity. */
function identity(n) {
  const first = FIRST[n % FIRST.length];
  const last = LAST[(n * 7 + Math.floor(n / FIRST.length)) % LAST.length];
  return { name: `${first} ${last}`, first, last };
}

const source = await readFile(path.join(ROOT, "data.js"), "utf8");

// Pull every real identity out of the employees array so the same person is
// renamed consistently wherever else they appear.
const people = [...source.matchAll(/name:'([^']+)',\s*email:'([^']+)'/g)].map(
  (m) => ({ name: m[1], email: m[2] }),
);

const seen = new Map();
const emails = new Map();
people.forEach((p) => {
  if (seen.has(p.name)) return;
  const id = identity(seen.size);
  let handle = id.first.toLowerCase();
  let n = 1;
  while ([...emails.values()].includes(`${handle}@northwind.example`)) {
    handle = `${id.first.toLowerCase()}.${id.last.toLowerCase()}${n > 1 ? n : ""}`;
    n += 1;
  }
  seen.set(p.name, id.name);
  emails.set(p.email, `${handle}@northwind.example`);
});

// System accounts read better as roles than as people.
seen.set("Talent HQ", "People Ops");
seen.set("Sushma Sahore", "Anita Rege");

/** Longest first, so "Prashant Prabhakara Gupta" wins over "Prashant Gupta". */
const byLength = (a, b) => b[0].length - a[0].length;

// Demo copy and chat transcripts address people by first name only, which a
// full-name pass walks straight past. Word-boundary replace those too, minus
// the ones that are ordinary English words in this codebase.
const NOT_A_NAME_HERE = new Set(["meet", "dev", "open", "group", "home"]);
const firsts = new Map();
for (const [real, fake] of seen) {
  const [realFirst] = real.split(" ");
  const [fakeFirst] = fake.split(" ");
  if (realFirst.length < 4 || NOT_A_NAME_HERE.has(realFirst.toLowerCase())) continue;
  if (!firsts.has(realFirst)) firsts.set(realFirst, fakeFirst);
}

const BRAND = [
  // Product and company names, aliased the way the prose already aliases them.
  ["PolicyOS · Tara", "Policy Console"],
  ["PolicyOS/Tara", "Policy Console"],
  ["PolicyOS / Tara", "Policy Console"],
  ["PolicyOS", "Policy Console"],
  ["Tartan HQ", "Northwind"],
  ["TartanHQ", "Northwind"],
  ["tartanhq.com", "northwind.example"],
  ["tartanhq", "northwind"],
  ["Tartan", "Northwind"],
  ["tartan", "northwind"],
  // The assistant carries a person's name in the real build; this one doesn't.
  ["Tara", "Ada"],
  ["TARA", "ADA"],
  ["tara", "ada"],
  // Sibling products, aliased. Third-party SaaS the prototype connects to
  // (Jira, Notion, Slack, Keka) is deliberately left real — those are other
  // people's public products, named the way the wiki page already names Notion,
  // and their connector logos are fetched by domain, so a renamed label beside
  // a real mark would be the one dishonest thing on the screen.
  ["HyperSync", "Payroll Connect"],
  ["HyperVerify", "Identity Verify"],
  ["Open Claw (Company Brain)", "Company Brain"],
  ["Open Claw", "Company Brain"],
  // Named prospects and counterparties.
  ["MakeMyTrip", "Skyline Travel"],
  ["HDFC", "Rivergate Bank"],
  ["SBI", "Rivergate Bank"],
  // Employee-id prefix, so ids stop spelling the employer's initials.
  ["THQ", "NWD"],
  ["thq", "nwd"],
];

const replacements = [
  ...[...seen.entries()].sort(byLength),
  ...[...emails.entries()].sort(byLength),
  ...BRAND,
];

const files = (await readdir(ROOT, { withFileTypes: true, recursive: true }))
  .filter((d) => d.isFile() && /\.(js|html|css|json)$/.test(d.name))
  .map((d) => path.join(d.parentPath ?? d.path, d.name));

const firstNamePass = [...firsts.entries()].sort(byLength).map(([from, to]) => [
  new RegExp(`\\b${from}\\b`, "g"),
  to,
]);

let touched = 0;
for (const file of files) {
  const before = await readFile(file, "utf8");
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  for (const [re, to] of firstNamePass) after = after.replace(re, to);
  if (after !== before) {
    await writeFile(file, after);
    touched += 1;
  }
}

console.log(
  `aliased ${seen.size} identities across ${touched} files ` +
    `(${files.length} scanned)`,
);

// Anything left in a file the browser actually loads is a miss worth failing
// on. Build scripts and probe fixtures are not served and are not captured.
const SERVED = /^(index|app|core|data|llm|chatstream|pdf|sim|tour)\.(js|html|css)$/;
const leaks = [];
for (const file of files.filter((f) => SERVED.test(path.basename(f)))) {
  const text = await readFile(file, "utf8");
  for (const pattern of [/tartan/i, /PolicyOS/, /\bTara\b/, /@gmail\.com/i, /hypersync/i]) {
    if (pattern.test(text)) leaks.push(`${path.basename(file)}: ${pattern}`);
  }
}
if (leaks.length) {
  console.log("LEAKS REMAINING:");
  for (const l of leaks) console.log("  " + l);
  process.exitCode = 1;
}
