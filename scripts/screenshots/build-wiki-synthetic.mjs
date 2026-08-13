/**
 * Build the wiki from a synthetic corpus instead of the company workspace.
 *
 * The real build has two halves: a collector that knows about Notion, and
 * everything after it — transform, render, index, deploy — which does not
 * care where a page came from. That is the claim the work page makes, and
 * this script is the claim being cashed: it swaps *only* the collector, and
 * runs the shipped renderer, the shipped template, the shipped nav and
 * breadcrumb builders, and the shipped search indexer, unmodified.
 *
 * Implementation note: build.js is a script, not a module, so it is loaded
 * with its Notion calls stubbed out — `notion.pages.retrieve`, block fetching
 * and `n2m.pageToMarkdown` all answer from the corpus. Nothing downstream
 * knows the difference.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { CORPUS } from "./wiki-corpus.mjs";

const ROOT = process.argv[2];
const require = createRequire(path.join(ROOT, "scripts/"));

// A 32-hex id per corpus page, so ids look like the ones the real collector
// produces and `normalizeId` behaves identically.
const idFor = new Map();
CORPUS.forEach((p, i) => {
  idFor.set(p.id, (i + 1).toString(16).padStart(32, "0"));
});
const bySynthId = new Map(CORPUS.map((p) => [idFor.get(p.id), p]));

const source = await readFile(path.join(ROOT, "scripts/build.js"), "utf8");

// Drop the token guard and the auto-run; everything between stays as shipped.
const patched = source
  .replace(
    /if \(!NOTION_TOKEN\) \{[^}]*\}/,
    "// token guard removed: this build has no upstream to authenticate to",
  )
  .replace(/main\(\)\.catch\([^\n]*\n?$/, "")
  .concat(`
module.exports = {
  pageMap, searchIndex,
  notion, n2m,
  setupTransformers, prepDist, renderPage, normalizeId,
  ROOT_PAGE_ID, DIST, ASSETS_DIR,
  set searchIndexRef(v) {},
};
`);

const tmp = path.join(ROOT, "scripts/.build-synthetic.cjs");
await writeFile(tmp, patched);

process.env.NOTION_TOKEN = "synthetic";
const build = require("./.build-synthetic.cjs");

// ─── The swapped collector ───────────────────────────────────────────────────
const rootId = build.normalizeId(build.ROOT_PAGE_ID);
for (const page of CORPUS) {
  const isRoot = page.parent === null;
  const id = isRoot ? rootId : build.normalizeId(idFor.get(page.id));
  const parentId = isRoot
    ? null
    : page.parent === "home"
      ? rootId
      : build.normalizeId(idFor.get(page.parent));
  const parent = parentId ? build.pageMap.get(parentId) : null;
  const slug = page.id;
  const url = isRoot
    ? "/"
    : parent.url === "/"
      ? `/${slug}`
      : `${parent.url}/${slug}`;
  build.pageMap.set(id, {
    id,
    title: page.title,
    url,
    parentId,
    children: [],
    depth: parent ? parent.depth + 1 : 0,
    lastEdited: "2026-08-12T09:20:00.000Z",
  });
  if (parent) parent.children.push(id);
}

// The renderer asks the markdown converter for a page's body; answer from the
// corpus rather than from Notion. Everything after this point is untouched.
build.n2m.pageToMarkdown = async (pageId) => {
  const norm = build.normalizeId(pageId);
  const page = norm === rootId ? CORPUS[0] : bySynthId.get(norm);
  return page ? page.md : "";
};
build.n2m.toMarkdownString = (md) => ({ parent: md });

// ─── The shipped pipeline, from here down ────────────────────────────────────
build.prepDist();
build.setupTransformers();
await Promise.all([...build.pageMap.keys()].map((id) => build.renderPage(id)));
await mkdir(build.ASSETS_DIR, { recursive: true });
await writeFile(
  path.join(build.ASSETS_DIR, "search-index.json"),
  JSON.stringify(build.searchIndex),
);

const bytes = Buffer.byteLength(JSON.stringify(build.searchIndex));
console.log(
  `built ${build.pageMap.size} pages · search index ${(bytes / 1024).toFixed(1)} KB`,
);
