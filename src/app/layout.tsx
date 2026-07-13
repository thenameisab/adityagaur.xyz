import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import CanvasMesh from "@/components/CanvasMesh";
import Navigation from "@/components/Navigation";
import { SITE_URL, person } from "@/lib/site";

// We import DM Sans for the clean body text
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

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
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <CanvasMesh />
        <Navigation />
        <div style={{ paddingTop: '100px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
