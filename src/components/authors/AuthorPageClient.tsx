"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { Tool } from "~/types/tool";
import type { ViewCounts } from "~/hooks/useViewTracking";
import { formatViewCount } from "~/hooks/useViewTracking";
import { TYPE_CONFIG, CATEGORY_CONFIG } from "~/lib/constants";

interface AuthorPageClientProps {
  tools: Tool[];
  toolIds: string[];
  authorName: string;
  totalStars: number;
}

export function AuthorPageClient({
  tools,
  toolIds,
  authorName,
  totalStars,
}: AuthorPageClientProps) {
  const [viewCounts, setViewCounts] = useState<ViewCounts>({});
  const [isLoading, setIsLoading] = useState(true);

  // Single fetch for all view data
  useEffect(() => {
    let isMounted = true;

    const fetchViewCounts = async () => {
      try {
        const response = await fetch("/api/views");
        if (response.ok && isMounted) {
          const counts = (await response.json()) as ViewCounts;
          setViewCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch view counts:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchViewCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate total views from fetched data
  const totalViews = useMemo(() => {
    return toolIds.reduce((sum, id) => sum + (viewCounts[id] ?? 0), 0);
  }, [toolIds, viewCounts]);

  // Sort tools by view count (stable sort - only changes when viewCounts changes)
  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => {
      const viewsA = viewCounts[a.id] ?? 0;
      const viewsB = viewCounts[b.id] ?? 0;
      if (viewsB !== viewsA) return viewsB - viewsA;
      // Secondary sort by name for stability when views are equal
      return a.name.localeCompare(b.name);
    });
  }, [tools, viewCounts]);

  const toolCount = tools.length;

  return (
    <>
      {/* Stats Section */}
      <div className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
          {/* Tools Count */}
          <div
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 212, 255, 0.04))",
              border: "1px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            <div
              className="absolute -right-4 -top-4 h-16 w-16 opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgba(0, 212, 255, 0.5), transparent 70%)",
              }}
            />
            <div className="relative">
              <span
                className="block text-2xl font-bold sm:text-3xl"
                style={{ color: "var(--accent-primary)" }}
              >
                {toolCount}
              </span>
              <span
                className="mt-1 block text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                {toolCount === 1 ? "Tool" : "Tools"}
              </span>
            </div>
          </div>

          {/* Total Views */}
          <div
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04))",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div
              className="absolute -right-4 -top-4 h-16 w-16 opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent 70%)",
              }}
            />
            <div className="relative">
              {isLoading ? (
                <span className="block h-8 w-16 animate-pulse rounded bg-white/10 sm:h-9" />
              ) : (
                <span
                  className="block text-2xl font-bold sm:text-3xl"
                  style={{ color: "#8b5cf6" }}
                >
                  {formatViewCount(totalViews)}
                </span>
              )}
              <span
                className="mt-1 block text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Total Views
              </span>
            </div>
          </div>

          {/* GitHub Stars (if available) */}
          {totalStars > 0 && (
            <div
              className="relative col-span-2 overflow-hidden rounded-2xl p-4 sm:col-span-1 sm:p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(251, 191, 36, 0.04))",
                border: "1px solid rgba(251, 191, 36, 0.2)",
              }}
            >
              <div
                className="absolute -right-4 -top-4 h-16 w-16 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%)",
                }}
              />
              <div className="relative flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="#fbbf24"
                  className="flex-shrink-0"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div>
                  <span
                    className="block text-2xl font-bold sm:text-3xl"
                    style={{ color: "#fbbf24" }}
                  >
                    {formatViewCount(totalStars)}
                  </span>
                  <span
                    className="mt-1 block text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    GitHub Stars
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expertise Areas */}
      <AuthorExpertiseSection tools={tools} />

      {/* Tools Section */}
      <div
        className="mt-10 border-t pt-8"
        style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Tools by {authorName}
          </h2>
          {!isLoading && Object.keys(viewCounts).length > 0 && (
            <span
              className="text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              Sorted by popularity
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sortedTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              viewCount={viewCounts[tool.id] ?? 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Inlined expertise section to avoid extra component overhead
function AuthorExpertiseSection({ tools }: { tools: Tool[] }) {
  // Calculate category distribution
  const categoryMap = new Map<string, number>();
  tools.forEach((tool) => {
    categoryMap.set(tool.category, (categoryMap.get(tool.category) ?? 0) + 1);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([key, count]) => ({
      key,
      label: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.label ?? key,
      color: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.color ?? "#6b7280",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate type distribution
  const typeMap = new Map<string, number>();
  tools.forEach((tool) => {
    typeMap.set(tool.type, (typeMap.get(tool.type) ?? 0) + 1);
  });

  const types = Array.from(typeMap.entries())
    .map(([key, count]) => ({
      key,
      label: TYPE_CONFIG[key as keyof typeof TYPE_CONFIG]?.label ?? key,
      color: TYPE_CONFIG[key as keyof typeof TYPE_CONFIG]?.color ?? "#6b7280",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Only show if there's meaningful diversity
  if (categories.length <= 1 && types.length <= 1) {
    return null;
  }

  return (
    <div
      className="mt-8 rounded-2xl p-5"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <h3
        className="mb-4 text-sm font-medium uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        Expertise Areas
      </h3>

      <div className="space-y-6">
        {categories.length > 1 && (
          <div>
            <span
              className="mb-3 block text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}25`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: cat.color }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {types.length > 1 && (
          <div>
            <span
              className="mb-3 block text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Tool Types
            </span>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <div
                  key={type.key}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{
                    background: `${type.color}15`,
                    border: `1px solid ${type.color}25`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: type.color }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: type.color }}
                  >
                    {type.label}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {type.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inlined tool card for better performance (no prop drilling of viewCounts)
function ToolCard({
  tool,
  viewCount,
  index,
}: {
  tool: Tool;
  viewCount: number;
  index: number;
}) {
  const typeConfig = TYPE_CONFIG[tool.type];
  const categoryConfig = CATEGORY_CONFIG[tool.category];

  return (
    <Link
      href={`/tools/${tool.id}`}
      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Hover gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top right, ${typeConfig.color}08, transparent 70%)`,
        }}
      />

      {/* Top accent line on hover */}
      <div
        className="absolute left-0 right-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 10%, ${typeConfig.color}60, transparent 90%)`,
        }}
      />

      <div className="relative p-5">
        {/* Header with badges and view count */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `${typeConfig.color}15`,
                color: typeConfig.color,
                border: `1px solid ${typeConfig.color}25`,
              }}
            >
              {typeConfig.label}
            </span>
            <span
              className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium"
              style={{
                background: `${categoryConfig.color}12`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </span>
          </div>

          {/* View count */}
          {viewCount > 0 && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatViewCount(viewCount)}
            </span>
          )}
        </div>

        {/* Tool Name */}
        <h3
          className="text-base font-semibold leading-tight transition-colors duration-200 group-hover:text-[var(--accent-primary)]"
          style={{ color: "var(--text-primary)" }}
        >
          {tool.name}
        </h3>

        {/* Description */}
        <p
          className="mt-2 line-clamp-2 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {tool.description}
        </p>

        {/* GitHub stats if available */}
        {tool.repoStats && (tool.repoStats.stars > 0 || tool.repoStats.forks > 0) && (
          <div
            className="mt-4 flex items-center gap-4 border-t pt-3"
            style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
          >
            {tool.repoStats.stars > 0 && (
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {formatViewCount(tool.repoStats.stars)}
              </span>
            )}
            {tool.repoStats.forks > 0 && (
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="18" cy="6" r="3" />
                  <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
                  <path d="M12 12v3" />
                </svg>
                {tool.repoStats.forks}
              </span>
            )}
          </div>
        )}

        {/* Arrow indicator */}
        <div
          className="absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
          style={{ color: "var(--accent-primary)" }}
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
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
