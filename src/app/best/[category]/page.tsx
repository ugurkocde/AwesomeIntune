import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllTools, getAllCategories } from "~/lib/tools.server";
import { CATEGORY_CONFIG, TYPE_CONFIG, SITE_CONFIG } from "~/lib/constants";
import type { ToolCategory } from "~/types/tool";

// Map URL slugs to category keys
const CATEGORY_SLUG_MAP: Record<string, ToolCategory> = {
  "reporting-tools": "reporting",
  "automation-tools": "automation",
  "packaging-tools": "packaging",
  "troubleshooting-tools": "troubleshooting",
  "security-tools": "security",
  "configuration-tools": "configuration",
  "monitoring-tools": "monitoring",
  "migration-tools": "migration",
  "powershell-scripts": "automation", // Maps to automation as most PS scripts are there
  "powershell-modules": "automation",
};

// Reverse map for generating slugs
const CATEGORY_TO_SLUG: Record<ToolCategory, string> = {
  reporting: "reporting-tools",
  automation: "automation-tools",
  packaging: "packaging-tools",
  troubleshooting: "troubleshooting-tools",
  security: "security-tools",
  configuration: "configuration-tools",
  monitoring: "monitoring-tools",
  migration: "migration-tools",
  other: "other-tools",
};

interface BestCategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  const slugs = categories.map((cat) => ({
    category: CATEGORY_TO_SLUG[cat as ToolCategory] ?? `${cat}-tools`,
  }));
  // Add PowerShell-specific pages
  slugs.push({ category: "powershell-scripts" });
  slugs.push({ category: "powershell-modules" });
  return slugs;
}

export async function generateMetadata({ params }: BestCategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const categoryKey = CATEGORY_SLUG_MAP[slug];

  if (!categoryKey && !slug.endsWith("-tools")) {
    return { title: "Not Found" };
  }

  const displayName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const tools = getAllTools();
  const categoryLabel = categoryKey
    ? CATEGORY_CONFIG[categoryKey]?.label ?? categoryKey
    : displayName.replace(" Tools", "");

  const filteredCount = categoryKey
    ? tools.filter((t) => t.category === categoryKey).length
    : tools.length;

  return {
    title: `Best ${categoryLabel} Tools for Microsoft Intune (${new Date().getFullYear()}) | ${filteredCount}+ Free Tools`,
    description: `Discover the best ${categoryLabel.toLowerCase()} tools for Microsoft Intune. Ranked by GitHub stars and community adoption. All ${filteredCount}+ tools are free and open-source.`,
    keywords: [
      `best Intune ${categoryLabel.toLowerCase()} tools`,
      `top Intune ${categoryLabel.toLowerCase()}`,
      `free Intune ${categoryLabel.toLowerCase()} tools`,
      `Microsoft Intune ${categoryLabel.toLowerCase()}`,
      `Intune ${categoryLabel.toLowerCase()} ${new Date().getFullYear()}`,
    ],
    alternates: {
      canonical: `${SITE_CONFIG.url}/best/${slug}`,
    },
    openGraph: {
      title: `Best ${categoryLabel} Tools for Microsoft Intune`,
      description: `Top-rated ${categoryLabel.toLowerCase()} tools for Microsoft Intune, ranked by community adoption.`,
      url: `${SITE_CONFIG.url}/best/${slug}`,
    },
  };
}

