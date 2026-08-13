/**
 * Content layer for the long-form Work and Writing pages.
 *
 * Prose lives in `src/content/<section>/<slug>/index.mdx`. Each MDX file exports
 * a `meta` object alongside its default component, so one file carries both the
 * frontmatter and the body — there is no second place to forget to update.
 *
 * MDX is not type-checked by `tsc`, so `meta` is validated at build time instead:
 * the validators below run while the route is being statically generated, and a
 * missing or malformed field fails `next build` rather than shipping a gap. That
 * is the whole reason this file exists.
 *
 * Work and Writing have deliberately different shapes. A build write-up needs a
 * role, a stack, and a status; an essay needs a publication date and a dek.
 * Sharing one loose type with everything optional would give up the build-time
 * guarantee, so each section gets its own validator over a common core.
 */

import type { ComponentType } from "react";

export const ENTRY_STATUSES = [
  "shipped",
  "in development",
  "prototype",
  "research",
] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

/**
 * The three lifecycle states an entry can be in.
 *
 * - `live`    — built, listed on its index, in the sitemap. The default.
 * - `hidden`  — built at its URL for anyone holding the link, but absent from
 *               the index, the sitemap, and search engines (`noindex`). For
 *               entries being retired gracefully or shared before launch.
 * - `draft`   — not built at all. The route 404s.
 *
 * Managed by hand in each entry's `meta`, or via `npm run admin`.
 */
export const VISIBILITIES = ["live", "hidden", "draft"] as const;

export type Visibility = (typeof VISIBILITIES)[number];

type BaseMeta = {
  /** URL segment. Must match the containing folder name. */
  slug: string;
  title: string;
  /** Short label set above the title. */
  kicker: string;
  /** One line. Drives cards, meta description, and JSON-LD. */
  summary: string;
  /** Ascending. Controls index order. */
  order: number;
  /** Lifecycle state. Defaults to "live"; see VISIBILITIES. */
  visibility: Visibility;
  /** @deprecated Legacy alias — `draft: true` reads as `visibility: "draft"`. */
  draft?: boolean;
};

export type WorkMeta = BaseMeta & {
  role: string;
  timeframe: string;
  stack: string[];
  status: EntryStatus;
  /**
   * A measured result, in the author's own words. Optional on purpose:
   * BUILD-BRIEF §5.2 holds that a vague outcome is worse than none, so an entry
   * with nothing measured omits the field and the template renders no outcome
   * line. Never fill this with an adjective.
   */
  outcome?: string;
  /**
   * Opt into the wide artifact corridor. The prose measure never changes;
   * what widens is the bleed ceiling Plate.module.css allows its figures —
   * from 8rem to 20rem a side. For entries whose artifacts are genuinely
   * data-wide (a 6×10 price matrix, a 69-mark research field), the default
   * ceiling caps every figure at ~60% of a desktop viewport, which is the
   * one kind of content that needs the width. Off by default: prose-led
   * entries keep the tighter, calmer figure width.
   */
  wide?: boolean;
};

export type WritingMeta = BaseMeta & {
  /** The standfirst, in the author's voice. Longer than `summary`. */
  dek: string;
  /** ISO date. Drives the dateline and JSON-LD `datePublished`. */
  published: string;
  /** Rounded reading time in minutes. Stated, not computed, so it can be honest. */
  readingMinutes: number;
};

export type Entry<M> = M & { Content: ComponentType };

/** What an `index.mdx` module looks like from the outside. */
export type EntryModule = {
  default: ComponentType;
  meta: unknown;
};

function fail(section: string, slug: string, problem: string): never {
  throw new Error(
    `[content] src/content/${section}/${slug}/index.mdx — ${problem}. ` +
      `Fix the \`meta\` export; see src/lib/content.ts for the shape.`,
  );
}

/** Field readers that throw rather than let a bad value through. */
function reader(section: string, slug: string, m: Record<string, unknown>) {
  return {
    str(key: string): string {
      const v = m[key];
      if (typeof v !== "string" || v.trim() === "") {
        fail(section, slug, `\`${key}\` must be a non-empty string`);
      }
      return v;
    },
    num(key: string): number {
      const v = m[key];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        fail(section, slug, `\`${key}\` must be a number`);
      }
      return v;
    },
    optStr(key: string): string | undefined {
      const v = m[key];
      if (v !== undefined && typeof v !== "string") {
        fail(section, slug, `\`${key}\` must be a string when present`);
      }
      return v;
    },
  };
}

