"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Tool } from "~/types/tool";
import { TYPE_CONFIG, CATEGORY_CONFIG } from "~/lib/constants";
import { trackToolClick, trackOutboundLink } from "~/lib/plausible";
import { getToolAuthors } from "~/lib/tools";
import { formatViewCount } from "~/hooks/useViewTracking";
import { UpvoteButton } from "./UpvoteButton";

interface ToolListItemProps {
  tool: Tool;
  index?: number;
  viewCount?: number;
  onVisible?: (toolId: string) => void;
  voteCount?: number;
  hasVoted?: boolean;
  isVotePending?: boolean;
  onVote?: (toolId: string) => Promise<boolean>;
}

export const ToolListItem = memo(function ToolListItem({
  tool,
  index = 0,
  viewCount,
  onVisible,
  voteCount = 0,
  hasVoted = false,
  isVotePending = false,
  onVote,
}: ToolListItemProps) {
  const router = useRouter();
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const typeConfig = TYPE_CONFIG[tool.type];
  const categoryConfig = CATEGORY_CONFIG[tool.category];
  const authors = getToolAuthors(tool);
  const primaryAuthor = authors[0];

  // Intersection observer for visibility tracking and animation
  useEffect(() => {
    if (!itemRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (onVisible) {
              onVisible(tool.id);
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [tool.id, onVisible]);

  const handleClick = () => {
    trackToolClick(tool.name, tool.category);
    router.push(`/tools/${tool.id}`);
  };

  const handleOutboundClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    trackOutboundLink(url);
  };

  const staggerDelay = Math.min(index * 0.03, 0.2);

  return (
    <div
      ref={itemRef}
      onClick={handleClick}
      className="block cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <article
        className={`group relative transition-all duration-300 ease-out-expo ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        style={{ transitionDelay: isVisible ? `${staggerDelay}s` : "0s" }}
      >
        <div
          className="relative grid items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:scale-[1.005]"
          style={{
            background: "rgba(17, 25, 34, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            gridTemplateColumns: "48px minmax(200px, 1fr) auto auto auto",
          }}
        >
          {/* Hover accent line */}
          <div
            className="absolute left-0 top-0 h-full w-1 rounded-l-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ background: typeConfig.color }}
          />

          {/* Type Icon - Fixed width column */}
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `${typeConfig.color}15`,
              border: `1px solid ${typeConfig.color}25`,
            }}
          >
            {tool.type === "powershell-module" || tool.type === "powershell-script" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill={typeConfig.color}>
                <path d="M23.181 2.974c.568.3.819.972.568 1.525l-8.167 17.03c-.317.687-1.186.823-1.687.345l-4.59-4.374c-.318-.303-.352-.805-.079-1.143l5.083-6.283-5.818 3.333c-.48.274-1.085.105-1.37-.384l-4.922-8.458c-.303-.52-.112-1.193.426-1.492l20.556-1.099z" />
              </svg>
            ) : tool.type === "web-app" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={typeConfig.color}
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={typeConfig.color}
                strokeWidth="2"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            )}
          </div>

          {/* Content - Flexible width column */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="truncate font-display text-base font-semibold transition-colors group-hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-primary)" }}
              >
                {tool.name}
              </h3>
              <span
                className="flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium"
                style={{
                  background: `${categoryConfig.color}15`,
                  color: categoryConfig.color,
                }}
              >
                {categoryConfig.label}
              </span>
            </div>
            <p
              className="mt-1 line-clamp-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {tool.description}
            </p>
          </div>

          {/* Author - Fixed width column */}
          <div className="hidden w-[140px] items-center gap-2 sm:flex">
            {primaryAuthor && (
              <>
                {primaryAuthor.picture ? (
                  <Image
                    src={primaryAuthor.picture}
                    alt={primaryAuthor.name}
                    width={24}
                    height={24}
                    className="flex-shrink-0 rounded-full"
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: `${categoryConfig.color}20`,
                      color: categoryConfig.color,
                    }}
                  >
                    {primaryAuthor.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className="truncate text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {primaryAuthor.name}
                </span>
              </>
            )}
          </div>

          {/* Stats - Fixed width column */}
          <div className="hidden w-[100px] items-center justify-end gap-3 md:flex">
            {viewCount !== undefined && viewCount > 0 && (
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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

          {/* Actions - Fixed width column */}
          <div className="flex w-[88px] items-center justify-end gap-2">
            <Link
              href={`/tools/${tool.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View
            </Link>
            {tool.repoUrl && (
              <a
                href={tool.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleOutboundClick(e, tool.repoUrl!)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                aria-label="View on GitHub"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
});
