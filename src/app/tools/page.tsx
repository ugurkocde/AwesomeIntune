import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllTools } from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";
import {
  generateCollectionStructuredData,
  generateBreadcrumbStructuredData,
  generateItemListStructuredData,
} from "~/lib/structured-data";
import { BrowseToolsSection } from "~/components/tools/BrowseToolsSection";

export const metadata: Metadata = {
  title: `Browse All Intune Tools | ${SITE_CONFIG.name}`,
  description:
    "Explore our complete collection of 50+ Microsoft Intune tools, PowerShell scripts, and automation resources. Filter by category, type, and more.",
  openGraph: {
    title: `Browse All Intune Tools | ${SITE_CONFIG.name}`,
    description:
      "Explore our complete collection of 50+ Microsoft Intune tools, PowerShell scripts, and automation resources.",
    type: "website",
    url: `${SITE_CONFIG.url}/tools`,
    images: [
      {
        url: "/api/og?title=Browse%20All%20Tools",
        width: 1200,
        height: 630,
        alt: "Browse All Intune Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Browse All Intune Tools | ${SITE_CONFIG.name}`,
    description:
      "Explore our complete collection of 50+ Microsoft Intune tools, PowerShell scripts, and automation resources.",
    images: ["/api/og?title=Browse%20All%20Tools"],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools`,
  },
};

export default function BrowseToolsPage() {
  const tools = getAllTools();

  // Structured data for SEO
  const collectionSchema = generateCollectionStructuredData(
    "All Intune Tools",
    "Complete collection of community-built Microsoft Intune tools, scripts, and resources",
    `${SITE_CONFIG.url}/tools`,
    tools.length
  );

  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "All Tools", url: `${SITE_CONFIG.url}/tools` },
  ]);

  const itemListSchema = generateItemListStructuredData(tools);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Main Content */}
      <main className="relative min-h-screen overflow-hidden pt-16 md:pt-20">
        {/* Atmospheric Background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 50% -30%, rgba(0, 212, 255, 0.08), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 100% 50%, rgba(0, 212, 255, 0.04), transparent 50%)",
          }}
        />

        {/* Content */}
        <div className="relative">
          <Suspense fallback={<BrowsePageSkeleton />}>
            <BrowseToolsSection tools={tools} />
          </Suspense>
        </div>
      </main>
    </>
  );
}

function BrowsePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div
          className="h-4 w-32 rounded"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        />
        <div
          className="mt-6 h-10 w-64 rounded"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
        />
        <div
          className="mt-3 h-5 w-48 rounded"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        />
      </div>

      {/* Grid Skeleton */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-[300px] animate-pulse rounded-2xl"
            style={{
              background: "rgba(17, 25, 34, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
