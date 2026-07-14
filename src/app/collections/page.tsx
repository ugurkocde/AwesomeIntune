import type { Metadata } from "next";
import { getAllCollections, getCollectionTools } from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";
import { generateBreadcrumbStructuredData } from "~/lib/structured-data";
import { CollectionCard } from "~/components/collections/CollectionCard";

export const metadata: Metadata = {
  title: `Collections - ${SITE_CONFIG.name}`,
  description:
    "Curated collections of Microsoft Intune tools organized by use case. Find the right tools for Autopilot, device management, and more.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/collections`,
  },
  openGraph: {
    title: `Collections - ${SITE_CONFIG.name}`,
    description:
      "Curated collections of Microsoft Intune tools organized by use case.",
    type: "website",
    url: `${SITE_CONFIG.url}/collections`,
  },
};

export default function CollectionsPage() {
  const collections = getAllCollections();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Microsoft Intune Tool Collections",
    description:
      "Curated collections of Microsoft Intune tools organized by use case.",
    numberOfItems: collections.length,
    itemListElement: collections.map((collection, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: collection.title,
      url: `${SITE_CONFIG.url}/collections/${collection.slug}`,
    })),
  };
  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Collections", url: `${SITE_CONFIG.url}/collections` },
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Content Container */}
      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-20 sm:pt-32 sm:pb-24">
        {/* Page Header */}
        <div className="mb-9">
          <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-primary)] uppercase">
            Curated toolkits
          </span>
          <h1 className="font-display mt-3 text-[44px] leading-tight font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
            Collections
          </h1>
          <p
            className="mt-3 max-w-xl text-base leading-[1.65]"
            style={{ color: "var(--text-secondary)" }}
          >
            Hand-picked sets of tools for a specific job, so you do not have to
            figure out which of the many similar tools belong together.
          </p>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => {
              const tools = getCollectionTools(collection);
              return (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  toolCount={tools.length}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p style={{ color: "var(--text-secondary)" }}>
              No collections available yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
