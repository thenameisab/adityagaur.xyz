import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Icon from "./Icon";

/**
 * A moved page. Static export can't issue a 301, so this does the two things a
 * static host can: a meta refresh for humans, and a canonical pointing at the
 * destination so crawlers consolidate the URL. `public/_redirects` gives
 * Cloudflare Pages the real 301 — this page is the fallback for any other host.
 */
export function redirectMetadata(to: string, title: string): Metadata {
  return {
    title,
    alternates: { canonical: to },
    robots: { index: false, follow: true },
  };
}

export default function RedirectStub({ to, label }: { to: string; label: string }) {
  return (
    <div className="container container--prose inner-section stack stack--s">
      <meta httpEquiv="refresh" content={`0; url=${SITE_URL}${to}`} />
      <h1 className="type-headline-1 text-primary">This page moved</h1>
      <p className="type-body-1 text-secondary">
        It now lives at {label}. You should be sent there automatically.
      </p>
      <p>
        <Link href={to} className="type-ui-2 text-primary">
          Go to {label} <Icon name="arrow-right" size="sm" />
        </Link>
      </p>
    </div>
  );
}
