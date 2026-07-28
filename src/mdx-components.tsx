import type { MDXComponents } from "mdx/types";
import Brand from "@/components/Brand";
import Figure from "@/components/artifacts/Figure";
import Fingerprint from "@/components/artifacts/Fingerprint";
import InkCredit from "@/components/artifacts/InkCredit";
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
  Brand,
  /** @deprecated Superseded by `Plate`. Still here so unconverted pages keep
      rendering; goes away once the last page takes its drums. */
  Figure,
  Fingerprint,
  InkCredit,
  Note,
  Plate,
  Stat,
  Status,
  Stepper,
  Switcher,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
