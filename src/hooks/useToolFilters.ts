"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Tool, ToolCategory, ToolType, WorksWithTag } from "~/types/tool";
import { filterTools } from "~/lib/tools";
import { shouldUseAiSearch } from "~/lib/aiSearch";
import { useDebounce } from "./useDebounce";
import { trackSearch, trackCategoryFilter } from "~/lib/plausible";
import type { AISearchResult } from "~/app/api/search/route";
import type { ViewCounts } from "./useViewTracking";
import type { VoteCounts } from "./useVoting";

export type SortOption = "alphabetical" | "popular" | "newest" | "most-voted";

interface UseToolFiltersOptions {
  tools: Tool[];
  viewCounts?: ViewCounts;
  voteCounts?: VoteCounts;
  debounceMs?: number;
}

export type AIExplanations = Record<string, string>;
export type AIConfidenceScores = Record<string, number>;

interface UseToolFiltersReturn {
  // State
  query: string;
  selectedCategory: ToolCategory | null;
  selectedType: ToolType | null;
  selectedWorksWith: WorksWithTag[];
  sortBy: SortOption;

  // Derived — parallel result tracks
  keywordTools: Tool[];
  aiTools: Tool[];
  isFiltering: boolean;

  // AI Search
  isAiSearching: boolean;
  aiExplanations: AIExplanations;
  aiConfidenceScores: AIConfidenceScores;
  shouldRunAi: boolean;

  // Actions
  setQuery: (query: string) => void;
  setCategory: (category: ToolCategory | null) => void;
  setType: (type: ToolType | null) => void;
  setWorksWith: (tags: WorksWithTag[]) => void;
  toggleWorksWith: (tag: WorksWithTag) => void;
  setSortBy: (sortBy: SortOption) => void;
  clearFilters: () => void;
}

export function useToolFilters({
  tools,
  viewCounts = {},
  voteCounts = {},
  debounceMs = 300,
}: UseToolFiltersOptions): UseToolFiltersReturn {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<ToolType | null>(null);
  const [selectedWorksWith, setSelectedWorksWith] = useState<WorksWithTag[]>([]);
  const [sortBy, setSortByState] = useState<SortOption>("newest");

  // AI Search state
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<AIExplanations>({});
  const [aiConfidenceScores, setAiConfidenceScores] = useState<AIConfidenceScores>({});
  const [aiToolIds, setAiToolIds] = useState<string[] | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);
  const lastTrackedQuery = useRef<string>("");

  const shouldRunAi = shouldUseAiSearch(debouncedQuery);

  // AI Search effect
  useEffect(() => {
    if (!shouldRunAi) {
      setIsAiSearching(false);
      setAiExplanations({});
      setAiConfidenceScores({});
      setAiToolIds(null);
      return;
    }

    const controller = new AbortController();

    async function performAiSearch() {
      setIsAiSearching(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery }),
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

        if (lastTrackedQuery.current !== debouncedQuery) {
          trackSearch(debouncedQuery, "ai");
          lastTrackedQuery.current = debouncedQuery;
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
  }, [debouncedQuery, shouldRunAi]);

  // Keyword search tracking effect
  useEffect(() => {
    if (
      !shouldRunAi &&
      debouncedQuery.length > 0 &&
      lastTrackedQuery.current !== debouncedQuery
    ) {
      trackSearch(debouncedQuery, "keyword");
      lastTrackedQuery.current = debouncedQuery;
    }
  }, [debouncedQuery, shouldRunAi]);

  // Keyword-filtered tools — always populated, never gated on AI
  const keywordTools = useMemo(() => {
    let filtered = filterTools(tools, {
      query: debouncedQuery,
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
  }, [
    tools,
    debouncedQuery,
    selectedCategory,
    selectedType,
    selectedWorksWith,
    sortBy,
    viewCounts,
    voteCounts,
  ]);

  // AI-recommended tools — only populated when AI returned results
  const aiTools = useMemo(() => {
    if (!shouldRunAi || aiToolIds === null || aiToolIds.length === 0) {
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
  }, [
    tools,
    shouldRunAi,
    aiToolIds,
    aiConfidenceScores,
    selectedCategory,
    selectedType,
    selectedWorksWith,
    viewCounts,
  ]);

  const isFiltering = query !== debouncedQuery || isAiSearching;

  const setCategory = useCallback((category: ToolCategory | null) => {
    setSelectedCategory(category);
    if (category) {
      trackCategoryFilter(category);
    }
  }, []);

  const setType = useCallback((type: ToolType | null) => {
    setSelectedType(type);
  }, []);

  const setWorksWith = useCallback((tags: WorksWithTag[]) => {
    setSelectedWorksWith(tags);
  }, []);

  const toggleWorksWith = useCallback((tag: WorksWithTag) => {
    setSelectedWorksWith((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedType(null);
    setSelectedWorksWith([]);
    setAiExplanations({});
    setAiConfidenceScores({});
    setAiToolIds(null);
  }, []);

  return {
    query,
    selectedCategory,
    selectedType,
    selectedWorksWith,
    sortBy,
    keywordTools,
    aiTools,
    isFiltering,
    isAiSearching,
    aiExplanations,
    aiConfidenceScores,
    shouldRunAi,
    setQuery,
    setCategory,
    setType,
    setWorksWith,
    toggleWorksWith,
    setSortBy,
    clearFilters,
  };
}
