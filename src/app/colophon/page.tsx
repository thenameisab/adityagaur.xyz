import type { Metadata } from "next";
import RoutePlate from "@/components/RoutePlate";
import Hero from "@/components/Hero";

export const metadata: Metadata = {
  title: "Colophon",
  description: "How this site is built: typefaces, colour, stack, and hosting.",
  alternates: { canonical: "/colophon/" },
};

export default function Colophon() {
  return (
    <RoutePlate drums="yellow-purple">
      <Hero variant="page" eyebrow="Colophon" headline="How this is built" />
      <div className="container inner-section">
        <div className="prose">
          <h2>Type</h2>
          <p>
            Instrument Serif for display, Geist for everything else, Geist Mono for
            dates and code. Three families, self-hosted, loaded as variable fonts
            where the family offers one. Instrument Serif ships a single weight,
            which suits it — a display serif should never be bolded.
          </p>
          <p>
            That single weight leaves a heading one way to stress a word, since
            bolding is impossible and the accent colour is spoken for. So the face
            loads its italic too, and headings use it on{" "}
            <em>one</em> word — the word carrying the argument, not the whole line.
            Tracking relaxes under the italic run, because the roman roles are set
            tight enough that a slanted glyph would otherwise collide with the
            upright following it.
          </p>

          <h2>Colour</h2>
          <p>
            The background is a warm near-black and the text is the cream this site
            has always used. Neither is neutral. Pure black on pure white looks
            cheap by comparison, and the warm bias is most of why this reads the way
            it does.
          </p>
          <p>
            One accent — a terracotta, warm against the warm neutrals rather than a
            cool blue fighting them. It appears about three times per page: link
            underlines, the active nav marker, and focus rings. Text hierarchy comes
            from a real colour ramp, never from opacity.
          </p>
          <p>
            Themes are defined per section, not globally. The same markup renders on
            a dark ground or a sand one with no variant classes, because every
            component reads the same semantic tokens and the theme class supplies
            the values. Every colour pair is contrast-checked at build time, per
            theme.
          </p>

          <h2>Motion</h2>
          <p>
            There is no animation library. Every reveal is a native CSS
            scroll-driven animation on <code>animation-timeline: view()</code>,
            which runs on the compositor rather than the main thread. Nothing
            bounces, scales, or overshoots. Reveals travel twelve pixels. Hover
            feedback is a hundred milliseconds; entrances are five hundred.
          </p>
          <p>
            All of it sits behind an <code>@supports</code> query and a
            reduced-motion check. With either unavailable the page renders complete
            and correct — the animation only ever removes an offset from something
            already in place.
          </p>

          <h2>Stack</h2>
          <p>
            Next.js, statically exported. Every route is real HTML on disk, which
            matters because AI crawlers largely don&rsquo;t run JavaScript. Vanilla
            CSS with custom properties — no Tailwind, no CSS-in-JS. Hosted on
            Cloudflare Pages, deployed on push. No third-party scripts, no
            analytics, no cookies, so there is nothing to consent to.
          </p>
          <p>
            One exception, stated plainly: where a page names a product, its logo
            is an image served by logo.dev. That is a request to a host I
            don&rsquo;t control, so your browser tells it an IP address and a user
            agent. No script runs, nothing is stored, and every product name is
            real text underneath, so a blocked image costs the page nothing. The
            registry of which names carry a logo, and which deliberately
            don&rsquo;t, is a single file in the repo.
          </p>
          <p>
            The icons — nine of them — are a hand-maintained SVG sprite rather than
            a library. The two arrows are filled glyphs drawn to match Instrument
            Serif&rsquo;s stem weight, so they read as typography rather than as UI.
          </p>
        </div>
      </div>
    </RoutePlate>
  );
}
