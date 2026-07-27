"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";
import { isActivePath, navItems } from "@/lib/nav";
import styles from "./Header.module.css";

/**
 * The header's only client component. It owns two things that genuinely need
 * the client: active-route detection and the mobile menu's open state, focus
 * trap, and Esc handling.
 *
 * Everything else about the header — including the entire scroll behaviour — is
 * CSS. There is no scroll listener here.
 */
export default function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change. Adjusted during render rather than in an effect —
  // an effect would paint the open panel once on the new route first.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Move focus into the panel so the first Tab lands somewhere sensible.
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    // Prevent the page scrolling behind the full-screen panel.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  const links = navItems.map((item) => {
    const active = isActivePath(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.link} type-ui-2`}
        aria-current={active ? "page" : undefined}
        data-active={active || undefined}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <>
      {/* Desktop. Hidden below the nav breakpoint by CSS, not by JS, so it is
          present in the static HTML for crawlers. */}
      <nav className={styles.desktopNav} aria-label="Primary">
        <ul className={`${styles.menu} cluster`}>
          {navItems.map((item, i) => (
            <li key={item.href}>{links[i]}</li>
          ))}
        </ul>
      </nav>

      <button
        ref={triggerRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? "x" : "menu"} />
      </button>

      <div
        id={panelId}
        ref={panelRef}
        className={styles.panel}
        data-open={open || undefined}
        hidden={!open}
      >
        <nav aria-label="Primary, mobile">
          <ul className={`${styles.panelMenu} stack stack--s`}>
            {navItems.map((item, i) => (
              <li key={item.href}>{links[i]}</li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
