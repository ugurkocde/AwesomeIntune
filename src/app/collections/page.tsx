import type { Metadata } from "next";
import Link from "next/link";
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
      {/* Atmospheric Background Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.08), transparent 70%)",
        }}
      />

      {/* Content Container */}
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 sm:pb-32 sm:pt-28">
        {/* Back Navigation */}
        <Link
          href="/#tools"
          className="group mb-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/5 sm:mb-12 sm:px-0 sm:py-0 sm:hover:bg-transparent"
          style={{
            color: "var(--text-secondary)",
            marginLeft: "-0.75rem",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="transition-colors group-hover:text-[var(--text-primary)]">
            Back to all tools
          </span>
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-4">
            <h1
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 50%, var(--text-primary) 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Collections
            </h1>
            <span
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{
                background: "rgba(0, 212, 255, 0.1)",
                color: "var(--accent-primary)",
                border: "1px solid rgba(0, 212, 255, 0.2)",
              }}
            >
              {collections.length} collections
            </span>
          </div>
          <p
            className="mt-4 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Curated collections of Microsoft Intune tools organized by use case.
            Each collection brings together the best community tools for specific
            workflows and scenarios.
          </p>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
