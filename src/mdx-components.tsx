import type { MDXComponents } from "mdx/types";
import Figure from "@/components/artifacts/Figure";
import Note from "@/components/artifacts/Note";
import Stat from "@/components/artifacts/Stat";
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
  Figure,
  Note,
  Stat,
  Stepper,
  Switcher,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
