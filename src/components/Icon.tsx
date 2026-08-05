import styles from "./Icon.module.css";

// The complete permitted set (BUILD-BRIEF §6.9).
export type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "x"
  | "menu"
  | "link"
  | "copy"
  | "check"
  | "mail"
  | "linkedin"
  | "twitter"
  | "moon"
  | "sun";

type Props = {
  name: IconName;
  /** Sized in em relative to the accompanying text. Never px. */
  size?: "sm" | "md";
  /** Give this only to icons that carry meaning on their own. */
  title?: string;
  className?: string;
};

export default function Icon({ name, size = "md", title, className }: Props) {
  const decorative = !title;
  return (
    <svg
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <use href={`#icon-${name}`} />
    </svg>
  );
}
