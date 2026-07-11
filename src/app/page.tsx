import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "~/components/Hero";
import { BrowseToolsSection } from "~/components/tools/BrowseToolsSection";
import { TrustStrip } from "~/components/TrustStrip";
import { AuthorSpotlight } from "~/components/AuthorSpotlight";
import { FAQ } from "~/components/FAQ";
import { ToolCard } from "~/components/tools/ToolCard";
import type { Tool } from "~/types/tool";
import { isVerified } from "~/lib/tools";
import {
  getAllTools,
  getAuthorsForSpotlight,
  getUniqueAuthorsCount,
} from "~/lib/tools.server";
import {
  generateItemListStructuredData,
  generateHomepageFAQStructuredData,
} from "~/lib/structured-data";
import { SITE_CONFIG } from "~/lib/constants";

export function generateMetadata(): Metadata {
  const toolCount = getAllTools().length;
  return {
    title: `${toolCount}+ Free Microsoft Intune Tools & PowerShell Scripts`,
    description: `Discover ${toolCount}+ free Microsoft Intune tools, PowerShell scripts, and automation resources. The largest community-curated directory for IT professionals - troubleshooting, reporting, packaging, and endpoint management.`,
    alternates: { canonical: SITE_CONFIG.url },
    openGraph: {
      title: `${toolCount}+ Free Microsoft Intune Tools & PowerShell Scripts`,
      description: `Discover ${toolCount}+ free Microsoft Intune tools and PowerShell scripts. The largest community-curated directory for IT professionals.`,
    },
    twitter: {
      title: `${toolCount}+ Free Microsoft Intune Tools & PowerShell Scripts`,
      description: `Discover ${toolCount}+ free Microsoft Intune tools and PowerShell scripts.`,
    },
  };
}

export default function HomePage() {
  const tools = getAllTools();
  const authors = getAuthorsForSpotlight();
  const toolCount = tools.length;
  const authorCount = getUniqueAuthorsCount(tools);
  const verifiedCount = tools.filter(isVerified).length;

  const itemListSchema = generateItemListStructuredData(tools);
  const faqSchema = generateHomepageFAQStructuredData(toolCount);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Hero toolCount={toolCount} authorCount={authorCount} />

      {/* The directory is the page. Suspense lets the URL-driven filters hydrate
          on top of a server-rendered grid of cards (crawlable, no blank shell). */}
      <section id="tools" className="scroll-mt-24">
        <Suspense fallback={<DirectoryFallback tools={tools} />}>
          <BrowseToolsSection tools={tools} />
        </Suspense>
      </section>

      <TrustStrip verifiedCount={verifiedCount} toolCount={toolCount} />
      <AuthorSpotlight authors={authors} />
      <FAQ toolCount={toolCount} />
    </>
  );
}

/**
 * Server-rendered fallback for the directory: the newest tools as real cards.
 * Guarantees tool names/links are in the initial HTML for crawlers and no-JS
 * users, and visually matches the directory's default (newest-first) first paint.
 */
function DirectoryFallback({ tools }: { tools: Tool[] }) {
  const initial = [...tools]
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, 18);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h2
        className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: "var(--text-primary)" }}
      >
        Browse {tools.length} Microsoft Intune tools
      </h2>
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
      >
        {initial.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    </div>
  );
}
