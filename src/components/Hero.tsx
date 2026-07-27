import styles from "./Hero.module.css";

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
 */
export default function Hero({
  eyebrow,
  headline,
  lede,
  action,
  variant = "home",
}: Props) {
  return (
    <section className={`${styles.root} ${styles[variant]}`}>
      <div className="container">
        <div className={`${styles.content} stack`}>
          {eyebrow ? (
            <p className="type-eyebrow-3 text-muted" data-reveal-load style={{ ["--i" as string]: 0 }}>
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={variant === "home" ? "type-display-1 text-primary" : "type-display-2 text-primary"}
            data-reveal-load
            style={{ ["--i" as string]: 1 }}
          >
            {headline}
          </h1>
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
