import { routePlate, type DrumsKey, type RouteDrumsKey } from "@/lib/plates";

/**
 * Wraps a route in its colour plate.
 *
 * Renders in BOTH themes and is not conditional on anything, which is the whole
 * trick. The `.drums-*` class it emits sets five custom properties that only
 * `.theme-plate` and `.theme-vibrant` read, so under the dark theme this
 * element is a plain <div> that happens to define five unused variables. Under
 * Vibrant Mode the `[data-plate]` hook brings the plate token block into scope
 * and the same markup is a printed sheet. See globals.css §3.1.
 *
 * The consequence worth stating: because nothing here depends on the active
 * theme, the plate is present and correct in the static HTML. There is no
 * client-side colour decision to make, so there is nothing to flash, and a
 * reader who has chosen Vibrant gets the right inks in the first painted frame.
 *
 * Accepts a DrumsKey as well as a RouteDrumsKey, because an entry page prints
 * in its own subject's inks rather than in a plate of its own — see
 * pairingForPage(). A null `drums` renders the children untouched, which is how
 * the FinLog entry keeps its two registers and no plate.
 */
export default function RoutePlate({
  drums,
  children,
}: {
  drums: RouteDrumsKey | DrumsKey | null;
  children: React.ReactNode;
}) {
  if (!drums) return <>{children}</>;
  return (
    <div className={routePlate(drums)} data-plate>
      {children}
    </div>
  );
}
