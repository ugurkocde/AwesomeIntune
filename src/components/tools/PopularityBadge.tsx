"use client";

import { useEffect, useState } from "react";
import { CATEGORY_CONFIG } from "~/lib/constants";
import type { ToolCategory } from "~/types/tool";

interface PopularityBadgeProps {
  toolId: string;
  category: ToolCategory;
}

interface RankingData {
  rank: number;
  totalInCategory: number;
}

export function PopularityBadge({ toolId, category }: PopularityBadgeProps) {
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const response = await fetch(`/api/tools/${toolId}/ranking`);
        if (response.ok) {
          const data = (await response.json()) as RankingData;
          if (typeof data.rank === "number" && typeof data.totalInCategory === "number") {
            setRanking(data);
          }
        }
      } catch {
        // Silently fail - badge just won't show
      } finally {
        setIsLoading(false);
      }
    }

    void fetchRanking();
  }, [toolId]);

  // Reserve space with a subtle placeholder while loading so the badge does not
  // pop in and shift surrounding content.
  if (isLoading) {
    return (
      <div
        className="inline-flex h-[30px] w-36 animate-pulse rounded-lg"
        style={{ background: "var(--bg-tertiary)" }}
        aria-hidden="true"
      />
    );
  }

  // Nothing to show once loaded without a top-10 ranking
  if (!ranking || ranking.rank > 10) return null;

  const categoryConfig = CATEGORY_CONFIG[category];

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
      style={{
        background: `${categoryConfig.color}15`,
        color: categoryConfig.color,
        border: `1px solid ${categoryConfig.color}25`,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>
        Top {ranking.rank} in {categoryConfig.label}
      </span>
    </div>
  );
}
