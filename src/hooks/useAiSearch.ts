"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { shouldUseAiSearch } from "~/lib/aiSearch";
import { trackSearch } from "~/lib/plausible";
import type { AISearchResult } from "~/app/api/search/route";

export type AIExplanations = Record<string, string>;
export type AIConfidenceScores = Record<string, number>;
export type AISearchError = "unavailable" | "rate-limited";

interface UseAiSearchReturn {
  /** Whether the query is sentence-like enough to trigger AI search */
  isAiMode: boolean;
  isAiSearching: boolean;
  aiExplanations: AIExplanations;
  aiConfidenceScores: AIConfidenceScores;
  /** Tool IDs returned by AI, in relevance order, or null when AI is inactive */
  aiToolIds: string[] | null;
  /** Why the last AI request failed, or null when it succeeded or never ran */
  aiError: AISearchError | null;
  /** Seconds to wait before retrying, from a 429 Retry-After header */
  retryAfterSeconds: number | null;
  /** Re-fire the AI request for the current query */
  retryAiSearch: () => void;
  /** Cancel any in-flight request and reset AI results */
  clearAiSearch: () => void;
}

/**
 * Runs AI-assisted search for a (already-debounced) query.
 *
 * The query should be the "effective" search string the user sees results for —
 * pass an empty string to immediately stand the AI section down. AI only fires
 * when `shouldUseAiSearch` returns true; otherwise results stay empty.
 *
 * Failures are surfaced instead of swallowed: `aiError` distinguishes a
 * rate-limited request (429, with `retryAfterSeconds` when the server sent
 * Retry-After) from a generic failure, and `retryAiSearch` re-fires the same
 * query.
 *
 * Single source of truth for the AI search flow used by the tool directory.
 */
export function useAiSearch(query: string): UseAiSearchReturn {
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<AIExplanations>({});
  const [aiConfidenceScores, setAiConfidenceScores] =
    useState<AIConfidenceScores>({});
  const [aiToolIds, setAiToolIds] = useState<string[] | null>(null);
  const [aiError, setAiError] = useState<AISearchError | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null
  );
  const [retryToken, setRetryToken] = useState(0);
  const lastTrackedQuery = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const isAiMode = shouldUseAiSearch(query);

  const clearAiSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAiSearching(false);
    setAiExplanations({});
    setAiConfidenceScores({});
    setAiToolIds(null);
    setAiError(null);
    setRetryAfterSeconds(null);
  }, []);

  const retryAiSearch = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!isAiMode || !query) {
      clearAiSearch();
      return;
    }

    // Abort previous request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function performAiSearch() {
      setIsAiSearching(true);
      setAiError(null);
      setRetryAfterSeconds(null);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        if (response.status === 429) {
          if (controller.signal.aborted) return;
          const retryAfterHeader = response.headers.get("Retry-After");
          const seconds = retryAfterHeader
            ? Number.parseInt(retryAfterHeader, 10)
            : NaN;
          setAiExplanations({});
          setAiConfidenceScores({});
          setAiToolIds(null);
          setAiError("rate-limited");
          setRetryAfterSeconds(
            Number.isFinite(seconds) && seconds > 0 ? seconds : null
          );
          setIsAiSearching(false);
          return;
        }

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

        if (lastTrackedQuery.current !== query) {
          trackSearch(query, "ai");
          lastTrackedQuery.current = query;
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
        setAiError("unavailable");
        setIsAiSearching(false);
      }
    }

    void performAiSearch();

    return () => controller.abort();
  }, [query, isAiMode, retryToken, clearAiSearch]);

  return {
    isAiMode,
    isAiSearching,
    aiExplanations,
    aiConfidenceScores,
    aiToolIds,
    aiError,
    retryAfterSeconds,
    retryAiSearch,
    clearAiSearch,
  };
}
