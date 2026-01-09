"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Tool } from "~/types/tool";
import { TYPE_CONFIG, CATEGORY_CONFIG } from "~/lib/constants";
import { trackToolClick, trackOutboundLink } from "~/lib/plausible";
import { getToolAuthors, generateAuthorSlug } from "~/lib/tools";
import { formatViewCount } from "~/hooks/useViewTracking";
import { UpvoteButton } from "./UpvoteButton";
import { SecurityBadge } from "./SecurityBadge";
import { WorksWithTags } from "./WorksWithTags";

interface ToolCardProps {
  tool: Tool;
  index?: number;
  aiExplanation?: string;
  confidenceScore?: number;
  viewCount?: number;
  onVisible?: (toolId: string) => void;
  voteCount?: number;
  hasVoted?: boolean;
  isVotePending?: boolean;
  onVote?: (toolId: string) => Promise<boolean>;
  onBeforeNavigate?: () => void;
}

export const ToolCard = memo(function ToolCard({
  tool,
  index = 0,
  aiExplanation,
  confidenceScore,
  viewCount,
  onVisible,
  voteCount = 0,
  hasVoted = false,
  isVotePending = false,
  onVote,
  onBeforeNavigate,
}: ToolCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const typeConfig = TYPE_CONFIG[tool.type];
  const categoryConfig = CATEGORY_CONFIG[tool.category];

  // Combined IntersectionObserver for both visibility tracking and animation
  // Uses a single observer to reduce overhead
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (onVisible) {
              onVisible(tool.id);
            }
            // Disconnect after first visibility to avoid repeated calls
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1, // Lower threshold for faster animation trigger
        rootMargin: "50px" // Start animation slightly before card enters viewport
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [tool.id, onVisible]);

  const handleCardClick = () => {
    onBeforeNavigate?.();
    trackToolClick(tool.name, tool.category);
    router.push(`/tools/${tool.id}`);
  };

  const handleOutboundClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    trackOutboundLink(url);
  };

  // Calculate stagger delay (capped at 300ms)
  const staggerDelay = Math.min(index * 0.05, 0.3);

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className="block cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <article
        className={`group relative transition-all duration-400 ease-out-expo will-change-[transform,opacity] ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-5 opacity-0"
        }`}
        style={{
          transitionDelay: isVisible ? `${staggerDelay}s` : "0s",
        }}
      >
        {/* Card Container - CSS-only hover effects for performance */}
        <div
          className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "rgba(17, 25, 34, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Top Accent Gradient - CSS only */}
          <div
            className="absolute left-0 right-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, transparent, ${typeConfig.color}, transparent)`,
            }}
          />

          <div className="relative p-6">
            {/* Header Row */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              {/* Type Badge */}
              <span
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: `${typeConfig.color}15`,
                  color: typeConfig.color,
                  border: `1px solid ${typeConfig.color}25`,
                }}
              >
                {tool.type === "powershell-module" ||
                tool.type === "powershell-script" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.181 2.974c.568.3.819.972.568 1.525l-8.167 17.03c-.317.687-1.186.823-1.687.345l-4.59-4.374c-.318-.303-.352-.805-.079-1.143l5.083-6.283-5.818 3.333c-.48.274-1.085.105-1.37-.384l-4.922-8.458c-.303-.52-.112-1.193.426-1.492l20.556-1.099z" />
                  </svg>
                ) : tool.type === "web-app" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                )}
                {typeConfig.label}
              </span>

              {/* Security Badge, View Count and Upvote */}
              <div className="flex items-center gap-2">
                <SecurityBadge securityCheck={tool.securityCheck} variant="compact" hasSourceCode={!!tool.repoUrl} />
                {viewCount !== undefined && viewCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <svg
                      width="14"
                      height="14"
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
                {onVote && (
                  <UpvoteButton
                    toolId={tool.id}
                    voteCount={voteCount}
                    hasVoted={hasVoted}
                    isPending={isVotePending}
                    onVote={onVote}
                    variant="compact"
                  />
                )}
              </div>
            </div>

            {/* Tool Name */}
            <h3
              className="font-display text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-primary)" }}
            >
              {tool.name}
            </h3>

            {/* Description */}
            <p
              className="mt-3 line-clamp-2 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tool.description}
            </p>

            {/* Works With Tags */}
            {tool.worksWith && tool.worksWith.length > 0 && (
              <div className="mt-3">
                <WorksWithTags tags={tool.worksWith} variant="compact" maxDisplay={3} />
              </div>
            )}

            {/* AI Explanation */}
            {aiExplanation && (
              <div
                className="mt-4 rounded-lg p-3"
                style={{
                  background: "rgba(0, 212, 255, 0.05)",
                  border: "1px solid rgba(0, 212, 255, 0.15)",
                }}
              >
                <div className="flex items-start gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                  </svg>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {confidenceScore !== undefined && (
                        <span
                          className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold"
                          style={{
                            background:
                              confidenceScore >= 90
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(0, 212, 255, 0.15)",
                            color:
                              confidenceScore >= 90
                                ? "rgb(16, 185, 129)"
                                : "var(--accent-primary)",
                            border:
                              confidenceScore >= 90
                                ? "1px solid rgba(16, 185, 129, 0.3)"
                                : "1px solid rgba(0, 212, 255, 0.3)",
                          }}
                        >
                          {confidenceScore}% match
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {aiExplanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Authors */}
            {(() => {
              const authors = getToolAuthors(tool);
              const maxVisible = 3;
              const visibleAuthors = authors.slice(0, maxVisible);
              const remainingCount = authors.length - maxVisible;

              return (
                <div className="mt-5 flex items-center gap-3">
                  {/* Stacked Avatars */}
                  <div className="flex -space-x-2">
                    {visibleAuthors.map((author, idx) => (
                      <div
                        key={`${author.name}-${idx}`}
                        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold ring-2 ring-[#111922] transition-transform duration-200 group-hover:scale-110"
                        style={{
                          background: author.picture
                            ? "transparent"
                            : `linear-gradient(135deg, ${categoryConfig.color}40, ${categoryConfig.color}20)`,
                          color: categoryConfig.color,
                          border: `1px solid ${categoryConfig.color}30`,
                          zIndex: visibleAuthors.length - idx,
                        }}
                      >
                        {author.picture ? (
                          <Image
                            src={author.picture}
                            alt={author.name}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          author.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <div
                        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold ring-2 ring-[#111922]"
                        style={{
                          background: `linear-gradient(135deg, ${categoryConfig.color}40, ${categoryConfig.color}20)`,
                          color: categoryConfig.color,
                          border: `1px solid ${categoryConfig.color}30`,
                          zIndex: 0,
                        }}
                      >
                        +{remainingCount}
                      </div>
                    )}
                  </div>
                  <div>
                    {authors.length === 1 ? (
                      <Link
                        href={`/authors/${generateAuthorSlug(authors[0]?.name ?? "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {authors[0]?.name}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-60"
                        >
                          <path d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      </Link>
                    ) : authors.length === 2 ? (
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Link
                          href={`/authors/${generateAuthorSlug(authors[0]?.name ?? "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="transition-colors hover:underline"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          {authors[0]?.name}
                        </Link>
                        {" & "}
                        <Link
                          href={`/authors/${generateAuthorSlug(authors[1]?.name ?? "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="transition-colors hover:underline"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          {authors[1]?.name}
                        </Link>
                      </span>
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Link
                          href={`/authors/${generateAuthorSlug(authors[0]?.name ?? "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="transition-colors hover:underline"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          {authors[0]?.name}
                        </Link>
                        {` & ${authors.length - 1} others`}
                      </span>
                    )}
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {categoryConfig.label}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Links */}
            <div
              className="mt-6 flex items-center gap-3 border-t pt-5"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            >
              {/* View Details Link */}
              <Link
                href={`/tools/${tool.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:bg-white/5 hover:text-[var(--text-primary)]"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Details
              </Link>
              {tool.repoUrl && (
                <a
                  href={tool.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleOutboundClick(e, tool.repoUrl!)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:bg-white/5 hover:text-[var(--text-primary)]"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    color: "var(--text-secondary)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              )}
              {tool.downloadUrl && (
                <a
                  href={tool.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleOutboundClick(e, tool.downloadUrl!)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                    color: "white",
                    boxShadow: `0 4px 15px ${typeConfig.color}30`,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </a>
              )}
              {tool.websiteUrl && !tool.downloadUrl && (
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleOutboundClick(e, tool.websiteUrl!)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                    color: "white",
                    boxShadow: `0 4px 15px ${typeConfig.color}30`,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Visit
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
});
