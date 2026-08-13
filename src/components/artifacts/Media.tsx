import styles from "./Media.module.css";

/**
 * Raster media — product screenshots, campaign creatives, video.
 *
 * Everything else on this site is drawn. The rule that keeps raster honest:
 * it never floats in prose. It sits inside a Plate or a Figure like every
 * other artifact, captioned, sourced, and sized at authoring time so the
 * layout never shifts while an image loads.
 *
 * Every product capture is taken from the real application running locally
 * against synthetic data, never from a production instance — see
 * `scripts/screenshots/README.md` for how the captures are produced.
 */

export function Shot({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    /* Static export with images.unoptimized: a plain img is exactly what
       ships — same reasoning Brand.tsx documents. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.shot}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Two shots side by side in one frame, stacking on narrow screens. */
export function Pair({ children }: { children: React.ReactNode }) {
  return <div className={styles.pair}>{children}</div>;
}

export function Clip({
  src,
  poster,
  width,
  height,
  label,
}: {
  src: string;
  poster: string;
  width: number;
  height: number;
  /** Accessible name for the player. */
  label: string;
}) {
  return (
    <video
      className={styles.shot}
      src={src}
      poster={poster}
      width={width}
      height={height}
      controls
      preload="metadata"
      playsInline
      aria-label={label}
    />
  );
}
