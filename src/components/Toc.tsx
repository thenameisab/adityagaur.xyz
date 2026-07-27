"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TocSection } from "@/lib/toc";
import styles from "./Toc.module.css";

/**
 * The table of contents for a long-form entry.
 *
 * Sticky rail in the left margin at 80em and up; a disclosure above the article
 * below that. One component, because the content and the behaviour are identical
 * and only the presentation differs.
 *
 * Which section is current is the last heading to have passed under the header,
 * computed against cached offsets so scrolling never reads layout. The current
 * section's sub-headings open on their own; a reader who opens or closes one takes
 * over that section until they change it back.
 */

type Props = {
  sections: TocSection[];
  /** Accessible name. "On this page" for work, same for writing. */
  label?: string;
};

export default function Toc({ sections, label = "On this page" }: Props) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [openDisclosure, setOpenDisclosure] = useState(false);
  /** Sections the reader has explicitly opened or closed, overriding the default. */
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLElement>(null);

  const allIds = useMemo(
    () => sections.flatMap((s) => [s.id, ...s.children.map((c) => c.id)]),
    [sections],
  );

  /** Which top-level section contains the current heading. */
  const currentSectionId = useMemo(() => {
    if (!currentId) return null;
    const owning = sections.find(
      (s) => s.id === currentId || s.children.some((c) => c.id === currentId),
    );
    return owning?.id ?? null;
  }, [currentId, sections]);

  useEffect(() => {
    const headings = allIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    /**
     * The current heading is the last one to have passed under the header.
     *
     * Offsets are measured once and cached, so scrolling compares numbers instead
     * of reading layout: on a 36,000px essay with 43 headings, measuring every
     * heading on every frame is exactly the kind of thrash that makes a rail feel
     * cheap. A ResizeObserver re-measures when the document reflows — late fonts,
     * an artifact expanding, a viewport change.
     */
    let offsets: { id: string; top: number }[] = [];
    const measure = () => {
      offsets = headings.map((h) => ({
        id: h.id,
        top: h.getBoundingClientRect().top + window.scrollY,
      }));
    };

    const THRESHOLD = 96; // just below the sticky header
    const pick = () => {
      const y = window.scrollY + THRESHOLD;
      let active = offsets[0]?.id ?? null;
      for (const o of offsets) {
        if (o.top > y) break;
        active = o.id;
      }
      setCurrentId(active);
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        pick();
      });
    };

    measure();
    pick();

    const article = headings[0].closest("article") ?? document.body;
    const resize = new ResizeObserver(() => {
      measure();
      pick();
    });
    resize.observe(article);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", pick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", pick);
    };
  }, [allIds]);

  /** Keep the current entry scrolled into view within the rail itself. */
  useEffect(() => {
    if (!currentId || !rootRef.current) return;
    const rail = rootRef.current;
    if (rail.scrollHeight <= rail.clientHeight) return;
    const link = rail.querySelector<HTMLElement>(`[data-id="${currentId}"]`);
    if (!link) return;
    const top = link.offsetTop - rail.offsetTop;
    if (top < rail.scrollTop || top > rail.scrollTop + rail.clientHeight - 48) {
      rail.scrollTo({
        top: Math.max(0, top - rail.clientHeight / 2),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  }, [currentId]);

  const isOpen = (section: TocSection) =>
    manual[section.id] ?? section.id === currentSectionId;

  return (
    <nav className={styles.root} aria-label={label} ref={rootRef}>
      <button
        type="button"
        className={`${styles.head} type-eyebrow-3`}
        aria-expanded={openDisclosure}
        onClick={() => setOpenDisclosure((v) => !v)}
      >
        <span className={styles.chevron} aria-hidden="true" />
        <span>Contents</span>
        <span className={`${styles.count} type-body-4`}>{sections.length}</span>
      </button>

      <div className={styles.rootCollapse} data-open={openDisclosure}>
        <div className={styles.collapseInner}>
          <ol className={styles.list}>
            {sections.map((section) => {
              const open = isOpen(section);
              const within =
                currentSectionId === section.id && currentId !== section.id;
              return (
                <li key={section.id} className={styles.section}>
                  <div className={styles.row}>
                    <a
                      className={`${styles.link} type-body-4`}
                      href={`#${section.id}`}
                      data-id={section.id}
                      data-current={currentId === section.id}
                      data-within={within}
                      onClick={() => setOpenDisclosure(false)}
                    >
                      {section.title}
                    </a>
                    {section.children.length > 0 ? (
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={open}
                        aria-label={`${open ? "Hide" : "Show"} sub-headings of ${section.title}`}
                        onClick={() =>
                          setManual((m) => ({ ...m, [section.id]: !open }))
                        }
                      >
                        <span className={styles.toggleMark} aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  {section.children.length > 0 ? (
                    <div className={styles.collapse} data-open={open}>
                      <div className={styles.collapseInner}>
                        <ol className={styles.children}>
                          {section.children.map((child) => (
                            <li key={child.id} className={styles.child}>
                              <a
                                className={`${styles.childLink} type-body-4`}
                                href={`#${child.id}`}
                                data-id={child.id}
                                data-current={currentId === child.id}
                                tabIndex={open ? 0 : -1}
                                onClick={() => setOpenDisclosure(false)}
                              >
                                {child.title}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}
