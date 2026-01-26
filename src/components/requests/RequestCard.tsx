"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { ToolRequestWithVotes, RequestStatus } from "~/types/request";
import { RequestVoteButton } from "./RequestVoteButton";
import { CATEGORY_CONFIG } from "~/lib/constants";
import type { ToolCategory } from "~/types/tool";

interface RequestCardProps {
  request: ToolRequestWithVotes;
  voteCount: number;
  hasVoted: boolean;
  isPending: boolean;
  onVote: (requestId: string) => Promise<boolean>;
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; color: string; bgColor: string }
> = {
  open: {
    label: "Open",
    color: "rgb(59, 130, 246)",
    bgColor: "rgba(59, 130, 246, 0.15)",
  },
  in_progress: {
    label: "In Progress",
    color: "rgb(245, 158, 11)",
    bgColor: "rgba(245, 158, 11, 0.15)",
  },
  completed: {
    label: "Completed",
    color: "rgb(16, 185, 129)",
    bgColor: "rgba(16, 185, 129, 0.15)",
  },
  closed: {
    label: "Closed",
    color: "rgb(107, 114, 128)",
    bgColor: "rgba(107, 114, 128, 0.15)",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const RequestCard = memo(function RequestCard({
  request,
  voteCount,
  hasVoted,
  isPending,
  onVote,
}: RequestCardProps) {
  const statusConfig = STATUS_CONFIG[request.status];
  const categoryConfig = request.category
    ? CATEGORY_CONFIG[request.category as ToolCategory]
    : null;

  const handleCardClick = () => {
    window.open(request.github_issue_url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--border-medium)]"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
      whileHover={{ scale: 1.01 }}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Header with Status and Vote */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </span>

          {/* Category Badge */}
          {categoryConfig && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: `${categoryConfig.color}20`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </span>
          )}
        </div>

        {/* Vote Button */}
        <div onClick={(e) => e.stopPropagation()}>
          <RequestVoteButton
            requestId={request.id}
            voteCount={voteCount}
            hasVoted={hasVoted}
            isPending={isPending}
            onVote={onVote}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        className="mb-2 text-lg font-semibold leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {request.title}
      </h3>

      {/* Description */}
      <p
        className="mb-4 line-clamp-3 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {request.description}
      </p>

      {/* Use Case (if provided) */}
      {request.use_case && (
        <div className="mb-4">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-tertiary)" }}
          >
            Use Case
          </p>
          <p
            className="mt-1 line-clamp-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {request.use_case}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {/* Date */}
        <span
          className="text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          {formatDate(request.created_at)}
        </span>

        {/* Links */}
        <div className="flex items-center gap-3">
          {/* Fulfilled Tool Link (if completed) */}
          {request.status === "completed" && request.fulfilled_tool_id && (
            <a
              href={`/tools/${request.fulfilled_tool_id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--signal-success)" }}
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
              View Tool
            </a>
          )}

          {/* GitHub indicator */}
          <span
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Click to discuss
          </span>
        </div>
      </div>
    </motion.div>
  );
});
