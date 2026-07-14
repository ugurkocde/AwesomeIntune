import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getToolById,
  getAllToolIds,
  getRelatedTools,
} from "~/lib/tools.server";
import { getToolAuthors, generateAuthorSlug } from "~/lib/tools";
import { TYPE_CONFIG, CATEGORY_CONFIG, SITE_CONFIG } from "~/lib/constants";
import {
  generateToolStructuredData,
  generateBreadcrumbStructuredData,
  generateToolFAQStructuredData,
} from "~/lib/structured-data";
import { GitHubStats } from "~/components/tools/GitHubStats";
import { ScreenshotGallery } from "~/components/tools/ScreenshotGallery";
import { ToolViewCounter } from "~/components/tools/ToolViewCounter";
import { ToolUpvoteButton } from "~/components/tools/ToolUpvoteButton";
import {
  SecurityBadge,
  SecurityChecklist,
} from "~/components/tools/SecurityBadge";
import { WorksWithTags } from "~/components/tools/WorksWithTags";
import { RelatedTools } from "~/components/tools/RelatedTools";
import { PopularityBadge } from "~/components/tools/PopularityBadge";
import { RepoStatsProvider } from "~/components/tools/RepoStatsProvider";
import { ArchivedNotice } from "~/components/tools/ArchivedNotice";
import { ToolActionButtons } from "~/components/tools/ToolActionButtons";

interface ToolPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const toolIds = getAllToolIds();
  return toolIds.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const tool = getToolById(id);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  const categoryLabel = CATEGORY_CONFIG[tool.category]?.label ?? tool.category;
  const typeLabel = TYPE_CONFIG[tool.type]?.label ?? tool.type;

  // Optimized title for SEO: includes category and "Intune" keyword
  const title = `${tool.name}: Free ${categoryLabel} Tool for Intune`;

  // Optimized description with action-oriented language
  const baseDescription = `Download ${tool.name}, a free ${typeLabel.toLowerCase()} for Microsoft Intune ${categoryLabel.toLowerCase()}. ${tool.description}`;
  const description =
    baseDescription.length > 155
      ? baseDescription.slice(0, 152) + "…"
      : baseDescription;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(tool.category)}&type=${encodeURIComponent(tool.type)}&author=${encodeURIComponent(tool.author)}`;

  // Build keywords array from tool keywords plus standard terms
  const keywords = [
    tool.name,
    `${tool.name} download`,
    `Intune ${categoryLabel}`,
    `Intune ${categoryLabel} tools`,
    `Microsoft Intune ${categoryLabel.toLowerCase()}`,
    typeLabel,
    ...(tool.keywords ?? []),
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_CONFIG.url}/tools/${tool.id}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_CONFIG.url}/tools/${tool.id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.name} - ${categoryLabel} tool for Microsoft Intune`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

