import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getToolById, getAllToolIds } from "~/lib/tools.server";
import { getToolAuthors } from "~/lib/tools";
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

interface ToolPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const toolIds = getAllToolIds();
  return toolIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const tool = getToolById(id);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  const description = tool.description.length > 155
    ? tool.description.slice(0, 152) + "..."
    : tool.description;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(tool.category)}&type=${encodeURIComponent(tool.type)}&author=${encodeURIComponent(tool.author)}`;

  return {
    title: `${tool.name} - ${SITE_CONFIG.name}`,
    description,
    openGraph: {
      title: `${tool.name} - ${SITE_CONFIG.name}`,
      description,
      type: "website",
      url: `${SITE_CONFIG.url}/tools/${tool.id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.name} - ${CATEGORY_CONFIG[tool.category]?.label} tool`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - ${SITE_CONFIG.name}`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const tool = getToolById(id);

  if (!tool) {
    notFound();
  }

  const screenshots = tool.screenshots ?? [];

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
        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 sm:pb-32 sm:pt-28">
          {/* Back Navigation */}
          <Link
            href="/"
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

          {/* Hero Card */}
          <article
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: "rgba(17, 25, 34, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              boxShadow: `0 40px 80px -20px rgba(0, 0, 0, 0.6), 0 0 100px -30px ${typeConfig.color}20`,
            }}
          >
            {/* Top Gradient Accent */}
            <div
              className="absolute left-0 right-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent 10%, ${typeConfig.color}60, transparent 90%)`,
              }}
            />

            {/* Subtle Corner Glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 opacity-30"
              style={{
                background: `radial-gradient(circle, ${typeConfig.color}25, transparent 70%)`,
              }}
            />

            <div className="relative p-8 sm:p-12">
              {/* Badges Row */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {/* Type Badge */}
                <span
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: `${typeConfig.color}18`,
                    color: typeConfig.color,
                    border: `1px solid ${typeConfig.color}30`,
                    boxShadow: `0 0 24px ${typeConfig.color}12`,
                  }}
                >
                  {tool.type === "powershell-module" || tool.type === "powershell-script" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.181 2.974c.568.3.819.972.568 1.525l-8.167 17.03c-.317.687-1.186.823-1.687.345l-4.59-4.374c-.318-.303-.352-.805-.079-1.143l5.083-6.283-5.818 3.333c-.48.274-1.085.105-1.37-.384l-4.922-8.458c-.303-.52-.112-1.193.426-1.492l20.556-1.099z" />
                    </svg>
                  ) : tool.type === "web-app" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  ) : tool.type === "cli-tool" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                  {typeConfig.label}
                </span>

                {/* Category Badge - Links to category page */}
                <Link
                  href={`/tools/category/${tool.category}`}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: `${categoryConfig.color}15`,
                    color: categoryConfig.color,
                    border: `1px solid ${categoryConfig.color}25`,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  {categoryConfig.label}
                </Link>

                {/* View Counter */}
                <ToolViewCounter toolId={tool.id} />

                {/* Upvote Button */}
                <ToolUpvoteButton toolId={tool.id} />
              </div>

              {/* Tool Name */}
              <h1
                className="font-display text-2xl font-bold leading-tight tracking-tight break-words hyphens-auto sm:text-4xl lg:text-5xl"
                style={{ color: "var(--text-primary)" }}
              >
                {tool.name}
              </h1>

              {/* Description */}
              <p
                className="mt-6 text-lg leading-relaxed sm:text-xl"
                style={{ color: "var(--text-secondary)" }}
              >
                {tool.description}
              </p>

              {/* Authors Section */}
              {(() => {
                const authors = getToolAuthors(tool);
                return (
                  <div
                    className="mt-10 border-t pt-8"
                    style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
                  >
                    <span
                      className="mb-4 block text-sm uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Created by
                    </span>
                    <div className={`flex flex-wrap gap-6 ${authors.length > 1 ? "flex-col sm:flex-row" : ""}`}>
                      {authors.map((author, index) => (
                        <div
                          key={`${author.name}-${index}`}
                          className="flex items-center gap-4"
                        >
                          {/* Avatar */}
                          <div
                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                            style={{
                              background: author.picture
                                ? "transparent"
                                : `linear-gradient(135deg, ${categoryConfig.color}50, ${categoryConfig.color}25)`,
                              border: `2px solid ${categoryConfig.color}40`,
                              boxShadow: `0 0 20px ${categoryConfig.color}15`,
                            }}
                          >
                            {author.picture ? (
                              <Image
                                src={author.picture}
                                alt={author.name}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span
                                className="text-xl font-bold"
                                style={{ color: categoryConfig.color }}
                              >
                                {author.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Author Name and Social Links */}
                          <div className="flex flex-col gap-2">
                            <span
                              className="text-lg font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {author.name}
                            </span>
                            {/* Social Links */}
                            {[author.githubUrl, author.linkedinUrl, author.xUrl].some(Boolean) && (
                              <div className="flex items-center gap-2">
                                {author.githubUrl && (
                                  <a
                                    href={author.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-[var(--text-primary)]"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.04)",
                                      border: "1px solid rgba(255, 255, 255, 0.08)",
                                      color: "var(--text-secondary)",
                                    }}
                                    title="GitHub Profile"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                  </a>
                                )}
                                {author.linkedinUrl && (
                                  <a
                                    href={author.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-[var(--text-primary)]"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.04)",
                                      border: "1px solid rgba(255, 255, 255, 0.08)",
                                      color: "var(--text-secondary)",
                                    }}
                                    title="LinkedIn Profile"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                  </a>
                                )}
                                {author.xUrl && (
                                  <a
                                    href={author.xUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-[var(--text-primary)]"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.04)",
                                      border: "1px solid rgba(255, 255, 255, 0.08)",
                                      color: "var(--text-secondary)",
                                    }}
                                    title="X (Twitter) Profile"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
                );
              })()}

              {/* Action Buttons - Only show if at least one URL exists */}
              {[tool.repoUrl, tool.downloadUrl, tool.websiteUrl].some(Boolean) && (
                <div
                  className="mt-8 flex flex-wrap gap-4 border-t pt-8"
                  style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
                >
                  {tool.repoUrl && (
                  <a
                    href={tool.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold transition-all hover:scale-[1.02] sm:flex-none"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "var(--text-primary)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="hidden sm:inline">View on GitHub</span>
                    <span className="sm:hidden">GitHub</span>
                  </a>
                )}
                {tool.downloadUrl && (
                  <a
                    href={tool.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] sm:flex-none"
                    style={{
                      background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                      boxShadow: `0 8px 24px ${typeConfig.color}35`,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </a>
                )}
                {tool.websiteUrl && (
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold transition-all hover:scale-[1.02] sm:flex-none"
                    style={{
                      background: tool.downloadUrl
                        ? "rgba(255, 255, 255, 0.04)"
                        : `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                      color: tool.downloadUrl ? "var(--text-primary)" : "white",
                      border: tool.downloadUrl ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                      boxShadow: tool.downloadUrl ? "none" : `0 8px 24px ${typeConfig.color}35`,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Visit Website
                  </a>
                )}
                </div>
              )}

              {/* GitHub Repository Stats */}
              {tool.repoUrl && (
                <GitHubStats
                  repoUrl={tool.repoUrl}
                  accentColor={typeConfig.color}
                />
              )}

              {/* Screenshots Gallery */}
              {screenshots.length > 0 && (
                <ScreenshotGallery
                  screenshots={screenshots}
                  toolName={tool.name}
                  accentColor={typeConfig.color}
                />
              )}
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
