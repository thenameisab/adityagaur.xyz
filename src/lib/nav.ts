export type NavItem = { href: string; label: string };

// Five nav items for the whole site (BUILD-BRIEF §5.1). The wordmark is the
// home link, so `/` is not repeated here.
export const navItems: NavItem[] = [
  { href: "/work/", label: "Work" },
  { href: "/writing/", label: "Writing" },
  { href: "/wiki/", label: "Wiki" },
  { href: "/about/", label: "About" },
];

/**
 * `trailingSlash: true` is on, but `usePathname()` is not guaranteed to include
 * it and hrefs are authored with it. Normalise both ends before comparing, and
 * treat `/` as an exact match only so it doesn't light up on every page.
 */
export function isActivePath(pathname: string, href: string): boolean {
  const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  const a = norm(pathname);
  const b = norm(href);
  if (b === "/") return a === "/";
  return a === b || a.startsWith(b);
}
