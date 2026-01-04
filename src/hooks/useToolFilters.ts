"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Tool, ToolCategory, ToolType } from "~/types/tool";
import { filterTools } from "~/lib/tools";
import { useDebounce } from "./useDebounce";
import type { AISearchResult } from "~/app/api/search/route";

interface UseToolFiltersOptions {
  tools: Tool[];
  debounceMs?: number;
}

export type AIExplanations = Record<string, string>;
export type AIConfidenceScores = Record<string, number>;

interface UseToolFiltersReturn {
  // State
  query: string;
  selectedCategory: ToolCategory | null;
  selectedType: ToolType | null;

  // Derived
  filteredTools: Tool[];
  isFiltering: boolean;

  // AI Search
  isAiSearching: boolean;
  aiExplanations: AIExplanations;
  aiConfidenceScores: AIConfidenceScores;
  isAiMode: boolean;

  // Actions
  setQuery: (query: string) => void;
  setCategory: (category: ToolCategory | null) => void;
  setType: (type: ToolType | null) => void;
  clearFilters: () => void;
}

const AI_SEARCH_THRESHOLD = 15;

export function useToolFilters({
  tools,
  debounceMs = 300,
}: UseToolFiltersOptions): UseToolFiltersReturn {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<ToolType | null>(null);

  // AI Search state
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<AIExplanations>({});
  const [aiConfidenceScores, setAiConfidenceScores] = useState<AIConfidenceScores>({});
  const [aiToolIds, setAiToolIds] = useState<string[] | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Determine if we should use AI search (longer, sentence-like queries)
  const isAiMode = debouncedQuery.length >= AI_SEARCH_THRESHOLD;

  // AI Search effect
  useEffect(() => {
    if (!isAiMode || !debouncedQuery) {
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
  }, [debouncedQuery, isAiMode]);

  const filteredTools = useMemo(() => {
    // If AI search returned results, use those (filtered by category/type if set)
    if (isAiMode && aiToolIds !== null) {
      let aiFiltered = tools.filter((t) => aiToolIds.includes(t.id));

      // Apply category/type filters on top of AI results
      if (selectedCategory) {
        aiFiltered = aiFiltered.filter((t) => t.category === selectedCategory);
      }
      if (selectedType) {
        aiFiltered = aiFiltered.filter((t) => t.type === selectedType);
      }

      // Maintain AI relevance order
      return aiFiltered.sort(
        (a, b) => aiToolIds.indexOf(a.id) - aiToolIds.indexOf(b.id)
      );
    }

    // Regular keyword search
    return filterTools(tools, {
      query: debouncedQuery,
      category: selectedCategory,
      type: selectedType,
    });
  }, [
    tools,
    debouncedQuery,
    selectedCategory,
    selectedType,
    isAiMode,
    aiToolIds,
  ]);

  const isFiltering = query !== debouncedQuery || isAiSearching;

  const setCategory = useCallback((category: ToolCategory | null) => {
    setSelectedCategory(category);
  }, []);

  const setType = useCallback((type: ToolType | null) => {
    setSelectedType(type);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedType(null);
    setAiExplanations({});
    setAiConfidenceScores({});
    setAiToolIds(null);
  }, []);

  return {
    query,
    selectedCategory,
    selectedType,
    filteredTools,
    isFiltering,
    isAiSearching,
    aiExplanations,
    aiConfidenceScores,
    isAiMode,
    setQuery,
    setCategory,
    setType,
    clearFilters,
  };
}
