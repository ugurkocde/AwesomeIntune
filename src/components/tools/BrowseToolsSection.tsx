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
import { shouldUseAiSearch } from "~/lib/aiSearch";
import { trackSearch } from "~/lib/plausible";
import { SearchBar } from "./SearchBar";
import { SearchExamples } from "./SearchExamples";
import { AISearchSection } from "./AISearchSection";
import { FilterSidebar, FilterDrawer } from "./FilterSidebar";
import { ViewToggle } from "./ViewToggle";
import { ToolCard } from "./ToolCard";
import { ToolListItem } from "./ToolListItem";
import { LoadMoreButton } from "./InfiniteScrollTrigger";
import type { AISearchResult } from "~/app/api/search/route";

const INITIAL_LOAD = 18;
const LOAD_MORE_COUNT = 9;
const SCROLL_STATE_KEY = "tools-list-scroll-state";

interface ScrollState {
  scrollPosition: number;
  displayCount: number;
}

function saveScrollState(state: ScrollState) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SCROLL_STATE_KEY, JSON.stringify(state));
  }
}

function getScrollState(): ScrollState | null {
  if (typeof window === "undefined") return null;

  const saved = sessionStorage.getItem(SCROLL_STATE_KEY);
  if (saved) {
    sessionStorage.removeItem(SCROLL_STATE_KEY);
    try {
      return JSON.parse(saved) as ScrollState;
    } catch {
      return null;
    }
  }
  return null;
}

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
    selectedWorksWith,
    sortBy,
    viewMode,
    searchQuery,
    setCategory,
    setType,
    toggleWorksWith,
    setSortBy,
    setViewMode,
    setSearchQuery,
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

  // Determine if we should use AI search (multi-word, sentence-like queries)
  const isAiMode = shouldUseAiSearch(debouncedSearchQuery);

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

        if (controller.signal.aborted) return;

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
        setIsAiSearching(false);

        if (lastTrackedQuery.current !== debouncedSearchQuery) {
          trackSearch(debouncedSearchQuery, "ai");
          lastTrackedQuery.current = debouncedSearchQuery;
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        if (controller.signal.aborted) return;
        console.error("AI search error:", error);
        setAiExplanations({});
        setAiConfidenceScores({});
        setAiToolIds(null);
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
    setSortBy("newest");
  }, [clearAiSearch, setSearchQuery, setCategory, setType, setSortBy]);

  // Clear just search (used when removing search filter pill)
  const handleClearSearch = useCallback(() => {
    clearAiSearch();
    setLocalSearchQuery("");
    setSearchQuery("");
  }, [clearAiSearch, setSearchQuery]);

  // Load more state - initialize from saved state if available
  const savedScrollState = useRef<ScrollState | null>(null);
  const [displayCount, setDisplayCount] = useState(() => {
    // Only read once during initialization
    if (savedScrollState.current === null && typeof window !== "undefined") {
      savedScrollState.current = getScrollState();
    }
    return savedScrollState.current?.displayCount ?? INITIAL_LOAD;
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pendingScrollRestore, setPendingScrollRestore] = useState<number | null>(() => {
    return savedScrollState.current?.scrollPosition ?? null;
  });

  // Callback to save scroll state before navigating to a tool
  const handleBeforeNavigate = useCallback(() => {
    saveScrollState({
      scrollPosition: window.scrollY,
      displayCount,
    });
  }, [displayCount]);

  // Reset display count when filters change (but not on initial load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setDisplayCount(INITIAL_LOAD);
  }, [selectedCategory, selectedType, sortBy, debouncedSearchQuery, aiToolIds]);

  // Use empty string if localSearchQuery is cleared (bypass debounce delay)
  const effectiveSearchQuery = localSearchQuery === "" ? "" : debouncedSearchQuery;
  const effectiveIsAiMode = shouldUseAiSearch(effectiveSearchQuery);

  // Keyword-filtered list — always populated, never gated on AI
  const keywordTools = useMemo(() => {
    let filtered = filterTools(tools, {
      query: effectiveSearchQuery,
      category: selectedCategory,
      type: selectedType,
    });

    if (selectedWorksWith.length > 0) {
      filtered = filtered.filter((t) =>
        t.worksWith?.some((tag) => selectedWorksWith.includes(tag))
      );
    }

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
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [tools, effectiveSearchQuery, selectedCategory, selectedType, selectedWorksWith, sortBy, viewCounts, voteCounts]);

  // AI-recommended tools — only populated when AI returned results
  const aiTools = useMemo(() => {
    if (!effectiveIsAiMode || aiToolIds === null || aiToolIds.length === 0) {
      return [];
    }

    let aiFiltered = tools.filter((t) => aiToolIds.includes(t.id));

    if (selectedCategory) {
      aiFiltered = aiFiltered.filter((t) => t.category === selectedCategory);
    }
    if (selectedType) {
      aiFiltered = aiFiltered.filter((t) => t.type === selectedType);
    }
    if (selectedWorksWith.length > 0) {
      aiFiltered = aiFiltered.filter((t) =>
        t.worksWith?.some((tag) => selectedWorksWith.includes(tag))
      );
    }

    return aiFiltered.sort((a, b) => {
      const confA = aiConfidenceScores[a.id] ?? 0;
      const confB = aiConfidenceScores[b.id] ?? 0;
      if (confA !== confB) return confB - confA;
      const viewsA = viewCounts[a.id] ?? 0;
      const viewsB = viewCounts[b.id] ?? 0;
      return viewsB - viewsA;
    });
  }, [tools, effectiveIsAiMode, aiToolIds, aiConfidenceScores, selectedCategory, selectedType, selectedWorksWith, viewCounts]);

  // Dedupe: tools already shown in the AI section don't appear again in the keyword grid
  const aiIdSet = useMemo(() => new Set(aiTools.map((t) => t.id)), [aiTools]);
  const dedupedKeywordTools = useMemo(
    () => keywordTools.filter((t) => !aiIdSet.has(t.id)),
    [keywordTools, aiIdSet]
  );

  // Tools to display (with infinite scroll) — applies to keyword section only
  const displayedTools = useMemo(() => {
    return dedupedKeywordTools.slice(0, displayCount);
  }, [dedupedKeywordTools, displayCount]);

  const showAiSection = effectiveIsAiMode && (isAiSearching || aiTools.length > 0);
  const visibleResultCount = aiTools.length + dedupedKeywordTools.length;
  const showEmptyState =
    !isAiSearching && aiTools.length === 0 && dedupedKeywordTools.length === 0;

  // Restore scroll position after content has rendered
  useEffect(() => {
    if (pendingScrollRestore !== null && displayedTools.length > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        window.scrollTo(0, pendingScrollRestore);
        setPendingScrollRestore(null);
      });
    }
  }, [pendingScrollRestore, displayedTools.length]);

  const hasMore = displayCount < dedupedKeywordTools.length;

  // Load more handler
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) =>
        Math.min(prev + LOAD_MORE_COUNT, dedupedKeywordTools.length)
      );
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, dedupedKeywordTools.length]);

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
    selectedWorksWith,
    sortBy,
    onCategoryChange: setCategory,
    onTypeChange: setType,
    onWorksWithToggle: toggleWorksWith,
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
              {!effectiveIsAiMode && localSearchQuery.trim().length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Try a multi-word question to get AI suggestions
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
                {visibleResultCount}
              </span>{" "}
              {visibleResultCount === 1 ? "tool" : "tools"}
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

            {/* AI Suggestions Section — runs in parallel with keyword grid */}
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
                  onBeforeNavigate={handleBeforeNavigate}
                />
              )}
            </AnimatePresence>

            {/* Keyword Section */}
            {showEmptyState ? (
              <EmptyState
                searchQuery={debouncedSearchQuery}
                onClearFilters={handleClearAll}
              />
            ) : dedupedKeywordTools.length > 0 ? (
              <>
                {showAiSection && (
                  <div className="mb-5 flex items-center gap-3">
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
                  </div>
                )}

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
                        onBeforeNavigate={handleBeforeNavigate}
                      />
                    ))}
                  </div>
                )}

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
                        onBeforeNavigate={handleBeforeNavigate}
                      />
                    ))}
                  </div>
                )}

                <LoadMoreButton
                  onLoadMore={loadMore}
                  isLoading={isLoadingMore}
                  hasMore={hasMore}
                  shownCount={displayedTools.length}
                  totalCount={dedupedKeywordTools.length}
                />
              </>
            ) : null}
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