export default async function BestCategoryPage({ params }: BestCategoryPageProps) {
  const { category: slug } = await params;
  const categoryKey = CATEGORY_SLUG_MAP[slug];

  // Check for PowerShell-specific pages
  const isPowerShellScripts = slug === "powershell-scripts";
  const isPowerShellModules = slug === "powershell-modules";

  if (!categoryKey && !isPowerShellScripts && !isPowerShellModules) {
    notFound();
  }

  const allTools = getAllTools();

  // Filter tools based on the page type
  let tools;
  let pageTitle;
  let pageDescription;

  if (isPowerShellScripts) {
    tools = allTools.filter((t) => t.type === "powershell-script");
    pageTitle = "Best PowerShell Scripts for Microsoft Intune";
    pageDescription =
      "Discover the most popular PowerShell scripts for Microsoft Intune management. These scripts help automate device configuration, compliance reporting, and endpoint management tasks.";
  } else if (isPowerShellModules) {
    tools = allTools.filter((t) => t.type === "powershell-module");
    pageTitle = "Best PowerShell Modules for Microsoft Intune";
    pageDescription =
      "Explore the top PowerShell modules for Microsoft Intune. These modules provide reusable cmdlets for device management, Graph API integration, and automation workflows.";
  } else if (categoryKey) {
    tools = allTools.filter((t) => t.category === categoryKey);
    const categoryLabel = CATEGORY_CONFIG[categoryKey]?.label ?? categoryKey;
    pageTitle = `Best ${categoryLabel} Tools for Microsoft Intune`;
    pageDescription = getCategoryDescription(categoryKey);
  } else {
    notFound();
  }

  // Sort by GitHub stars
  const rankedTools = [...tools].sort(
    (a, b) => (b.repoStats?.stars ?? 0) - (a.repoStats?.stars ?? 0)
  );

  const categoryConfig = categoryKey ? CATEGORY_CONFIG[categoryKey] : null;
  const accentColor = categoryConfig?.color ?? "#00d4ff";

  // Generate FAQ structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the best ${categoryConfig?.label?.toLowerCase() ?? "Intune"} tools?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The top ${categoryConfig?.label?.toLowerCase() ?? "Intune"} tools ranked by GitHub stars are: ${rankedTools
            .slice(0, 5)
            .map((t) => t.name)
            .join(", ")}. All tools are free and open-source.`,
        },
      },
      {
        "@type": "Question",
        name: `How many ${categoryConfig?.label?.toLowerCase() ?? "Intune"} tools are available?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Awesome Intune lists ${tools.length} free ${categoryConfig?.label?.toLowerCase() ?? ""} tools for Microsoft Intune. Browse the full collection at awesomeintune.com.`,
        },
      },
      {
        "@type": "Question",
        name: "Are these Intune tools free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all tools listed on Awesome Intune are completely free to use. Most are open-source and available on GitHub.",
        },
      },
    ],
  };

  // ItemList schema for better search appearance
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    description: pageDescription,
    numberOfItems: rankedTools.length,
    itemListElement: rankedTools.slice(0, 10).map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description,
        url: `${SITE_CONFIG.url}/tools/${tool.id}`,
        applicationCategory: categoryConfig?.label ?? "Utility",
        ...(tool.repoStats?.stars && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Math.min(5, 4 + (tool.repoStats.stars / 1000)),
            ratingCount: tool.repoStats.stars,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <main className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${accentColor}15, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 sm:pb-32 sm:pt-28">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
              <li>
                <Link href="/" className="hover:text-[var(--text-secondary)]">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/tools" className="hover:text-[var(--text-secondary)]">
                  Tools
                </Link>
              </li>
              <li>/</li>
              <li style={{ color: "var(--text-primary)" }}>Best {categoryConfig?.label ?? "Tools"}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: `${accentColor}15`,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {new Date().getFullYear()} Rankings
            </div>
            <h1
              className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              {pageTitle}
            </h1>
            <p
              className="mt-4 max-w-3xl text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {pageDescription}
            </p>
            <div
              className="mt-4 text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              Ranked by GitHub stars. {rankedTools.length} tools available.
            </div>
          </header>

          {/* Ranking Criteria */}
          <div
            className="mb-10 rounded-xl p-4"
            style={{
              background: "rgba(17, 25, 34, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
                className="mt-0.5 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  How are tools ranked?
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Tools are ranked by GitHub stars, which reflects community adoption and trust.
                  All tools are manually reviewed and security-scanned before being listed.
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Tools List */}
          <div className="space-y-4">
            {rankedTools.map((tool, index) => {
              const typeConfig = TYPE_CONFIG[tool.type];
              const stars = tool.repoStats?.stars ?? 0;

              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group block rounded-2xl transition-all hover:scale-[1.01]"
                  style={{
                    background: "rgba(17, 25, 34, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div className="flex items-start gap-4 p-5 sm:items-center sm:gap-6 sm:p-6">
                    {/* Rank */}
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold sm:h-12 sm:w-12"
                      style={{
                        background:
                          index < 3
                            ? `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`
                            : "rgba(255, 255, 255, 0.03)",
                        color: index < 3 ? accentColor : "var(--text-tertiary)",
                        border: index < 3 ? `1px solid ${accentColor}30` : "none",
                      }}
                    >
                      #{index + 1}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className="font-display text-lg font-bold transition-colors group-hover:text-[var(--accent-primary)] sm:text-xl"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {tool.name}
                        </h2>
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: `${typeConfig.color}15`,
                            color: typeConfig.color,
                          }}
                        >
                          {typeConfig.label}
                        </span>
                      </div>
                      <p
                        className="mt-1 line-clamp-2 text-sm sm:line-clamp-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {tool.description}
                      </p>
                    </div>

                    {/* Stars */}
                    {stars > 0 && (
                      <div
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
                        style={{
                          background: "#f59e0b15",
                          color: "#f59e0b",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {stars.toLocaleString()}
                      </div>
                    )}

                    {/* Arrow */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="hidden flex-shrink-0 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--accent-primary)] sm:block"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Browse All CTA */}
          {categoryKey && (
            <div className="mt-12 text-center">
              <Link
                href={`/tools/category/${categoryKey}`}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: `${accentColor}15`,
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                Browse All {categoryConfig?.label} Tools
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function getCategoryDescription(category: ToolCategory): string {
  const descriptions: Record<ToolCategory, string> = {
    reporting:
      "Explore the top reporting tools for Microsoft Intune. Generate detailed reports on device compliance, application deployment, configuration profiles, and endpoint health. These tools provide insights beyond the built-in Intune reports.",
    automation:
      "Discover the best automation tools for Microsoft Intune. Automate backup/restore operations, policy deployment, application management, and scheduled tasks using PowerShell and Microsoft Graph API.",
    packaging:
      "Find the best application packaging tools for Microsoft Intune. Create Win32 apps, convert MSIX packages, generate intunewin files, and streamline your app deployment workflow.",
    troubleshooting:
      "Access top-rated troubleshooting tools for Microsoft Intune. Diagnose enrollment issues, analyze Intune Management Extension logs, troubleshoot Autopilot deployments, and debug device-side problems.",
    security:
      "Explore the best security tools for Microsoft Intune. Implement security baselines, validate Defender configurations, audit compliance policies, and strengthen your endpoint security posture.",
    configuration:
      "Discover top configuration tools for Microsoft Intune. Manage device configuration profiles, settings catalogs, ADMX templates, and administrative settings with ease.",
    monitoring:
      "Find the best monitoring tools for Microsoft Intune. Track device health, sync status, policy application, and gain real-time visibility into your managed device fleet.",
    migration:
      "Explore top migration tools for Microsoft Intune. Move from other MDM solutions, transfer configurations between tenants, and manage device transitions smoothly.",
    other:
      "Discover additional tools for Microsoft Intune that enhance your endpoint management experience with unique utilities and specialized functionality.",
  };
  return descriptions[category];
}
