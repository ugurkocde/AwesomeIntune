"use client";

import { memo, useEffect, useRef, useState } from "react";
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
  const [showError, setShowError] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPending) return;
    setShowError(false);
    const success = await onVote(requestId);
    if (!success) {
      setShowError(true);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => setShowError(false), 4000);
    }
  };

  return (
    <span className="relative inline-flex">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`
          group/vote inline-flex items-center justify-center gap-1.5
          rounded-lg font-medium transition-all duration-200
          min-h-[36px] px-3 py-2 text-sm
          cursor-pointer hover:scale-105 active:scale-95
          ${isPending ? "animate-pulse" : ""}
        `}
        style={{
          background: hasVoted
            ? "color-mix(in srgb, var(--signal-success) 15%, transparent)"
            : "var(--bg-tertiary)",
          color: hasVoted ? "var(--signal-success)" : "var(--text-secondary)",
          border: hasVoted
            ? "1px solid color-mix(in srgb, var(--signal-success) 30%, transparent)"
            : "1px solid var(--border-subtle)",
        }}
        title={
          hasVoted ? "Click to remove your vote" : "Vote for this idea"
        }
        aria-pressed={hasVoted}
        aria-label={
          hasVoted
            ? `Remove your vote for this idea. ${voteCount} votes.`
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
          aria-hidden="true"
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
      {showError && (
        <span
          role="status"
          className="absolute left-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-medium)",
            color: "var(--signal-warning)",
          }}
        >
          Could not record your vote - try again
        </span>
      )}
    </span>
  );
});
