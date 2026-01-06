"use client";

import { useEffect, useState, useRef } from "react";
import { formatViewCount, type ViewCounts } from "~/hooks/useViewTracking";

interface ToolViewCounterProps {
  toolId: string;
}

export function ToolViewCounter({ toolId }: ToolViewCounterProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    // Fetch current view count
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/views");
        if (response.ok) {
          const counts = (await response.json()) as ViewCounts;
          setViewCount(counts[toolId] ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch view count:", error);
      }
    };

    // Record view (only once per page load)
    const recordView = async () => {
      if (hasRecordedRef.current) return;
      hasRecordedRef.current = true;

      try {
        await fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolId }),
        });
        // Increment local count after recording
        setViewCount((prev) => (prev ?? 0) + 1);
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    };

    void fetchCount();
    void recordView();
  }, [toolId]);

  if (viewCount === null || viewCount === 0) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        color: "var(--text-tertiary)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {formatViewCount(viewCount)} views
    </span>
  );
}
