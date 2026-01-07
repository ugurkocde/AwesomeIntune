"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Tool, ToolCategory } from "~/types/tool";
import { useUrlFilters } from "~/hooks/useUrlFilters";
import { useViewTracking } from "~/hooks/useViewTracking";
import { useVoting } from "~/hooks/useVoting";
import { useDebounce } from "~/hooks/useDebounce";
import { filterTools } from "~/lib/tools";
import { CATEGORY_CONFIG } from "~/lib/constants";
import { trackSearch } from "~/lib/plausible";
import { SearchBar } from "./SearchBar";
import { SearchExamples } from "./SearchExamples";
import { SearchLoadingSkeleton } from "./SearchLoadingSkeleton";
import { FilterSidebar, FilterDrawer } from "./FilterSidebar";
import { ViewToggle } from "./ViewToggle";
import { ToolCard } from "./ToolCard";
import { ToolListItem } from "./ToolListItem";
import { LoadMoreButton } from "./InfiniteScrollTrigger";
import type { AISearchResult } from "~/app/api/search/route";

const INITIAL_LOAD = 18;
const LOAD_MORE_COUNT = 9;
const AI_SEARCH_THRESHOLD = 15;

type AIExplanations = Record<string, string>;
type AIConfidenceScores = Record<string, number>;

interface BrowseToolsSectionProps {
  tools: Tool[];
}

