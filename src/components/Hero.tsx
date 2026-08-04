import styles from "./Hero.module.css";
import HeroFlutes from "./HeroFlutes";

type Props = {
  eyebrow?: string;
  headline: string;
  lede?: string;
  /** The one link out of the hero. No button, no image. */
  action?: React.ReactNode;
  /** `home` is the tall, bottom-aligned variant; `page` is a compact header. */
  variant?: "home" | "page";
};

/**
 * Bottom-aligned rather than centered — it reads more editorial and avoids the
 * vertical-centering wobble on short viewports.
 *
 * The entrance is load-triggered, not scroll-triggered: this is above the fold,
 * so a view() timeline would never fire.
 *
 * The home variant is the one place the site drops its restraint: it carries
 * the flute atmosphere (HeroFlutes) and its headline enters word by word
 * instead of as a block. Page heroes stay compact and quiet.
 */
export default function Hero({
  eyebrow,
  headline,
  lede,
  action,
  variant = "home",
}: Props) {
  const home = variant === "home";
  return (
    <section className={`${styles.root} ${styles[variant]}`}>
      {home ? <HeroFlutes /> : null}
      <div className="container">
        <div className={`${styles.content} stack`}>
          {eyebrow ? (
            <p className="type-eyebrow-3 text-muted" data-reveal-load style={{ ["--i" as string]: 0 }}>
              {eyebrow}
            </p>
          ) : null}
          {home ? (
            /* Word-level choreography. The h1 itself never animates (words do),
               so there is no data-reveal-load here — doubling them would stack
               two opacity ramps and the first words would flash. */
            <h1 className="type-display-1 text-primary">
              {headline.split(" ").map((word, i) => (
                <span key={i}>
                  {i > 0 ? " " : null}
                  <span className={styles.word} style={{ ["--wi" as string]: i }}>
                    {word}
                  </span>
                </span>
              ))}
            </h1>
          ) : (
            <h1 className="type-display-2 text-primary" data-reveal-load style={{ ["--i" as string]: 1 }}>
              {headline}
            </h1>
          )}
          {lede ? (
            <p
              className={`${styles.lede} type-body-1 text-secondary`}
              data-reveal-load
              style={{ ["--i" as string]: 2 }}
            >
              {lede}
            </p>
          ) : null}
          {action ? (
            <div data-reveal-load style={{ ["--i" as string]: 3 }}>
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
