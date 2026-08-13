/**
 * Make the engineering dashboard publishable.
 *
 * The bundle carries `src/lib/identity-map.data.json` — the real roster,
 * email to display name — plus the employer's Jira host and internal product
 * names. All three are replaced before the app is built or served.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { castFor, byLength, firstNamePairs } from "./synthetic-names.mjs";

const ROOT = process.argv[2];

const mapPath = path.join(ROOT, "src/lib/identity-map.data.json");
const identityMap = JSON.parse(await readFile(mapPath, "utf8"));

// The file is { <namespace>: { email: displayName } } — collect both sides.
const realEmails = [];
const realNames = [];
for (const group of Object.values(identityMap)) {
  if (!group || typeof group !== "object") continue;
  for (const [email, name] of Object.entries(group)) {
    if (typeof email === "string" && email.includes("@")) realEmails.push(email);
    if (typeof name === "string" && / /.test(name)) realNames.push(name);
  }
}

const { names, emails } = castFor(realNames, realEmails);

const BRAND = [
  ["tartanhqfintech.atlassian.net", "jira.example"],
  ["tartanhq.com", "northwind.example"],
  ["tartanhq.local", "northwind.example"],
  ["tartanhq", "northwind"],
  ["Tartan HQ", "Northwind"],
  ["Tartan Platform", "Core Platform"],
  ["tartan-tech", "northwind-tech"],
  ["Tartan", "Northwind"],
  ["tartan", "northwind"],
  ["HyperSync", "Sync"],
  ["HyperVerify", "Verify"],
];

const pairs = [
  ...[...names.entries()].sort(byLength),
  ...[...emails.entries()].sort(byLength),
  ...BRAND,
];
const firstPass = firstNamePairs(names);

const files = (await readdir(ROOT, { withFileTypes: true, recursive: true }))
  .filter((d) => d.isFile() && /\.(ts|tsx|js|mjs|json|html|css|md)$/.test(d.name))
  .map((d) => path.join(d.parentPath ?? d.path, d.name))
  .filter((f) => !f.includes("node_modules") && !f.includes("package-lock"));

let touched = 0;
for (const file of files) {
  const before = await readFile(file, "utf8");
  let after = before;
  for (const [from, to] of pairs) after = after.split(from).join(to);
  for (const [re, to] of firstPass) after = after.replace(re, to);
  if (after !== before) {
    await writeFile(file, after);
    touched += 1;
  }
}

console.log(
  `aliased ${names.size} names / ${emails.size} addresses across ${touched} files`,
);

const leaks = files.filter((f) => !/\.test\./.test(f));
const found = [];
for (const file of leaks) {
  const text = await readFile(file, "utf8");
  if (/tartan/i.test(text)) found.push(path.relative(ROOT, file));
}
if (found.length) {
  console.log("LEAKS:", found.join(", "));
  process.exitCode = 1;
}