function TypeIcon({ type }: { type: string }) {
  if (type === "powershell-module" || type === "powershell-script") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.181 2.974c.568.3.819.972.568 1.525l-8.167 17.03c-.317.687-1.186.823-1.687.345l-4.59-4.374c-.318-.303-.352-.805-.079-1.143l5.083-6.283-5.818 3.333c-.48.274-1.085.105-1.37-.384l-4.922-8.458c-.303-.52-.112-1.193.426-1.492l20.556-1.099z" />
      </svg>
    );
  }
  if (type === "web-app") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  if (type === "cli-tool") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const tool = getToolById(id);

  if (!tool) {
    notFound();
  }

  const screenshots = tool.screenshots ?? [];
  const relatedTools = getRelatedTools(tool, 4);
  const authors = getToolAuthors(tool);
  const hasActions = [tool.repoUrl, tool.downloadUrl, tool.websiteUrl].some(
    Boolean,
  );

  const typeConfig = TYPE_CONFIG[tool.type];
  const categoryConfig = CATEGORY_CONFIG[tool.category];
  const structuredData = generateToolStructuredData(tool);
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: SITE_CONFIG.url },
    {
      name: categoryConfig.label,
      url: `${SITE_CONFIG.url}/tools/category/${tool.category}`,
    },
    { name: tool.name, url: `${SITE_CONFIG.url}/tools/${tool.id}` },
  ]);
  const faqData = generateToolFAQStructuredData(tool);

  const cardStyle = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-subtle)",
  } as const;

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
        {/* Atmospheric Background Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${typeConfig.color}15, transparent 70%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 80% 60%, ${categoryConfig.color}08, transparent 50%)`,
          }}
        />

        {/* Content Container */}
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 sm:pt-28 sm:pb-28">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol
              className="flex flex-wrap items-center gap-2 text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="opacity-50">
                /
              </li>
              <li>
                <Link
                  href={`/tools/category/${tool.category}`}
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {categoryConfig.label}
                </Link>
              </li>
              <li aria-hidden="true" className="opacity-50">
                /
              </li>
              <li
                aria-current="page"
                style={{ color: "var(--text-secondary)" }}
              >
                {tool.name}
              </li>
            </ol>
          </nav>

          <RepoStatsProvider repoUrl={tool.repoUrl}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Main Column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Header Card */}
                <section
                  className="relative overflow-hidden rounded-2xl"
                  style={cardStyle}
                >
                  {/* Top gradient accent */}
                  <div
                    className="absolute top-0 right-0 left-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent 10%, ${typeConfig.color}60, transparent 90%)`,
                    }}
                  />
                  <div className="relative p-6 sm:p-10">
                    <ArchivedNotice />

                    {/* Type Badge */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider uppercase"
                        style={{
                          background: `${typeConfig.color}18`,
                          color: typeConfig.color,
                          border: `1px solid ${typeConfig.color}30`,
                        }}
                      >
                        <TypeIcon type={tool.type} />
                        {typeConfig.label}
                      </span>
                      <SecurityBadge
                        securityCheck={tool.securityCheck}
                        variant="compact"
                        hasSourceCode={!!tool.repoUrl}
                      />
                    </div>

                    {/* Tool Name */}
                    <h1
                      className="font-display mt-5 text-3xl leading-tight font-bold tracking-tight break-words hyphens-auto sm:text-4xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tool.name}
                    </h1>

                    {/* Description */}
                    <p
                      className="mt-5 text-lg leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {tool.description}
                    </p>

                    {/* Works With Tags */}
                    {tool.worksWith && tool.worksWith.length > 0 && (
                      <div className="mt-6">
                        <span
                          className="mb-3 block text-xs tracking-wider uppercase"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Works with
                        </span>
                        <WorksWithTags tags={tool.worksWith} variant="full" />
                      </div>
                    )}

                    {/* Mobile actions - directly after the description */}
                    {hasActions && (
                      <div
                        className="mt-8 border-t pt-6 lg:hidden"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        <ToolActionButtons tool={tool} />
                      </div>
                    )}
                  </div>
                </section>

                {/* Screenshots */}
                {screenshots.length > 0 && (
                  <section className="rounded-2xl p-6 sm:p-8" style={cardStyle}>
                    <ScreenshotGallery
                      screenshots={screenshots}
                      toolName={tool.name}
                      accentColor={typeConfig.color}
                    />
                  </section>
                )}

                {/* Security Analysis */}
                {tool.securityCheck && (
                  <section className="px-1">
                    <div className="mb-6 flex items-center gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-secondary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Security Analysis
                      </h2>
                    </div>
                    <SecurityBadge
                      securityCheck={tool.securityCheck}
                      variant="full"
                      hasSourceCode={!!tool.repoUrl}
                    />
                    {tool.securityCheck.filesScanned > 0 && (
                      <div className="mt-6">
                        <SecurityChecklist securityCheck={tool.securityCheck} />
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="space-y-4 lg:sticky lg:top-24">
                  {/* Actions - desktop only (mobile shows them inline) */}
                  {hasActions && (
                    <div
                      className="hidden rounded-2xl p-5 lg:block"
                      style={cardStyle}
                    >
                      <ToolActionButtons tool={tool} />
                    </div>
                  )}

                  {/* Repository stats */}
                  {tool.repoUrl && (
                    <div className="rounded-2xl p-5" style={cardStyle}>
                      <h2
                        className="mb-4 text-xs font-semibold tracking-widest uppercase"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Repository
                      </h2>
                      <GitHubStats accentColor={typeConfig.color} />
                    </div>
                  )}

                  {/* About */}
                  <div className="rounded-2xl p-5" style={cardStyle}>
                    <h2
                      className="mb-4 text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      About
                    </h2>
                    <div className="space-y-3">
                      {/* Category */}
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Category
                        </span>
                        <Link
                          href={`/tools/category/${tool.category}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wider uppercase transition-transform hover:scale-105"
                          style={{
                            background: `${categoryConfig.color}15`,
                            color: categoryConfig.color,
                            border: `1px solid ${categoryConfig.color}25`,
                          }}
                        >
                          {categoryConfig.label}
                        </Link>
                      </div>

                      {/* Popularity + Views */}
                      <div className="flex flex-wrap items-center gap-2">
                        <PopularityBadge
                          toolId={tool.id}
                          category={tool.category}
                        />
                        <ToolViewCounter toolId={tool.id} />
                      </div>

                      {/* Upvote */}
                      <div
                        className="border-t pt-3"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        <ToolUpvoteButton
                          toolId={tool.id}
                          toolName={tool.name}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Authors */}
                  {authors.length > 0 && (
                    <div className="rounded-2xl p-5" style={cardStyle}>
                      <h2
                        className="mb-4 text-xs font-semibold tracking-widest uppercase"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Created by
                      </h2>
                      <div className="space-y-4">
                        {authors.map((author, index) => (
                          <div
                            key={`${author.name}-${index}`}
                            className="flex items-center gap-3"
                          >
                            {/* Avatar */}
                            <div
                              className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                              style={{
                                background: author.picture
                                  ? "transparent"
                                  : `linear-gradient(135deg, ${categoryConfig.color}50, ${categoryConfig.color}25)`,
                                border: `2px solid ${categoryConfig.color}40`,
                              }}
                            >
                              {author.picture ? (
                                <Image
                                  src={author.picture}
                                  alt={author.name}
                                  width={44}
                                  height={44}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span
                                  className="text-lg font-bold"
                                  style={{ color: categoryConfig.color }}
                                >
                                  {author.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="flex min-w-0 flex-col gap-1">
                              <Link
                                href={`/authors/${generateAuthorSlug(author.name)}`}
                                className="inline-flex items-center gap-1.5 truncate text-sm font-semibold transition-colors hover:underline"
                                style={{ color: "var(--accent-primary)" }}
                              >
                                <span className="truncate">{author.name}</span>
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="flex-shrink-0 opacity-60"
                                  aria-hidden="true"
                                >
                                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                                </svg>
                              </Link>
                              {[
                                author.githubUrl,
                                author.linkedinUrl,
                                author.xUrl,
                              ].some(Boolean) && (
                                <div className="flex items-center gap-1.5">
                                  {author.githubUrl && (
                                    <a
                                      href={author.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-[transform,color] hover:scale-105 hover:text-[var(--text-primary)]"
                                      style={{
                                        background: "var(--bg-tertiary)",
                                        border:
                                          "1px solid var(--border-subtle)",
                                        color: "var(--text-secondary)",
                                      }}
                                      aria-label={`${author.name} on GitHub`}
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                      </svg>
                                    </a>
                                  )}
                                  {author.linkedinUrl && (
                                    <a
                                      href={author.linkedinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-[transform,color] hover:scale-105 hover:text-[var(--text-primary)]"
                                      style={{
                                        background: "var(--bg-tertiary)",
                                        border:
                                          "1px solid var(--border-subtle)",
                                        color: "var(--text-secondary)",
                                      }}
                                      aria-label={`${author.name} on LinkedIn`}
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                      </svg>
                                    </a>
                                  )}
                                  {author.xUrl && (
                                    <a
                                      href={author.xUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-[transform,color] hover:scale-105 hover:text-[var(--text-primary)]"
                                      style={{
                                        background: "var(--bg-tertiary)",
                                        border:
                                          "1px solid var(--border-subtle)",
                                        color: "var(--text-secondary)",
                                      }}
                                      aria-label={`${author.name} on X`}
                                    >
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </RepoStatsProvider>

          {/* Related Tools - own section below the grid */}
          {relatedTools.length > 0 && (
            <section className="mt-12">
              <RelatedTools tools={relatedTools} currentToolId={tool.id} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}
