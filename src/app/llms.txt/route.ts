import { SITE_URL, person, routes } from "@/lib/site";
import { wikiCategories, entriesByCategory } from "@/lib/wiki";

// Renders to a static /llms.txt at build (GET route handler + output: 'export').
// The emerging convention AI answer-engines check for a plain-text site summary.
export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${person.name}`,
    "",
    `> ${person.summary}`,
    "",
    `${person.jobTitle} at ${person.worksFor}, based in ${person.location}. ` +
      `Also known as ${person.alternateNames.join(", ")}.`,
    "",
    "## Pages",
    ...routes.map((r) => `- [${r.title}](${SITE_URL}${r.path}): ${r.blurb}`),
    "",
    ...wikiCategories.flatMap((cat) => [
      `## Wiki — ${cat.label}`,
      ...entriesByCategory(cat.id).map(
        (e) => `- [${e.title}](${SITE_URL}/wiki/${e.slug}/): ${e.summary}`
      ),
      "",
    ]),
    "## Elsewhere",
    ...person.sameAs.map((url) => `- ${url}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
