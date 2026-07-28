import type { Metadata } from "next";
import "./globals.css";
import { display, mono, sans, sansAlt } from "@/lib/fonts";
import Header from "@/components/Header";
import IconSprite from "@/components/IconSprite";
import PageFooter from "@/components/PageFooter";
import { LOGO_HOST } from "@/lib/brands";
import { SITE_URL, person } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${person.name} — ${person.tagline}`,
    template: `%s — ${person.name}`,
  },
  description: person.summary,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: `${person.name} — ${person.tagline}`,
    description: person.summary,
    url: SITE_URL,
    siteName: person.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.name} — ${person.tagline}`,
    description: person.summary,
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

// Person entity graph — helps SEO/AI engines fuse this site with the LinkedIn profile
// into one canonical entity for "Aditya Gaur" / "Aditya G" queries.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  alternateName: person.alternateNames,
  jobTitle: person.jobTitle,
  worksFor: { "@type": "Organization", name: person.worksFor },
  address: { "@type": "PostalAddress", addressLocality: person.location },
  url: SITE_URL,
  description: person.summary,
  sameAs: person.sameAs,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // sansAlt is the /styleguide/ comparison face only — remove it along with
      // the §15 Q2 decision (see src/lib/fonts.ts).
      className={`${display.variable} ${sans.variable} ${mono.variable} ${sansAlt.variable}`}
    >
      {/* Warm dark is the site default. A theme class always sets its own
          background and color, so any section can override it locally. */}
      <body className="theme-dark">
        {/* Product logos come from logo.dev as images (src/lib/brands.ts).
            Every logo on a page is one connection to one host, so paying for the
            DNS, TCP, and TLS handshake once up front is the whole cost —
            `crossOrigin` because images are fetched anonymously, and a preconnect
            with the wrong credentials mode opens a second connection instead.
            Rendered here rather than in a hand-written `<head>`: React hoists
            link tags into the head itself, and layout.md is explicit that a root
            layout shouldn't hand-roll one. */}
        <link rel="preconnect" href={LOGO_HOST} crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <IconSprite />
        <a className="skip-link type-ui-2" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <PageFooter />
      </body>
    </html>
  );
}
