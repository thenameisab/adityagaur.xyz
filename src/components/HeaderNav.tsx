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

    /**
     * Locking the page behind the full-screen panel.
     *
     * `overflow: hidden` on the body is not a scroll lock on iOS. The document
     * keeps its scroll offset, and a `position: fixed` panel is then laid out
     * against the layout viewport rather than against what the reader can
     * actually see. Opened halfway down an article on iPhone, the panel landed
     * roughly 100px too low and took the sticky header — and therefore the close
     * button — off the top of the screen, which left no obvious way out of the
     * menu. At scroll 0 it looked perfect, which is why it survives a desktop
     * check.
     *
     * Pinning the body at a negative offset equal to the current scroll is the
     * fix that holds: the document genuinely stops scrolling, and the two
     * viewports agree again, so the panel lands under the header where it
     * belongs. The offset has to be restored on close, since the body no longer
     * remembers it.
     */
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      inlineSize: body.style.inlineSize,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    // A fixed body would otherwise shrink to fit its contents.
    body.style.inlineSize = "100%";
    body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.inlineSize = prev.inlineSize;
      body.style.overflow = prev.overflow;

      // `html` sets `scroll-behavior: smooth`, which would turn restoring the
      // offset into a visible glide back down the page. Put it back instantly.
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevBehavior;
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
