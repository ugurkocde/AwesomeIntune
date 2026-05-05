"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "~/types/tool";
import { useToolFilters } from "~/hooks/useToolFilters";
import { useViewTracking } from "~/hooks/useViewTracking";
import { useVoting } from "~/hooks/useVoting";
import { SearchBar } from "./SearchBar";
import { SearchExamples } from "./SearchExamples";
import { FilterBar } from "./FilterBar";
import { ToolGrid } from "./ToolGrid";
import { AISearchSection } from "./AISearchSection";
import { TextReveal } from "../TextReveal";

interface ToolsSectionProps {
  tools: Tool[];
}

export function ToolsSection({ tools }: ToolsSectionProps) {
  const { viewCounts, recordView } = useViewTracking();
  const { voteCounts, hasVoted, isVotePending, vote } = useVoting();

  const {
    query,
    selectedCategory,
    selectedType,
    sortBy,
    keywordTools,
    aiTools,
    isAiSearching,
    aiExplanations,
    aiConfidenceScores,
    shouldRunAi,
    setQuery,
    setCategory,
    setType,
    setSortBy,
  } = useToolFilters({ tools, viewCounts, voteCounts });

  // Dedupe: tools shown in the AI section should not appear again in the keyword grid
  const aiIdSet = useMemo(() => new Set(aiTools.map((t) => t.id)), [aiTools]);
  const dedupedKeywordTools = useMemo(
    () => keywordTools.filter((t) => !aiIdSet.has(t.id)),
    [keywordTools, aiIdSet]
  );

  const showAiSection = shouldRunAi && (isAiSearching || aiTools.length > 0);
  const visibleResultCount = aiTools.length + dedupedKeywordTools.length;

  // Unified empty state — only when both sections are genuinely empty
  const showEmptyState =
    !isAiSearching &&
    aiTools.length === 0 &&
    dedupedKeywordTools.length === 0;

  return (
    <section id="tools" className="relative scroll-mt-24 py-24 md:py-32">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, var(--bg-secondary) 20%, var(--bg-secondary) 80%, transparent 100%)",
        }}
      />

      <div className="container-main relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--accent-primary)" }}
          >
            Explore the Collection
          </motion.span>

          <h2 className="font-display text-4xl font-bold md:text-5xl lg:text-6xl">
            <TextReveal className="text-gradient">Community Tools</TextReveal>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover powerful tools built by the Intune community. Describe your
            problem or search by keyword to find exactly what you need.
          </motion.p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl"
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            isAiSearching={isAiSearching}
            isAiMode={shouldRunAi}
          />

          <SearchExamples
            isVisible={query.length === 0}
            onExampleClick={setQuery}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-12 overflow-hidden rounded-2xl"
          style={{
            background: "rgba(17, 25, 34, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="p-6 md:p-8">
            <FilterBar
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              sortBy={sortBy}
              onCategoryChange={setCategory}
              onTypeChange={setType}
              onSortChange={setSortBy}
              resultCount={visibleResultCount}
              totalCount={tools.length}
              isAiSearching={isAiSearching}
            />
          </div>
        </motion.div>

        {/* AI Suggestions Section — parallel to keyword grid */}
        <AnimatePresence>
          {showAiSection && (
            <AISearchSection
              key="ai-section"
              tools={aiTools}
              isLoading={isAiSearching}
              aiExplanations={aiExplanations}
              aiConfidenceScores={aiConfidenceScores}
              viewCounts={viewCounts}
              onToolVisible={recordView}
              voteCounts={voteCounts}
              hasVoted={hasVoted}
              isVotePending={isVotePending}
              onVote={vote}
            />
          )}
        </AnimatePresence>

        {/* Keyword Section */}
        <div className="min-h-[400px]">
          {showAiSection && dedupedKeywordTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-5 flex items-center gap-3"
            >
              <h3
                className="font-display text-base font-semibold tracking-tight"
                style={{ color: "var(--text-secondary)" }}
              >
                More matching tools
              </h3>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {dedupedKeywordTools.length} match
                {dedupedKeywordTools.length === 1 ? "" : "es"}
              </span>
            </motion.div>
          )}

          <ToolGrid
            tools={dedupedKeywordTools}
            aiExplanations={aiExplanations}
            aiConfidenceScores={aiConfidenceScores}
            viewCounts={viewCounts}
            onToolVisible={recordView}
            voteCounts={voteCounts}
            hasVoted={hasVoted}
            isVotePending={isVotePending}
            onVote={vote}
            hideEmptyState={!showEmptyState}
          />
        </div>
      </div>
    </section>
  );
}
