import { logoSrc, resolveBrand } from "@/lib/brands";
import styles from "./Brand.module.css";

type MarkProps = {
  /** Any spelling the registry knows. Unknown names fail the build. */
  name: string;
  /**
   * CSS size of the mark in px. Omit for inline prose, where the mark scales
   * with the surrounding type instead.
   */
  size?: number;
  /**
   * Set when the product's name is *not* rendered next to the mark, so the logo
   * has to carry the identification on its own.
   */
  standalone?: boolean;
  className?: string;
};

/**
 * A product's logo, alone.
 *
 * Renders nothing at all for a registry entry with no domain — a caller can put
 * a `<BrandMark>` beside every name in a list without first checking which ones
 * have logos, and the ones that don't simply have no mark.
 *
 * The mark sits on a cream tile it fills edge to edge. That is the one decision
 * here worth explaining: logo.dev returns whatever the brand publishes, so about
 * a third of these are dark marks on transparent backgrounds — Notion's black
 * cube, GitHub's black octocat — which vanish on this site's near-black ground.
 * A tile makes every logo legible in all three themes from a single request,
 * with no JavaScript and no second image to swap in, and reads as an app icon
 * rather than as a patch.
 */
export function BrandMark({ name, size, standalone, className }: MarkProps) {
  const brand = resolveBrand(name, "BrandMark");
  if (!brand.domain) return null;

  // Ask for 2× the CSS size; `retina=true` is what makes logo.dev serve the
  // denser asset rather than upscaling.
  const px = size ?? 18;

  return (
    <span
      className={[styles.tile, className].filter(Boolean).join(" ")}
      style={size ? { "--brand-size": `${size}px` } as React.CSSProperties : undefined}
      aria-hidden={standalone ? undefined : true}
    >
      {/* eslint-disable-next-line @next/next/no-img-element --
          `next/image` has nothing to add here. This is a static export with
          `images.unoptimized`, so the component emits a plain `<img>` anyway,
          and next.config.ts already states the policy: remote images are served
          as-is. Going through it would only buy a `remotePatterns` entry and a
          wrapper. Width, height, and lazy loading are set below, which is what
          the rule is actually protecting against. */}
      <img
        className={styles.img}
        src={logoSrc(brand.domain, px * 2)}
        alt={standalone ? `${brand.name} logo` : ""}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

type Props = {
  name: string;
  /** Display text, when it should differ from the registry's canonical name. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * A product's logo and its name, as one unit.
 *
 * The inline form for prose: `<Brand name="Glean" />` in an MDX paragraph. The
 * mark is sized in em so it tracks the type it sits in.
 *
 * The name still renders as ordinary text, which is the point for a static site
 * that AI crawlers read: the logo is decoration on top of a fact that is already
 * in the HTML, so nothing is lost when images don't load.
 *
 * The name gets its own span so the mark can be pinned to it without freezing the
 * name's own wrapping — see Brand.module.css.
 */
export default function Brand({ name, children, className }: Props) {
  const brand = resolveBrand(name, "Brand");
  return (
    <span className={[styles.root, className].filter(Boolean).join(" ")}>
      <BrandMark name={name} />
      <span className={styles.name}>{children ?? brand.name}</span>
    </span>
  );
}
