"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Tool } from "~/types/tool";
import { useUrlFilters } from "~/hooks/useUrlFilters";
import { useViewTracking } from "~/hooks/useViewTracking";
import { useVoting } from "~/hooks/useVoting";
import { useDebounce } from "~/hooks/useDebounce";
import { useAiSearch } from "~/hooks/useAiSearch";
import { filterTools } from "~/lib/tools";
import { CATEGORY_CONFIG } from "~/lib/constants";
import { AISearchSection } from "./AISearchSection";
import { FilterDrawer } from "./FilterSidebar";
import { ViewToggle } from "./ViewToggle";
import { ToolCard } from "./ToolCard";
import { ToolListItem } from "./ToolListItem";
import { LoadMoreButton } from "./LoadMoreButton";

const INITIAL_LOAD = 9;
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
  // Detect external URL changes (hero handoff, back/forward, deep links) during
  // render - before any effect runs - so the debounced writer below can't clobber
  // a freshly-set ?q= with its stale (empty) value before local state catches up.
  const prevSearchQueryRef = useRef(searchQuery);
  const skipNextUrlWrite = useRef(false);
  if (prevSearchQueryRef.current !== searchQuery) {
    prevSearchQueryRef.current = searchQuery;
    skipNextUrlWrite.current = true;
  }

  // Sync debounced local input -> URL (user typing in this input)
  useEffect(() => {
    if (skipNextUrlWrite.current) {
      skipNextUrlWrite.current = false;
      return;
    }
    if (
      debouncedSearchQuery === localSearchQuery &&
      debouncedSearchQuery !== searchQuery
    ) {
      setSearchQuery(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, localSearchQuery, searchQuery, setSearchQuery]);

  // Sync URL search -> local input (initial load, back/forward, hero handoff)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Mobile filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Use empty string if localSearchQuery is cleared (bypass debounce delay)
  const effectiveSearchQuery =
    localSearchQuery === "" ? "" : debouncedSearchQuery;

  // AI search (single source of truth, keyed on the effective query)
  const {
    isAiMode: effectiveIsAiMode,
    isAiSearching,
    aiExplanations,
    aiConfidenceScores,
    aiToolIds,
    aiError,
    retryAfterSeconds,
    retryAiSearch,
    clearAiSearch,
  } = useAiSearch(effectiveSearchQuery);

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
  const [pendingScrollRestore, setPendingScrollRestore] = useState<
    number | null
  >(() => {
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

  // Keyword-filtered list — always populated, never gated on AI
  const keywordTools = useMemo(() => {
    let filtered = filterTools(tools, {
      query: effectiveSearchQuery,
      category: selectedCategory,
      type: selectedType,
    });

    if (selectedWorksWith.length > 0) {
      filtered = filtered.filter((t) =>
        t.worksWith?.some((tag) => selectedWorksWith.includes(tag)),
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
        return (
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
      });
    } else {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [
    tools,
    effectiveSearchQuery,
    selectedCategory,
    selectedType,
    selectedWorksWith,
    sortBy,
    viewCounts,
    voteCounts,
  ]);

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
        t.worksWith?.some((tag) => selectedWorksWith.includes(tag)),
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
  }, [
    tools,
    effectiveIsAiMode,
    aiToolIds,
    aiConfidenceScores,
    selectedCategory,
    selectedType,
    selectedWorksWith,
    viewCounts,
  ]);

  // Dedupe: tools already shown in the AI section don't appear again in the keyword grid
  const aiIdSet = useMemo(() => new Set(aiTools.map((t) => t.id)), [aiTools]);
  const dedupedKeywordTools = useMemo(
    () => keywordTools.filter((t) => !aiIdSet.has(t.id)),
    [keywordTools, aiIdSet],
  );

  // Tools to display (with infinite scroll) — applies to keyword section only
  const displayedTools = useMemo(() => {
    return dedupedKeywordTools.slice(0, displayCount);
  }, [dedupedKeywordTools, displayCount]);

  // AI responded successfully but nothing survived (no matches, or all filtered out)
  const isAiEmptyResult =
    !isAiSearching &&
    aiError === null &&
    aiToolIds !== null &&
    aiTools.length === 0;
  // The empty note reads "keyword results below", so only show it when there
  // are keyword results; the full empty state covers the nothing-at-all case
  const showAiSection =
    effectiveIsAiMode &&
    (isAiSearching ||
      aiTools.length > 0 ||
      aiError !== null ||
      (isAiEmptyResult && dedupedKeywordTools.length > 0));
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
        Math.min(prev + LOAD_MORE_COUNT, dedupedKeywordTools.length),
      );
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, dedupedKeywordTools.length]);

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
    <section className="relative pb-16">
      <div className="container-main py-4 sm:py-6">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[22px] font-bold text-[var(--text-primary)]">
              {hasActiveFilters
                ? `${visibleResultCount} matching tools`
                : "Newest tools"}
            </h2>
            <p aria-live="polite" role="status" className="sr-only">
              {visibleResultCount} {visibleResultCount === 1 ? "tool" : "tools"}{" "}
              found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-[color:var(--border-accent)] hover:text-[var(--accent-primary)]"
              style={{
                background: hasActiveFilters ? "var(--accent-glow)" : "white",
                borderColor: hasActiveFilters
                  ? "var(--border-accent)"
                  : "var(--border-subtle)",
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
                aria-hidden="true"
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

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.currentTarget.value as typeof sortBy)
              }
              aria-label="Sort tools"
              className="cursor-pointer appearance-none rounded-full border border-[color:var(--border-subtle)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] focus-visible:border-[var(--accent-primary)]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="alphabetical">Sort: A–Z</option>
              <option value="popular">Sort: Popular</option>
              <option value="most-voted">Sort: Most voted</option>
            </select>

            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        <div>
          <div>
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
                  error={aiError}
                  retryAfterSeconds={retryAfterSeconds}
                  onRetry={retryAiSearch}
                  isEmptyResult={isAiEmptyResult}
                  aiExplanations={aiExplanations}
                  aiConfidenceScores={aiConfidenceScores}
                  viewMode={viewMode}
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
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {dedupedKeywordTools.length} match
                      {dedupedKeywordTools.length === 1 ? "" : "es"}
                    </span>
                  </div>
                )}

                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        border: color
          ? `1px solid ${color}30`
          : "1px solid rgba(255, 255, 255, 0.1)",
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
        aria-hidden="true"
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
          aria-hidden="true"
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
        <button onClick={onClearFilters} className="btn btn-secondary">
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
            aria-hidden="true"
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
