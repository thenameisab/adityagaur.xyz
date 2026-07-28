import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

/**
 * The Company Brain landscape moved from Work to Writing: it is market research
 * written up as a piece, not a project case study.
 *
 * A static segment beside `work/[slug]` rather than an entry in the dynamic route,
 * which is what lets it exist at all — the dynamic route sets
 * `dynamicParams = false` and generates its params from the Work registry, and
 * company-brain is no longer in it.
 */
export const metadata = redirectMetadata(
  "/writing/company-brain/",
  "The Company Brain landscape — moved",
);

export default function Page() {
  return (
    <RedirectStub
      to="/writing/company-brain/"
      label="The Company Brain landscape, under Writing"
    />
  );
}