function base(
  section: string,
  slug: string,
  raw: unknown,
): { meta: BaseMeta; m: Record<string, unknown> } {
  if (typeof raw !== "object" || raw === null) {
    fail(section, slug, "no `meta` export, or it is not an object");
  }
  const m = raw as Record<string, unknown>;
  if (m.slug !== slug) {
    fail(
      section,
      slug,
      `\`slug\` is ${JSON.stringify(m.slug)} but the folder is "${slug}" — they must match`,
    );
  }
  if (
    m.visibility !== undefined &&
    !VISIBILITIES.includes(m.visibility as Visibility)
  ) {
    fail(
      section,
      slug,
      `\`visibility\` must be one of ${VISIBILITIES.map((x) => `"${x}"`).join(", ")}`,
    );
  }
  if (m.draft !== undefined && typeof m.draft !== "boolean") {
    fail(section, slug, "`draft` must be a boolean when present");
  }
  if (m.draft === true && m.visibility !== undefined) {
    fail(
      section,
      slug,
      "`draft: true` and `visibility` are two answers to one question — keep only `visibility`",
    );
  }
  const r = reader(section, slug, m);
  return {
    m,
    meta: {
      slug,
      title: r.str("title"),
      kicker: r.str("kicker"),
      summary: r.str("summary"),
      order: r.num("order"),
      visibility:
        m.draft === true ? "draft" : ((m.visibility as Visibility) ?? "live"),
    },
  };
}

/**
 * Turn a registry of MDX modules into validated entries, sorted for the index.
 *
 * Registries list their modules with explicit `import` statements rather than a
 * glob. Explicit imports type-check, work identically under both bundlers, and
 * keep the static-export build honest about exactly which pages exist. Adding a
 * page is one folder plus one line.
 */
function build<M>(
  section: string,
  modules: Record<string, EntryModule>,
  validate: (section: string, slug: string, raw: unknown) => M,
): Entry<M>[] {
  return Object.entries(modules)
    .map(([slug, mod]) => ({
      ...validate(section, slug, mod.meta),
      Content: mod.default,
    }))
    .sort(
      (a, b) =>
        (a as unknown as BaseMeta).order - (b as unknown as BaseMeta).order,
    );
}

export function buildWorkEntries(
  modules: Record<string, EntryModule>,
): Entry<WorkMeta>[] {
  return build("work", modules, (section, slug, raw) => {
    const { meta, m } = base(section, slug, raw);
    const r = reader(section, slug, m);
    if (!Array.isArray(m.stack) || m.stack.some((x) => typeof x !== "string")) {
      fail(section, slug, "`stack` must be an array of strings");
    }
    if (!ENTRY_STATUSES.includes(m.status as EntryStatus)) {
      fail(
        section,
        slug,
        `\`status\` must be one of ${ENTRY_STATUSES.map((x) => `"${x}"`).join(", ")}`,
      );
    }
    if (m.wide !== undefined && typeof m.wide !== "boolean") {
      fail(section, slug, "`wide` must be a boolean when present");
    }
    return {
      ...meta,
      role: r.str("role"),
      timeframe: r.str("timeframe"),
      stack: m.stack as string[],
      status: m.status as EntryStatus,
      outcome: r.optStr("outcome"),
      wide: m.wide === true,
    };
  });
}

export function buildWritingEntries(
  modules: Record<string, EntryModule>,
): Entry<WritingMeta>[] {
  return build("writing", modules, (section, slug, raw) => {
    const { meta, m } = base(section, slug, raw);
    const r = reader(section, slug, m);
    const published = r.str("published");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(published)) {
      fail(section, slug, "`published` must be an ISO date, e.g. 2026-07-27");
    }
    return {
      ...meta,
      dek: r.str("dek"),
      published,
      readingMinutes: r.num("readingMinutes"),
    };
  });
}

/** Entries that appear on indexes, the sitemap, and llms.txt: `live` only. */
export function published<M>(entries: Entry<M>[]): Entry<M>[] {
  return entries.filter(
    (e) => (e as unknown as BaseMeta).visibility === "live",
  );
}

/**
 * Entries that get a page built at their URL: `live` and `hidden`.
 * `hidden` pages exist for anyone holding the link but are unlisted and
 * carry `noindex` — the difference between removed and retired.
 */
export function routable<M>(entries: Entry<M>[]): Entry<M>[] {
  return entries.filter(
    (e) => (e as unknown as BaseMeta).visibility !== "draft",
  );
}

export function findEntry<M>(
  entries: Entry<M>[],
  slug: string,
): Entry<M> | undefined {
  return entries.find((e) => (e as unknown as BaseMeta).slug === slug);
}
