"use client";

import { useVoting, formatVoteCount } from "~/hooks/useVoting";

interface ToolUpvoteButtonProps {
  toolId: string;
}

export function ToolUpvoteButton({ toolId }: ToolUpvoteButtonProps) {
  const { voteCounts, hasVoted, isVotePending, vote } = useVoting();

  const voteCount = voteCounts[toolId] ?? 0;
  const voted = hasVoted(toolId);
  const isPending = isVotePending(toolId);

  const handleClick = async () => {
    if (voted || isPending) return;
    await vote(toolId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={voted || isPending}
      className={`
        group inline-flex items-center gap-1.5 sm:gap-2 rounded-lg
        px-3 py-1.5 sm:px-4 sm:py-2
        text-xs font-semibold uppercase tracking-wider
        transition-all duration-200
        ${voted ? "cursor-default" : "cursor-pointer hover:scale-105 active:scale-95"}
        ${isPending ? "animate-pulse" : ""}
      `}
      style={{
        background: voted
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(255, 255, 255, 0.04)",
        color: voted ? "rgb(16, 185, 129)" : "var(--text-secondary)",
        border: voted
          ? "1px solid rgba(16, 185, 129, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.08)",
      }}
      title={voted ? "You voted for this tool" : "Upvote this tool"}
    >
      {/* Upvote Arrow */}
      <svg
        viewBox="0 0 24 24"
        fill={voted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`
          h-3 w-3 sm:h-3.5 sm:w-3.5
          transition-transform duration-200
          ${!voted && !isPending ? "group-hover:-translate-y-0.5" : ""}
        `}
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>

      {/* Vote Count and Label - only show count when > 0 */}
      {voteCount > 0 ? (
        <>
          <span className="tabular-nums">
            {formatVoteCount(voteCount)}
          </span>
          <span className="hidden sm:inline">
            {voteCount === 1 ? "Vote" : "Votes"}
          </span>
        </>
      ) : (
        <span className="hidden sm:inline">Upvote</span>
      )}
    </button>
  );
}
