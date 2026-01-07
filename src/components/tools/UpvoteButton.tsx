"use client";

import { memo } from "react";
import { formatVoteCount } from "~/hooks/useVoting";

interface UpvoteButtonProps {
  toolId: string;
  voteCount: number;
  hasVoted: boolean;
  isPending: boolean;
  onVote: (toolId: string) => Promise<boolean>;
  variant?: "compact" | "default";
}

export const UpvoteButton = memo(function UpvoteButton({
  toolId,
  voteCount,
  hasVoted,
  isPending,
  onVote,
  variant = "compact",
}: UpvoteButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (hasVoted || isPending) return;
    await onVote(toolId);
  };

  const isCompact = variant === "compact";

  return (
    <button
      onClick={handleClick}
      disabled={hasVoted || isPending}
      className={`
        group/vote inline-flex items-center justify-center gap-1
        rounded-lg font-medium transition-all duration-200
        min-h-[32px] min-w-[32px]
        ${isCompact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}
        ${
          hasVoted
            ? "cursor-default"
            : "cursor-pointer hover:scale-105 active:scale-95"
        }
        ${isPending ? "animate-pulse" : ""}
      `}
      style={{
        background: hasVoted
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(255, 255, 255, 0.04)",
        color: hasVoted ? "rgb(16, 185, 129)" : "var(--text-secondary)",
        border: hasVoted
          ? "1px solid rgba(16, 185, 129, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.08)",
      }}
      title={hasVoted ? "You voted for this tool" : "Upvote this tool"}
      aria-label={
        hasVoted
          ? `You voted for this tool. ${voteCount} votes.`
          : `Upvote this tool. ${voteCount} votes.`
      }
    >
      {/* Upvote Arrow */}
      <svg
        width={isCompact ? "12" : "14"}
        height={isCompact ? "12" : "14"}
        viewBox="0 0 24 24"
        fill={hasVoted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`
          transition-transform duration-200
          ${!hasVoted && !isPending ? "group-hover/vote:-translate-y-0.5" : ""}
        `}
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>

      {/* Vote Count - only show when > 0 */}
      {voteCount > 0 && (
        <span className="tabular-nums">
          {formatVoteCount(voteCount)}
        </span>
      )}
    </button>
  );
});
