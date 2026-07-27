"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import styles from "./CopyEmail.module.css";

/**
 * Copy-to-clipboard with a transient confirmation announced politely. The
 * address is also a plain mailto: link alongside this, so the button is an
 * addition to a working affordance rather than the only way to get the address.
 */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, or permission denied). The mailto:
      // link next to this still works, so fail silently rather than alerting.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`${styles.root} type-ui-2`}
        aria-label={`Copy email address ${email}`}
      >
        <Icon name={copied ? "check" : "copy"} size="sm" />
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <span role="status" aria-live="polite" className={styles.srOnly}>
        {copied ? `${email} copied to clipboard` : ""}
      </span>
    </>
  );
}
