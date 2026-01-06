"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ViewCounts = Record<string, number>;

const POLL_INTERVAL = 30000; // 30 seconds

export function useViewTracking() {
  const [viewCounts, setViewCounts] = useState<ViewCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const viewedToolsRef = useRef<Set<string>>(new Set());

  // Fetch view counts with polling
  useEffect(() => {
    const fetchViewCounts = async () => {
      try {
        const response = await fetch("/api/views");
        if (response.ok) {
          const counts = (await response.json()) as ViewCounts;
          setViewCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch view counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    void fetchViewCounts();

    // Set up polling (only when tab is visible)
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId ??= setInterval(() => {
        void fetchViewCounts();
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchViewCounts(); // Fetch immediately when tab becomes visible
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Start polling if tab is visible
    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
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
