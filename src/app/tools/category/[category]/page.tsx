import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ToolCategory } from "~/types/tool";
import { getToolsByCategory, getAllCategories } from "~/lib/tools.server";
import { CATEGORY_CONFIG, SITE_CONFIG } from "~/lib/constants";
import {
  generateCollectionStructuredData,
  generateBreadcrumbStructuredData,
  generateCategoryFAQStructuredData,
} from "~/lib/structured-data";
import { ToolCard } from "~/components/tools/ToolCard";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  reporting: "Tools for generating reports and analytics from your Intune environment",
  automation: "Automate repetitive tasks and streamline your Intune workflows",
  packaging: "Create, manage, and deploy application packages for Intune",
  troubleshooting: "Diagnose and resolve issues in your Intune deployments",
  security: "Enhance security monitoring and compliance in your environment",
  configuration: "Configure and manage device settings and policies",
  monitoring: "Monitor device health, compliance, and performance",
  migration: "Tools to help migrate to or between Intune environments",
  other: "Additional tools that enhance your Intune experience",
};

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryConfig = CATEGORY_CONFIG[category as ToolCategory];

  if (!categoryConfig) {
    return {
      title: "Category Not Found",
    };
  }

  const description = CATEGORY_DESCRIPTIONS[category as ToolCategory] ??
    `Browse ${categoryConfig.label} tools for Microsoft Intune`;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(`${categoryConfig.label} Tools`)}&category=${encodeURIComponent(category)}`;

  return {
    title: `${categoryConfig.label} Tools - ${SITE_CONFIG.name}`,
    description,
    openGraph: {
      title: `${categoryConfig.label} Tools - ${SITE_CONFIG.name}`,
      description,
      type: "website",
      url: `${SITE_CONFIG.url}/tools/category/${category}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${categoryConfig.label} Tools for Microsoft Intune`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryConfig.label} Tools - ${SITE_CONFIG.name}`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryConfig = CATEGORY_CONFIG[category as ToolCategory];

  if (!categoryConfig) {
    notFound();
  }

  const tools = getToolsByCategory(category);

  if (tools.length === 0) {
    notFound();
  }

  const description = CATEGORY_DESCRIPTIONS[category as ToolCategory] ??
    `Browse ${categoryConfig.label} tools for Microsoft Intune`;

  const structuredData = generateCollectionStructuredData(
    `${categoryConfig.label} Tools`,
    description,
    `${SITE_CONFIG.url}/tools/category/${category}`,
    tools.length
  );

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: SITE_CONFIG.url },
    {
      name: categoryConfig.label,
      url: `${SITE_CONFIG.url}/tools/category/${category}`,
    },
  ]);

  const faqData = generateCategoryFAQStructuredData(category as ToolCategory);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />

      <main className="relative min-h-screen overflow-hidden">
        {/* Atmospheric Background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 100% 60% at 50% -30%, ${categoryConfig.color}12, transparent 60%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 50% 50% at 100% 50%, ${categoryConfig.color}06, transparent 50%)`,
          }}
        />

        {/* Content Container */}
        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-20">
          {/* Back Navigation */}
          <Link
            href="/"
            className="group mb-12 inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
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

          {/* Category Hero */}
          <header className="mb-16">
            {/* Category Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: `${categoryConfig.color}15`,
                color: categoryConfig.color,
                border: `1px solid ${categoryConfig.color}30`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Category
            </div>

            {/* Category Name */}
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span style={{ color: "var(--text-primary)" }}>
                {categoryConfig.label}
              </span>
              <span
                className="ml-4 inline-block"
                style={{ color: categoryConfig.color }}
              >
                Tools
              </span>
            </h1>

            {/* Description */}
            <p
              className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {description}
            </p>

            {/* Tool Count */}
            <div
              className="mt-8 inline-flex items-center gap-3 rounded-xl px-5 py-3"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: `${categoryConfig.color}20`,
                  color: categoryConfig.color,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tools.length}
                </span>
                <span
                  className="ml-2 text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {tools.length === 1 ? "tool" : "tools"} available
                </span>
              </div>
            </div>
          </header>

          {/* Divider */}
          <div
            className="mb-12 h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${categoryConfig.color}40, transparent)`,
            }}
          />

          {/* Tools Grid */}
          <section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
