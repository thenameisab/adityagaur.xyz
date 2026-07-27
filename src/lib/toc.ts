/**
 * Table-of-contents extraction.
 *
 * The rail has to agree with the page, so ids come from exactly two places, in the
 * same order the browser sees them:
 *
 *  1. An explicitly authored `id` on a raw `<h2 id="…">`. `rehype-slug` leaves
 *     those alone, so the extractor must too.
 *  2. Otherwise `GithubSlugger`, which is the slugger `rehype-slug` uses. Same
 *     library, same instance-per-document reset semantics, so duplicate headings
 *     get the same `-1` suffixes on both sides.
 *
 * This reads the MDX source at build time rather than inspecting rendered output,
 * because under `output: "export"` there is no runtime to inspect and a crawler
 * that never runs JS still needs the rail in the HTML.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import GithubSlugger from "github-slugger";

export type TocSection = {
  id: string;
  title: string;
  children: { id: string; title: string }[];
};

const CONTENT_ROOT = join(process.cwd(), "src", "content");

/** Strip the inline markdown and JSX that heading text can legitimately contain. */
function plainText(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lines inside a fenced code block, or inside an artifact's JSX props, are not
 * headings. `###` shows up in both — a markdown example in a code fence, and the
 * `#` of a CSS colour in a prop — so both are skipped.
 */
function contentLines(source: string): string[] {
  const out: string[] = [];
  let inFence = false;
  let jsxDepth = 0;

  for (const line of source.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Track multi-line JSX prop blocks: `steps={[` … `]}`.
    const opens = (line.match(/\{\[/g) ?? []).length;
    const closes = (line.match(/\]\}/g) ?? []).length;
    if (jsxDepth === 0 && !/^\s*(#{2,3} |<h[23])/.test(line)) {
      jsxDepth += opens - closes;
      if (jsxDepth < 0) jsxDepth = 0;
      if (jsxDepth > 0) continue;
    } else if (jsxDepth > 0) {
      jsxDepth += opens - closes;
      if (jsxDepth < 0) jsxDepth = 0;
      continue;
    }

    out.push(line);
  }
  return out;
}

export function tocFor(section: "work" | "writing", slug: string): TocSection[] {
  const source = readFileSync(
    join(CONTENT_ROOT, section, slug, "index.mdx"),
    "utf8",
  );

  const slugger = new GithubSlugger();
  const sections: TocSection[] = [];

  for (const line of contentLines(source)) {
    // Raw `<h2 id="…">Title</h2>` — an authored anchor wins.
    const raw = line.match(/^\s*<h2\s+id="([^"]+)"\s*>(.*?)<\/h2>/);
    if (raw) {
      sections.push({ id: raw[1], title: plainText(raw[2]), children: [] });
      continue;
    }

    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      const title = plainText(h2[1]);
      sections.push({ id: slugger.slug(title), title, children: [] });
      continue;
    }

    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3 && sections.length > 0) {
      const title = plainText(h3[1]);
      sections[sections.length - 1].children.push({
        id: slugger.slug(title),
        title,
      });
    }
  }

  return sections;
}
