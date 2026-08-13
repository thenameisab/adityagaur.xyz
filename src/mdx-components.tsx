import type { MDXComponents } from "mdx/types";
import Brand from "@/components/Brand";
import Arch from "@/components/artifacts/Arch";
import Figure from "@/components/artifacts/Figure";
import Fingerprint from "@/components/artifacts/Fingerprint";
import InkCredit from "@/components/artifacts/InkCredit";
import { Clip, Pair, Shot } from "@/components/artifacts/Media";
import Note from "@/components/artifacts/Note";
import Plate from "@/components/artifacts/Plate";
import Stat from "@/components/artifacts/Stat";
import Status from "@/components/artifacts/Status";
import Stepper from "@/components/artifacts/Stepper";
import Switcher from "@/components/artifacts/Switcher";

/**
 * Global MDX scope.
 *
 * Element mappings are deliberately absent: the route wraps `<Content />` in
 * `.prose`, and globals.css §10 already styles h2/h3/p/ul/ol/blockquote/code/pre
 * inside it. Restating those here would be a second source of truth for prose.
 *
 * What lives here is the shared artifact vocabulary — the primitives every page
 * may use without importing. Page-specific artifacts are imported inside their
 * own MDX file, so they only ship on the page that uses them.
 */
const components: MDXComponents = {
  /** System diagrams, drawn as inline SVG on the site's tokens. */
  Arch,
  Brand,
  /** Raster media — screenshots, creatives, video. Global since the work pages
      started carrying real product captures rather than only drawn artifacts;
      it began life as one page's local artifact. */
  Clip,
  /** @deprecated Superseded by `Plate`. Still here so unconverted pages keep
      rendering; goes away once the last page takes its drums. */
  Figure,
  Fingerprint,
  InkCredit,
  Note,
  Pair,
  Plate,
  Shot,
  Stat,
  Status,
  Stepper,
  Switcher,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
