"use client";

import { motion } from "framer-motion";
import type { Tool } from "~/types/tool";
import { ToolCard } from "./ToolCard";
import type { AIExplanations, AIConfidenceScores } from "~/hooks/useToolFilters";
import type { ViewCounts } from "~/hooks/useViewTracking";
import type { VoteCounts } from "~/hooks/useVoting";

interface AISearchSectionProps {
  tools: Tool[];
  isLoading: boolean;
  aiExplanations: AIExplanations;
  aiConfidenceScores: AIConfidenceScores;
  viewCounts?: ViewCounts;
  onToolVisible?: (toolId: string) => void;
  voteCounts?: VoteCounts;
  hasVoted?: (toolId: string) => boolean;
  isVotePending?: (toolId: string) => boolean;
  onVote?: (toolId: string) => Promise<boolean>;
  onBeforeNavigate?: () => void;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(17, 25, 34, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 0.8 }}
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div className="relative p-6">
        <div className="mb-4">
          <div className="h-6 w-24 rounded-md" style={{ background: "rgba(255, 255, 255, 0.04)" }} />
        </div>
        <div className="h-5 w-3/4 rounded-md" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
        <div className="mt-3 space-y-2">
          <div className="h-3.5 w-full rounded" style={{ background: "rgba(255, 255, 255, 0.03)" }} />
          <div className="h-3.5 w-5/6 rounded" style={{ background: "rgba(255, 255, 255, 0.03)" }} />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-7 w-7 rounded-full" style={{ background: "rgba(255, 255, 255, 0.05)" }} />
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded" style={{ background: "rgba(255, 255, 255, 0.04)" }} />
            <div className="h-2.5 w-14 rounded" style={{ background: "rgba(255, 255, 255, 0.03)" }} />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
          <div className="h-9 flex-1 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.03)" }} />
          <div className="h-9 flex-1 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.03)" }} />
        </div>
      </div>
    </motion.div>
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
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      style={{ color: "var(--accent-primary)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </motion.div>
  );
}

export function AISearchSection({
  tools,
  isLoading,
  aiExplanations,
  aiConfidenceScores,
  viewCounts,
  onToolVisible,
  voteCounts,
  hasVoted,
  isVotePending,
  onVote,
  onBeforeNavigate,
}: AISearchSectionProps) {
  if (!isLoading && tools.length === 0) return null;

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
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
        >
          {[0, 1, 2].map((index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}
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
