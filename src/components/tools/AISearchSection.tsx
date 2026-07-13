"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Tool } from "~/types/tool";
import { ToolCard } from "./ToolCard";
import { ToolListItem } from "./ToolListItem";
import type {
  AIExplanations,
  AIConfidenceScores,
  AISearchError,
} from "~/hooks/useAiSearch";
import type { ViewCounts } from "~/hooks/useViewTracking";
import type { VoteCounts } from "~/hooks/useVoting";
import type { ViewMode } from "~/hooks/useUrlFilters";

const AI_SEARCH_STAGES = [
  "Analyzing your query…",
  "Understanding search intent…",
  "Scanning tool database…",
  "Finding relevant matches…",
];

interface AISearchSectionProps {
  tools: Tool[];
  isLoading: boolean;
  /** Why the AI request failed, or null when it succeeded or is pending */
  error?: AISearchError | null;
  /** Seconds until a rate-limited request may be retried */
  retryAfterSeconds?: number | null;
  /** Re-fires the AI request for the current query */
  onRetry?: () => void;
  /** True when AI responded successfully but returned no matches */
  isEmptyResult?: boolean;
  aiExplanations: AIExplanations;
  aiConfidenceScores: AIConfidenceScores;
  viewMode?: ViewMode;
  viewCounts?: ViewCounts;
  onToolVisible?: (toolId: string) => void;
  voteCounts?: VoteCounts;
  hasVoted?: (toolId: string) => boolean;
  isVotePending?: (toolId: string) => boolean;
  onVote?: (toolId: string) => Promise<boolean>;
  onBeforeNavigate?: () => void;
}

function SkeletonCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[color:var(--border-subtle)]"
      style={{
        background: "var(--bg-secondary)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="relative p-6">
        <div className="mb-4">
          <div className="h-6 w-24 animate-pulse rounded-md" style={{ background: "var(--bg-elevated)" }} />
        </div>
        <div className="h-5 w-3/4 animate-pulse rounded-md" style={{ background: "var(--bg-elevated)" }} />
        <div className="mt-3 space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded" style={{ background: "var(--bg-tertiary)" }} />
          <div className="h-3.5 w-5/6 animate-pulse rounded" style={{ background: "var(--bg-tertiary)" }} />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-7 w-7 animate-pulse rounded-full" style={{ background: "var(--bg-elevated)" }} />
          <div className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-2.5 w-14 animate-pulse rounded" style={{ background: "var(--bg-tertiary)" }} />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="h-9 flex-1 animate-pulse rounded-xl" style={{ background: "var(--bg-tertiary)" }} />
          <div className="h-9 flex-1 animate-pulse rounded-xl" style={{ background: "var(--bg-tertiary)" }} />
        </div>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function Spinner() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={prefersReducedMotion ? undefined : { rotate: 360 }}
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: 1.2, repeat: Infinity, ease: "linear" }
      }
      style={{ color: "var(--accent-primary)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </motion.div>
  );
}

function LoadingProgress() {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const next = () => {
      const delay = 3500 + Math.random() * 1000;
      timeout = setTimeout(() => {
        setStage((prev) => {
          if (prev >= AI_SEARCH_STAGES.length - 1) return prev;
          next();
          return prev + 1;
        });
      }, delay);
    };
    next();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {AI_SEARCH_STAGES[stage]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {AI_SEARCH_STAGES.map((_, index) => (
          <motion.div
            key={index}
            className="h-1.5 w-1.5 rounded-full"
            animate={{
              scale: prefersReducedMotion ? 1 : index === stage ? 1.3 : 1,
              backgroundColor:
                index === stage
                  ? "var(--accent-primary)"
                  : index < stage
                    ? "var(--text-tertiary)"
                    : "var(--border-medium)",
            }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          />
        ))}
      </div>

      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {elapsed}s elapsed
      </span>
    </div>
  );
}

function RetryButton({
  retryAfterSeconds,
  onRetry,
}: {
  retryAfterSeconds: number | null;
  onRetry: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(retryAfterSeconds ?? 0);

  useEffect(() => {
    setSecondsLeft(retryAfterSeconds ?? 0);
    if (!retryAfterSeconds) return;
    const tick = setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [retryAfterSeconds]);

  const isWaiting = secondsLeft > 0;

  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={isWaiting}
      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-medium)",
        color: "var(--text-primary)",
      }}
    >
      {isWaiting ? `Retry in ${secondsLeft}s` : "Retry"}
    </button>
  );
}

export function AISearchSection({
  tools,
  isLoading,
  error = null,
  retryAfterSeconds = null,
  onRetry,
  isEmptyResult = false,
  aiExplanations,
  aiConfidenceScores,
  viewMode = "grid",
  viewCounts,
  onToolVisible,
  voteCounts,
  hasVoted,
  isVotePending,
  onVote,
  onBeforeNavigate,
}: AISearchSectionProps) {
  const showEmptyNote =
    !isLoading && !error && isEmptyResult && tools.length === 0;

  if (!isLoading && !error && !showEmptyNote && tools.length === 0) return null;

  if (showEmptyNote) {
    return (
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
        aria-label="AI suggestions"
      >
        <p
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <SparkleIcon />
          No AI suggestions for this query - keyword results below
        </p>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
        aria-label="AI suggestions"
      >
        <div className="mb-5 flex items-center gap-2">
          <SparkleIcon />
          <h3
            className="font-display text-base font-semibold tracking-tight"
            style={{ color: "var(--accent-primary)" }}
          >
            Suggested by AI
          </h3>
        </div>
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {error === "rate-limited"
              ? "AI search is busy - try again in a moment"
              : "AI search is temporarily unavailable - showing keyword matches below"}
          </p>
          {onRetry && (
            <RetryButton
              retryAfterSeconds={error === "rate-limited" ? retryAfterSeconds : null}
              onRetry={onRetry}
            />
          )}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="mb-12"
      aria-label="AI suggestions"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <h3
            className="font-display text-base font-semibold tracking-tight"
            style={{ color: "var(--accent-primary)" }}
          >
            Suggested by AI
          </h3>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {tools.length} match{tools.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {isLoading ? (
        <>
          <LoadingProgress />
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}
          >
            {[0, 1, 2].map((index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {tools.map((tool, index) => (
            <ToolListItem
              key={tool.id}
              tool={tool}
              index={index}
              aiExplanation={aiExplanations[tool.id]}
              confidenceScore={aiConfidenceScores[tool.id]}
              viewCount={viewCounts?.[tool.id]}
              onVisible={onToolVisible}
              voteCount={voteCounts?.[tool.id] ?? 0}
              hasVoted={hasVoted?.(tool.id) ?? false}
              isVotePending={isVotePending?.(tool.id) ?? false}
              onVote={onVote}
              onBeforeNavigate={onBeforeNavigate}
            />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}
        >
          {tools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={index}
              aiExplanation={aiExplanations[tool.id]}
              confidenceScore={aiConfidenceScores[tool.id]}
              viewCount={viewCounts?.[tool.id]}
              onVisible={onToolVisible}
              voteCount={voteCounts?.[tool.id] ?? 0}
              hasVoted={hasVoted?.(tool.id) ?? false}
              isVotePending={isVotePending?.(tool.id) ?? false}
              onVote={onVote}
              onBeforeNavigate={onBeforeNavigate}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}
