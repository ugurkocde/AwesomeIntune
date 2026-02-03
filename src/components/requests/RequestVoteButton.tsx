"use client";

import { memo } from "react";
import { formatRequestVoteCount } from "~/hooks/useRequestVoting";

interface RequestVoteButtonProps {
  requestId: string;
  voteCount: number;
  hasVoted: boolean;
  isPending: boolean;
  onVote: (requestId: string) => Promise<boolean>;
}

export const RequestVoteButton = memo(function RequestVoteButton({
  requestId,
  voteCount,
  hasVoted,
  isPending,
  onVote,
}: RequestVoteButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (hasVoted || isPending) return;
    await onVote(requestId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={hasVoted || isPending}
      className={`
        group/vote inline-flex items-center justify-center gap-1.5
        rounded-lg font-medium transition-all duration-200
        min-h-[36px] px-3 py-2 text-sm
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
      title={hasVoted ? "You voted for this idea" : "Vote for this idea"}
      aria-label={
        hasVoted
          ? `You voted for this idea. ${voteCount} votes.`
          : `Vote for this idea. ${voteCount} votes.`
      }
    >
      {/* Upvote Arrow */}
      <svg
        width="14"
        height="14"
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

      {/* Vote Count */}
      <span className="tabular-nums">{formatRequestVoteCount(voteCount)}</span>
    </button>
  );
});
