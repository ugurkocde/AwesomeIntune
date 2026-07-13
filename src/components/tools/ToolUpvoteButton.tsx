"use client";

import { useEffect, useRef, useState } from "react";
import { useVoting, formatVoteCount } from "~/hooks/useVoting";

interface ToolUpvoteButtonProps {
  toolId: string;
  toolName: string;
}

export function ToolUpvoteButton({ toolId, toolName }: ToolUpvoteButtonProps) {
  const { voteCounts, hasVoted, isVotePending, vote } = useVoting();
  const [showError, setShowError] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const voteCount = voteCounts[toolId] ?? 0;
  const voted = hasVoted(toolId);
  const isPending = isVotePending(toolId);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    if (isPending) return;
    setShowError(false);
    const success = await vote(toolId);
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
        aria-label={
          voted ? `Remove upvote for ${toolName}` : `Upvote ${toolName}`
        }
        aria-pressed={voted}
        className={`
          group inline-flex items-center gap-1.5 sm:gap-2 rounded-lg
          px-3 py-1.5 sm:px-4 sm:py-2
          text-xs font-semibold uppercase tracking-wider
          transition-all duration-200 cursor-pointer
          hover:scale-105 active:scale-95
          ${isPending ? "animate-pulse" : ""}
        `}
        style={{
          background: voted
            ? "color-mix(in srgb, var(--signal-success) 15%, transparent)"
            : "var(--bg-tertiary)",
          color: voted ? "var(--signal-success)" : "var(--text-secondary)",
          border: voted
            ? "1px solid color-mix(in srgb, var(--signal-success) 30%, transparent)"
            : "1px solid var(--border-subtle)",
        }}
        title={
          voted ? "Click to remove your vote" : "Upvote this tool"
        }
      >
        {/* Upvote Arrow */}
        <svg
          viewBox="0 0 24 24"
          fill={voted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
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
}
