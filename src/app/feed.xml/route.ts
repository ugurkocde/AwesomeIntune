import { getAllTools } from "~/lib/tools.server";
import { getToolSlug } from "~/lib/tools";
import { SITE_CONFIG } from "~/lib/constants";

export const dynamic = "force-static";
export const revalidate = 3600;

const MAX_ITEMS = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const tools = [...getAllTools()]
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, MAX_ITEMS);

  const items = tools
    .map((tool) => {
      const url = `${SITE_CONFIG.url}/tools/${getToolSlug(tool)}`;
      const published = new Date(`${tool.dateAdded}T00:00:00Z`).toUTCString();
      return [
        "    <item>",
        `      <title>${escapeXml(tool.name)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${published}</pubDate>`,
        `      <description>${escapeXml(tool.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)} - New tools</title>
    <link>${escapeXml(SITE_CONFIG.url)}</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
