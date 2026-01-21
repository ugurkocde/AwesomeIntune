import type { Metadata } from "next";
import Link from "next/link";
import { getAllTools, getAllCategories, getUniqueAuthorsCount } from "~/lib/tools.server";
import { CATEGORY_CONFIG, TYPE_CONFIG, SITE_CONFIG } from "~/lib/constants";
import { generateStatsPageStructuredData, generateDataCatalogStructuredData } from "~/lib/structured-data";
import type { ToolCategory, ToolType } from "~/types/tool";

export const metadata: Metadata = {
  title: "Statistics & Insights | Awesome Intune Tools Directory",
  description:
    "Explore statistics and insights about the Awesome Intune directory. View tool counts by category, most popular tools by GitHub stars, license distribution, and contributor information.",
  keywords: [
    "Intune tools statistics",
    "Microsoft Intune tools count",
    "Intune PowerShell scripts",
    "endpoint management tools",
    "Intune automation statistics",
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/stats`,
  },
  openGraph: {
    title: "Statistics & Insights | Awesome Intune",
    description:
      "Explore statistics about the largest Microsoft Intune tools directory. Tool counts, categories, popularity rankings, and more.",
    url: `${SITE_CONFIG.url}/stats`,
  },
};

export default function StatsPage() {
  const tools = getAllTools();
  const categories = getAllCategories();
  const authorsCount = getUniqueAuthorsCount(tools);
  const totalStars = tools.reduce((sum, tool) => sum + (tool.repoStats?.stars ?? 0), 0);
  const totalForks = tools.reduce((sum, tool) => sum + (tool.repoStats?.forks ?? 0), 0);

  // Tools by category
  const toolsByCategory = categories
    .map((category) => ({
      category,
      label: CATEGORY_CONFIG[category as ToolCategory]?.label ?? category,
      color: CATEGORY_CONFIG[category as ToolCategory]?.color ?? "#6b7280",
      count: tools.filter((t) => t.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Tools by type
  const typeCount = tools.reduce(
    (acc, tool) => {
      acc[tool.type] = (acc[tool.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const toolsByType = Object.entries(typeCount)
    .map(([type, count]) => ({
      type,
      label: TYPE_CONFIG[type as ToolType]?.label ?? type,
      color: TYPE_CONFIG[type as ToolType]?.color ?? "#6b7280",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Top tools by GitHub stars
  const topByStars = [...tools]
    .filter((t) => t.repoStats?.stars)
    .sort((a, b) => (b.repoStats?.stars ?? 0) - (a.repoStats?.stars ?? 0))
    .slice(0, 10);

  // Newest tools
  const newestTools = [...tools]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 10);

  // License distribution
  const licenseCount = tools.reduce(
    (acc, tool) => {
      const license = tool.repoStats?.license ?? "Unknown";
      acc[license] = (acc[license] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const licenseDistribution = Object.entries(licenseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Security verified tools
  const verifiedTools = tools.filter(
    (t) => t.securityCheck && t.securityCheck.passed === t.securityCheck.total
  ).length;

  const statsData = generateStatsPageStructuredData({
    totalTools: tools.length,
    totalStars,
    totalAuthors: authorsCount,
    categories: toolsByCategory.map((c) => ({ name: c.label, count: c.count })),
  });

  const catalogData = generateDataCatalogStructuredData(tools.length, categories.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(statsData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogData) }}
      />

      <main className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.1), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-32 sm:pt-28">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1
              className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Directory Statistics
            </h1>
            <p
              className="mx-auto mt-4 max-w-2xl text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Insights and statistics about the Awesome Intune tools directory.
              Updated in real-time as new tools are added.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[
              { label: "Total Tools", value: tools.length, color: "#00d4ff" },
              { label: "GitHub Stars", value: totalStars.toLocaleString(), color: "#f59e0b" },
              { label: "Contributors", value: authorsCount, color: "#10b981" },
              { label: "Verified Tools", value: verifiedTools, color: "#8b5cf6" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(17, 25, 34, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="font-display text-3xl font-bold sm:text-4xl"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </div>
                <div
                  className="mt-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tools by Category */}
          <section className="mb-16">
            <h2
              className="mb-6 font-display text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Tools by Category
            </h2>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(17, 25, 34, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="space-y-4">
                {toolsByCategory.map((cat) => (
                  <Link
                    key={cat.category}
                    href={`/tools/category/${cat.category}`}
                    className="group flex items-center gap-4"
                  >
                    <span
                      className="w-32 text-sm font-medium transition-colors group-hover:underline sm:w-40"
                      style={{ color: cat.color }}
                    >
                      {cat.label}
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded-lg transition-all group-hover:opacity-90"
                        style={{
                          width: `${(cat.count / (toolsByCategory[0]?.count ?? 1)) * 100}%`,
                          minWidth: "2rem",
                          background: `linear-gradient(90deg, ${cat.color}40, ${cat.color}20)`,
                          border: `1px solid ${cat.color}30`,
                        }}
                      />
                    </div>
                    <span
                      className="w-12 text-right text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cat.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Tools by Type */}
          <section className="mb-16">
            <h2
              className="mb-6 font-display text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Tools by Type
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {toolsByType.map((type) => (
                <div
                  key={type.type}
                  className="rounded-xl p-4"
                  style={{
                    background: `${type.color}10`,
                    border: `1px solid ${type.color}20`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium"
                      style={{ color: type.color }}
                    >
                      {type.label}
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {type.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Top by Stars */}
            <section>
              <h2
                className="mb-6 font-display text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Most Popular Tools
              </h2>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(17, 25, 34, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="space-y-3">
                  {topByStars.map((tool, index) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: index < 3 ? "#f59e0b20" : "rgba(255, 255, 255, 0.05)",
                          color: index < 3 ? "#f59e0b" : "var(--text-tertiary)",
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="flex-1 truncate text-sm font-medium transition-colors group-hover:text-[var(--accent-primary)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.name}
                      </span>
                      <span
                        className="flex items-center gap-1 text-sm"
                        style={{ color: "#f59e0b" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {tool.repoStats?.stars?.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Recently Added */}
            <section>
              <h2
                className="mb-6 font-display text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Recently Added
              </h2>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(17, 25, 34, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="space-y-3">
                  {newestTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="flex-1 truncate text-sm font-medium transition-colors group-hover:text-[var(--accent-primary)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {new Date(tool.dateAdded).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* License Distribution */}
          <section className="mt-16">
            <h2
              className="mb-6 font-display text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              License Distribution
            </h2>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(17, 25, 34, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {licenseDistribution.map(([license, count]) => (
                  <div
                    key={license}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ background: "rgba(255, 255, 255, 0.03)" }}
                  >
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {license}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Additional Stats */}
          <section className="mt-16">
            <h2
              className="mb-6 font-display text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Additional Insights
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                className="rounded-xl p-5"
                style={{
                  background: "rgba(17, 25, 34, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#10b981" }}
                >
                  {totalForks.toLocaleString()}
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total GitHub Forks
                </div>
              </div>
              <div
                className="rounded-xl p-5"
                style={{
                  background: "rgba(17, 25, 34, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#3b82f6" }}
                >
                  {Math.round(totalStars / tools.length)}
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Avg. Stars per Tool
                </div>
              </div>
              <div
                className="rounded-xl p-5"
                style={{
                  background: "rgba(17, 25, 34, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#f59e0b" }}
                >
                  {categories.length}
                </div>
                <div
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Tool Categories
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <div
              className="rounded-2xl p-8"
              style={{
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1))",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <h3
                className="font-display text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Have a tool to add?
              </h3>
              <p
                className="mx-auto mt-2 max-w-md text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Help grow the Awesome Intune directory by submitting your favorite Microsoft Intune tools.
              </p>
              <Link
                href="/submit"
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0078d4)",
                }}
              >
                Submit a Tool
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
