"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Tool } from "~/types/tool";
import { useToolFilters } from "~/hooks/useToolFilters";
import { useViewTracking } from "~/hooks/useViewTracking";
import { SearchBar } from "./SearchBar";
import { SearchExamples } from "./SearchExamples";
import { FilterBar } from "./FilterBar";
import { ToolGrid } from "./ToolGrid";
import { SearchLoadingSkeleton } from "./SearchLoadingSkeleton";
import { TextReveal } from "../TextReveal";

interface ToolsSectionProps {
  tools: Tool[];
}

export function ToolsSection({ tools }: ToolsSectionProps) {
  const { viewCounts, recordView } = useViewTracking();

  const {
    query,
    selectedCategory,
    selectedType,
    sortBy,
    filteredTools,
    isAiSearching,
    aiExplanations,
    aiConfidenceScores,
    isAiMode,
    setQuery,
    setCategory,
    setType,
    setSortBy,
  } = useToolFilters({ tools, viewCounts });

  return (
    <section id="tools" className="relative scroll-mt-24 py-24 md:py-32">
      {/* Section Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, var(--bg-secondary) 20%, var(--bg-secondary) 80%, transparent 100%)",
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
            <TextReveal className="text-gradient">
              Community Tools
            </TextReveal>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover powerful tools built by the Intune community. Describe your problem
            or search by keyword to find exactly what you need.
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
            isAiMode={isAiMode}
          />

          {/* Example queries - shown when search is empty */}
          <SearchExamples
            isVisible={query.length === 0}
            onExampleClick={setQuery}
          />

          {/* AI Mode Hint - shown when typing but not yet in AI mode */}
          <AnimatePresence>
            {!isAiMode && query.length > 0 && query.length < 15 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-center text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                Keep typing to enable AI-powered search
              </motion.p>
            )}
          </AnimatePresence>
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
              resultCount={filteredTools.length}
              totalCount={tools.length}
              isAiSearching={isAiSearching}
            />
          </div>
        </motion.div>

        {/* AI Search Results Indicator */}
        <AnimatePresence>
          {isAiMode && !isAiSearching && Object.keys(aiExplanations).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center justify-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
              </svg>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--accent-primary)" }}
              >
                AI-powered results
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tools Grid or Loading Skeleton */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {isAiSearching ? (
              <SearchLoadingSkeleton key="skeleton" />
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ToolGrid
                  tools={filteredTools}
                  aiExplanations={aiExplanations}
                  aiConfidenceScores={aiConfidenceScores}
                  viewCounts={viewCounts}
                  onToolVisible={recordView}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