export function BrowseToolsSection({ tools }: BrowseToolsSectionProps) {
  const { viewCounts, recordView } = useViewTracking();
  const { voteCounts, hasVoted, isVotePending, vote } = useVoting();

  // URL-synced filter state
  const {
    selectedCategory,
    selectedType,
    sortBy,
    viewMode,
    searchQuery,
    setCategory,
    setType,
    setSortBy,
    setViewMode,
    setSearchQuery,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useUrlFilters();

  // Local search input state (for debouncing)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setSearchQuery(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchQuery, setSearchQuery]);

  // Sync URL search to local on initial load
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Mobile filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // AI Search state
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<AIExplanations>({});
  const [aiConfidenceScores, setAiConfidenceScores] = useState<AIConfidenceScores>({});
  const [aiToolIds, setAiToolIds] = useState<string[] | null>(null);
  const lastTrackedQuery = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine if we should use AI search (longer, sentence-like queries)
  const isAiMode = debouncedSearchQuery.length >= AI_SEARCH_THRESHOLD;

  // Clear AI search state immediately
  const clearAiSearch = useCallback(() => {
    // Abort any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAiSearching(false);
    setAiExplanations({});
    setAiConfidenceScores({});
    setAiToolIds(null);
  }, []);

  // AI Search effect
  useEffect(() => {
    if (!isAiMode || !debouncedSearchQuery) {
      clearAiSearch();
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function performAiSearch() {
      setIsAiSearching(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedSearchQuery }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("AI search failed");
        }

        const data = (await response.json()) as AISearchResult;

        const explanations: AIExplanations = {};
        const confidenceScores: AIConfidenceScores = {};
        const ids: string[] = [];

        for (const result of data.results) {
          explanations[result.toolId] = result.relevance;
          confidenceScores[result.toolId] = result.confidence;
          ids.push(result.toolId);
        }

        setAiExplanations(explanations);
        setAiConfidenceScores(confidenceScores);
        setAiToolIds(ids);
        if (lastTrackedQuery.current !== debouncedSearchQuery) {
          trackSearch(debouncedSearchQuery, "ai");
          lastTrackedQuery.current = debouncedSearchQuery;
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("AI search error:", error);
        // Fall back to regular search
        setAiExplanations({});
        setAiConfidenceScores({});
        setAiToolIds(null);
      } finally {
        setIsAiSearching(false);
      }
    }

    void performAiSearch();

    return () => controller.abort();
  }, [debouncedSearchQuery, isAiMode, clearAiSearch]);

  // Combined clear handler - immediately cancels AI search and clears all
  const handleClearAll = useCallback(() => {
    clearAiSearch();
    setLocalSearchQuery("");
    setSearchQuery("");
    setCategory(null);
    setType(null);
    setSortBy("alphabetical");
  }, [clearAiSearch, setSearchQuery, setCategory, setType, setSortBy]);

  // Clear just search (used when removing search filter pill)
  const handleClearSearch = useCallback(() => {
    clearAiSearch();
    setLocalSearchQuery("");
    setSearchQuery("");
  }, [clearAiSearch, setSearchQuery]);

  // Load more state
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(INITIAL_LOAD);
  }, [selectedCategory, selectedType, sortBy, debouncedSearchQuery, aiToolIds]);

  // Filter and sort tools
  // Use empty string if localSearchQuery is cleared (bypass debounce delay)
  const effectiveSearchQuery = localSearchQuery === "" ? "" : debouncedSearchQuery;
  const effectiveIsAiMode = effectiveSearchQuery.length >= AI_SEARCH_THRESHOLD;

  const filteredTools = useMemo(() => {
    // If AI search returned results, use those (filtered by category/type if set)
    if (effectiveIsAiMode && aiToolIds !== null) {
      let aiFiltered = tools.filter((t) => aiToolIds.includes(t.id));

      // Apply category/type filters on top of AI results
      if (selectedCategory) {
        aiFiltered = aiFiltered.filter((t) => t.category === selectedCategory);
      }
      if (selectedType) {
        aiFiltered = aiFiltered.filter((t) => t.type === selectedType);
      }

      // Sort by AI confidence, using popularity as tiebreaker
      return aiFiltered.sort((a, b) => {
        const confA = aiConfidenceScores[a.id] ?? 0;
        const confB = aiConfidenceScores[b.id] ?? 0;
        if (confA !== confB) return confB - confA;
        const viewsA = viewCounts[a.id] ?? 0;
        const viewsB = viewCounts[b.id] ?? 0;
        return viewsB - viewsA;
      });
    }

    // Regular keyword search
    let filtered = filterTools(tools, {
      query: effectiveSearchQuery,
      category: selectedCategory,
      type: selectedType,
    });

    // Sort
    if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => {
        const viewsA = viewCounts[a.id] ?? 0;
        const viewsB = viewCounts[b.id] ?? 0;
        return viewsB - viewsA;
      });
    } else if (sortBy === "most-voted") {
      filtered = [...filtered].sort((a, b) => {
        const votesA = voteCounts[a.id] ?? 0;
        const votesB = voteCounts[b.id] ?? 0;
        return votesB - votesA;
      });
    } else if (sortBy === "newest") {
      filtered = [...filtered].sort((a, b) => {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
    } else {
      // Alphabetical (default)
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [tools, effectiveSearchQuery, selectedCategory, selectedType, sortBy, viewCounts, voteCounts, effectiveIsAiMode, aiToolIds, aiConfidenceScores]);

  // Tools to display (with infinite scroll)
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, displayCount);
  }, [filteredTools, displayCount]);

  const hasMore = displayCount < filteredTools.length;

  // Load more handler
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    // Simulate a small delay for smoother UX
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredTools.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, filteredTools.length]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      category: key,
      label: config.label,
      color: config.color,
      count: tools.filter((t) => t.category === key).length,
    }));
    return stats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  }, [tools]);

  const filterProps = {
    tools,
    selectedCategory,
    selectedType,
    sortBy,
    onCategoryChange: setCategory,
    onTypeChange: setType,
    onSortChange: setSortBy,
    onClearAll: handleClearAll,
    hasActiveFilters,
  };

  return (
    <section className="relative min-h-screen">
      {/* Page Header */}
      <div className="border-b" style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Home
            </Link>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ color: "var(--text-secondary)" }}>All Tools</span>
          </nav>

          {/* Title and Stats */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Browse All Tools
              </h1>
              <p
                className="mt-2 text-base sm:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                Explore {tools.length} community tools for Microsoft Intune
              </p>
            </div>

            {/* Quick Category Stats */}
            <div className="flex flex-wrap gap-2">
              {categoryStats.slice(0, 4).map((stat) => (
                <button
                  key={stat.category}
                  onClick={() =>
                    setCategory(
                      selectedCategory === stat.category ? null : (stat.category as ToolCategory)
                    )
                  }
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background:
                      selectedCategory === stat.category
                        ? `${stat.color}20`
                        : "rgba(255, 255, 255, 0.05)",
                    border:
                      selectedCategory === stat.category
                        ? `1px solid ${stat.color}40`
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    color:
                      selectedCategory === stat.category
                        ? stat.color
                        : "var(--text-secondary)",
                  }}
                >
                  {stat.label}
                  <span
                    className="rounded-full px-1.5 py-0.5 text-xs"
                    style={{
                      background:
                        selectedCategory === stat.category
                          ? `${stat.color}30`
                          : "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {stat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search and Controls Bar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="max-w-md flex-1">
            <SearchBar
              value={localSearchQuery}
              onChange={setLocalSearchQuery}
              isAiSearching={isAiSearching}
              isAiMode={effectiveIsAiMode}
            />
            {/* AI Mode Hint */}
            <AnimatePresence>
              {!effectiveIsAiMode && localSearchQuery.length > 0 && localSearchQuery.length < 15 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Keep typing to enable AI-powered search
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 lg:hidden"
              style={{
                background: hasActiveFilters
                  ? "rgba(0, 212, 255, 0.1)"
                  : "rgba(255, 255, 255, 0.05)",
                border: hasActiveFilters
                  ? "1px solid rgba(0, 212, 255, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                color: hasActiveFilters
                  ? "var(--accent-primary)"
                  : "var(--text-secondary)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: "var(--accent-primary)",
                    color: "var(--bg-primary)",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            {/* Results Count */}
            <p
              className="hidden text-sm sm:block"
              style={{ color: "var(--text-tertiary)" }}
            >
              <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                {filteredTools.length}
              </span>{" "}
              {filteredTools.length === 1 ? "tool" : "tools"}
            </p>
          </div>
        </div>

        {/* Search Examples - Full width, left aligned */}
        <div className="mb-6">
          <AnimatePresence>
            {localSearchQuery.length === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <SearchExamples
                  isVisible={true}
                  onExampleClick={setLocalSearchQuery}
                  align="left"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Layout - Split scroll: sidebar fixed, content scrolls */}
        <div className="flex gap-8 lg:h-[calc(100vh-280px)]">
          {/* Desktop Sidebar - Fixed, doesn't scroll with content */}
          <div className="hidden flex-shrink-0 lg:block">
            <FilterSidebar {...filterProps} />
          </div>

          {/* Tools Display - Scrollable area */}
          <div className="min-w-0 flex-1 lg:overflow-y-auto lg:pr-2">
            {/* Active Filters Pills */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex flex-wrap items-center gap-2"
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Active filters:
                  </span>
                  {selectedCategory && (
                    <FilterPill
                      label={CATEGORY_CONFIG[selectedCategory].label}
                      color={CATEGORY_CONFIG[selectedCategory].color}
                      onRemove={() => setCategory(null)}
                    />
                  )}
                  {selectedType && (
                    <FilterPill
                      label={selectedType}
                      onRemove={() => setType(null)}
                    />
                  )}
                  {debouncedSearchQuery && (
                    <FilterPill
                      label={`"${debouncedSearchQuery}"`}
                      onRemove={handleClearSearch}
                    />
                  )}
                  <button
                    onClick={handleClearAll}
                    className="cursor-pointer text-xs font-medium transition-colors hover:text-[var(--accent-primary)]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Search Results Indicator */}
            <AnimatePresence>
              {effectiveIsAiMode && !isAiSearching && Object.keys(aiExplanations).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 flex items-center gap-2"
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

            {/* Loading State */}
            {isAiSearching ? (
              <SearchLoadingSkeleton />
            ) : filteredTools.length === 0 ? (
              <EmptyState
                searchQuery={debouncedSearchQuery}
                onClearFilters={handleClearAll}
              />
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" && (
                  <div
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                    }}
                  >
                    {displayedTools.map((tool, index) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        index={index}
                        viewCount={viewCounts[tool.id]}
                        onVisible={recordView}
                        voteCount={voteCounts[tool.id] ?? 0}
                        hasVoted={hasVoted(tool.id)}
                        isVotePending={isVotePending(tool.id)}
                        onVote={vote}
                        aiExplanation={aiExplanations[tool.id]}
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="space-y-3">
                    {displayedTools.map((tool, index) => (
                      <ToolListItem
                        key={tool.id}
                        tool={tool}
                        index={index}
                        viewCount={viewCounts[tool.id]}
                        onVisible={recordView}
                        voteCount={voteCounts[tool.id] ?? 0}
                        hasVoted={hasVoted(tool.id)}
                        isVotePending={isVotePending(tool.id)}
                        onVote={vote}
                      />
                    ))}
                  </div>
                )}

                {/* Load More Button */}
                <LoadMoreButton
                  onLoadMore={loadMore}
                  isLoading={isLoadingMore}
                  hasMore={hasMore}
                  shownCount={displayedTools.length}
                  totalCount={filteredTools.length}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        {...filterProps}
      />
    </section>
  );
}

interface FilterPillProps {
  label: string;
  color?: string;
  onRemove: () => void;
}

function FilterPill({ label, color, onRemove }: FilterPillProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onRemove}
      className="group flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      style={{
        background: color ? `${color}15` : "rgba(255, 255, 255, 0.05)",
        border: color ? `1px solid ${color}30` : "1px solid rgba(255, 255, 255, 0.1)",
        color: color ?? "var(--text-secondary)",
      }}
    >
      {label}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-60 transition-opacity group-hover:opacity-100"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </motion.button>
  );
}

interface EmptyStateProps {
  searchQuery: string;
  onClearFilters: () => void;
}

function EmptyState({ searchQuery, onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M8 11h6" />
        </svg>
      </div>
      <h3
        className="font-display text-xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        No tools found
      </h3>
      <p
        className="mt-2 max-w-md text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {searchQuery
          ? `No tools match "${searchQuery}". Try adjusting your search or filters.`
          : "Try adjusting your filters to find what you're looking for."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onClearFilters}
          className="btn btn-secondary"
        >
          Clear Filters
        </button>
        <Link href="/submit" className="btn btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Submit a Tool
        </Link>
      </div>
    </motion.div>
  );
}
