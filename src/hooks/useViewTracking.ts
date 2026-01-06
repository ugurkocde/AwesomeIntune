"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ViewCounts = Record<string, number>;

// Base poll interval with jitter to prevent thundering herd
const BASE_POLL_INTERVAL = 60000; // 60 seconds base
const POLL_JITTER = 15000; // +/- 15 seconds random jitter

// Get a randomized poll interval to spread out requests
function getJitteredInterval(): number {
  return BASE_POLL_INTERVAL + Math.random() * POLL_JITTER * 2 - POLL_JITTER;
}

export function useViewTracking() {
  const [viewCounts, setViewCounts] = useState<ViewCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const viewedToolsRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch view counts with jittered polling
  useEffect(() => {
    let isMounted = true;

    const fetchViewCounts = async () => {
      try {
        const response = await fetch("/api/views");
        if (response.ok && isMounted) {
          const counts = (await response.json()) as ViewCounts;
          setViewCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch view counts:", error);
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
        void fetchViewCounts().then(() => {
          if (isMounted && document.visibilityState === "visible") {
            scheduleNextPoll();
          }
        });
      }, getJitteredInterval());
    };

    // Initial fetch
    void fetchViewCounts().then(() => {
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
        void fetchViewCounts(); // Fetch immediately when tab becomes visible
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

  // Record a view for a tool
  const recordView = useCallback(async (toolId: string) => {
    // Skip if already viewed in this session
    if (viewedToolsRef.current.has(toolId)) {
      return;
    }

    // Mark as viewed immediately to prevent duplicate calls
    viewedToolsRef.current.add(toolId);

    // Optimistically update the count
    setViewCounts((prev) => ({
      ...prev,
      [toolId]: (prev[toolId] ?? 0) + 1,
    }));

    // Record the view in the database
    try {
      await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      });
    } catch (error) {
      console.error("Failed to record view:", error);
      // Don't roll back the optimistic update - it's not critical
    }
  }, []);

  return {
    viewCounts,
    isLoading,
    recordView,
  };
}

// Helper function to format view counts
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toString();
}
