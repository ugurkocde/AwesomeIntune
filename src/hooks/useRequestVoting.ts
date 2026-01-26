"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type RequestVoteCounts = Record<string, number>;

const VOTER_ID_KEY = "awesomeintune_voter_id";
const VOTED_REQUESTS_KEY = "awesomeintune_voted_requests";

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

// Get voted requests from localStorage
function getVotedRequests(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = localStorage.getItem(VOTED_REQUESTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return new Set(parsed);
    }
  } catch {
    // Invalid JSON, reset
    localStorage.removeItem(VOTED_REQUESTS_KEY);
  }
  return new Set();
}

// Save voted requests to localStorage
function saveVotedRequests(requests: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    VOTED_REQUESTS_KEY,
    JSON.stringify(Array.from(requests))
  );
}

export function useRequestVoting() {
  const [voteCounts, setVoteCounts] = useState<RequestVoteCounts>({});
  const [votedRequests, setVotedRequests] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVotes, setPendingVotes] = useState<Set<string>>(new Set());
  const voterIdRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voter ID and voted requests from localStorage
  useEffect(() => {
    voterIdRef.current = getVoterId();
    setVotedRequests(getVotedRequests());
  }, []);

  // Fetch vote counts with jittered polling
  useEffect(() => {
    let isMounted = true;

    const fetchVoteCounts = async () => {
      try {
        const response = await fetch("/api/requests/votes");
        if (response.ok && isMounted) {
          const counts = (await response.json()) as RequestVoteCounts;
          setVoteCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch request vote counts:", error);
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

  // Check if user has voted for a request
  const hasVoted = useCallback(
    (requestId: string): boolean => {
      return votedRequests.has(requestId);
    },
    [votedRequests]
  );

  // Check if a vote is currently pending
  const isVotePending = useCallback(
    (requestId: string): boolean => {
      return pendingVotes.has(requestId);
    },
    [pendingVotes]
  );

  // Record a vote for a request
  const vote = useCallback(
    async (requestId: string): Promise<boolean> => {
      // Skip if already voted or pending
      if (votedRequests.has(requestId) || pendingVotes.has(requestId)) {
        return false;
      }

      const voterId = voterIdRef.current;
      if (!voterId) {
        console.error("No voter ID available");
        return false;
      }

      // Mark as pending
      setPendingVotes((prev) => new Set(prev).add(requestId));

      // Optimistically update
      setVotedRequests((prev) => {
        const newSet = new Set(prev).add(requestId);
        saveVotedRequests(newSet);
        return newSet;
      });
      setVoteCounts((prev) => ({
        ...prev,
        [requestId]: (prev[requestId] ?? 0) + 1,
      }));

      try {
        const response = await fetch("/api/requests/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, voterId }),
        });

        if (!response.ok) {
          throw new Error("Failed to record vote");
        }

        const data = (await response.json()) as {
          success: boolean;
          result: string;
        };

        // If server says already voted, sync local state
        if (data.result === "already_voted") {
          // Vote was already recorded server-side, local state is correct
        }

        return true;
      } catch (error) {
        console.error("Failed to record vote:", error);

        // Rollback optimistic update on error
        setVotedRequests((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          saveVotedRequests(newSet);
          return newSet;
        });
        setVoteCounts((prev) => ({
          ...prev,
          [requestId]: Math.max((prev[requestId] ?? 1) - 1, 0),
        }));

        return false;
      } finally {
        // Remove from pending
        setPendingVotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [votedRequests, pendingVotes]
  );

  return {
    voteCounts,
    isLoading,
    hasVoted,
    isVotePending,
    vote,
  };
}

// Helper function to format vote counts
export function formatRequestVoteCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toString();
}
