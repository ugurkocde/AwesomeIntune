"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type VoteCounts = Record<string, number>;

const VOTER_ID_KEY = "awesomeintune_voter_id";
const VOTED_TOOLS_KEY = "awesomeintune_voted_tools";

// Base poll interval with jitter to prevent thundering herd
const BASE_POLL_INTERVAL = 60000; // 60 seconds base
const POLL_JITTER = 15000; // +/- 15 seconds random jitter

// Get a randomized poll interval to spread out requests
function getJitteredInterval(): number {
  return BASE_POLL_INTERVAL + Math.random() * POLL_JITTER * 2 - POLL_JITTER;
}

// Generate a UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get or create voter ID from localStorage
function getVoterId(): string {
  if (typeof window === "undefined") return "";

  let voterId = localStorage.getItem(VOTER_ID_KEY);
  if (!voterId) {
    voterId = generateUUID();
    localStorage.setItem(VOTER_ID_KEY, voterId);
  }
  return voterId;
}

// Get voted tools from localStorage
function getVotedTools(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = localStorage.getItem(VOTED_TOOLS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return new Set(parsed);
    }
  } catch {
    // Invalid JSON, reset
    localStorage.removeItem(VOTED_TOOLS_KEY);
  }
  return new Set();
}

// Save voted tools to localStorage
function saveVotedTools(tools: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTED_TOOLS_KEY, JSON.stringify(Array.from(tools)));
}

export function useVoting() {
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [votedTools, setVotedTools] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVotes, setPendingVotes] = useState<Set<string>>(new Set());
  const voterIdRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voter ID and voted tools from localStorage
  useEffect(() => {
    voterIdRef.current = getVoterId();
    setVotedTools(getVotedTools());
  }, []);

  // Fetch vote counts with jittered polling
  useEffect(() => {
    let isMounted = true;

    const fetchVoteCounts = async () => {
      try {
        const response = await fetch("/api/votes");
        if (response.ok && isMounted) {
          const counts = (await response.json()) as VoteCounts;
          setVoteCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch vote counts:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Schedule next poll with jitter
    const scheduleNextPoll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        void fetchVoteCounts().then(() => {
          if (isMounted && document.visibilityState === "visible") {
            scheduleNextPoll();
          }
        });
      }, getJitteredInterval());
    };

    // Initial fetch
    void fetchVoteCounts().then(() => {
      if (isMounted && document.visibilityState === "visible") {
        scheduleNextPoll();
      }
    });

    const stopPolling = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchVoteCounts();
        scheduleNextPoll();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Check if user has voted for a tool
  const hasVoted = useCallback((toolId: string): boolean => {
    return votedTools.has(toolId);
  }, [votedTools]);

  // Check if a vote is currently pending
  const isVotePending = useCallback((toolId: string): boolean => {
    return pendingVotes.has(toolId);
  }, [pendingVotes]);

  // Record a vote for a tool
  const vote = useCallback(async (toolId: string): Promise<boolean> => {
    // Skip if already voted or pending
    if (votedTools.has(toolId) || pendingVotes.has(toolId)) {
      return false;
    }

    const voterId = voterIdRef.current;
    if (!voterId) {
      console.error("No voter ID available");
      return false;
    }

    // Mark as pending
    setPendingVotes((prev) => new Set(prev).add(toolId));

    // Optimistically update
    setVotedTools((prev) => {
      const newSet = new Set(prev).add(toolId);
      saveVotedTools(newSet);
      return newSet;
    });
    setVoteCounts((prev) => ({
      ...prev,
      [toolId]: (prev[toolId] ?? 0) + 1,
    }));

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, voterId }),
      });

      if (!response.ok) {
        throw new Error("Failed to record vote");
      }

      const data = (await response.json()) as { success: boolean; result: string };

      // If server says already voted, sync local state
      if (data.result === "already_voted") {
        // Vote was already recorded server-side, local state is correct
      }

      return true;
    } catch (error) {
      console.error("Failed to record vote:", error);

      // Rollback optimistic update on error
      setVotedTools((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        saveVotedTools(newSet);
        return newSet;
      });
      setVoteCounts((prev) => ({
        ...prev,
        [toolId]: Math.max((prev[toolId] ?? 1) - 1, 0),
      }));

      return false;
    } finally {
      // Remove from pending
      setPendingVotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        return newSet;
      });
    }
  }, [votedTools, pendingVotes]);

  return {
    voteCounts,
    isLoading,
    hasVoted,
    isVotePending,
    vote,
  };
}

// Helper function to format vote counts (reuse the same format as views)
export function formatVoteCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toString();
}
