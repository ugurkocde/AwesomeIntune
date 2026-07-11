"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { GitHubStats as GitHubStatsType } from "~/app/api/github-stats/route";

interface RepoStatsContextValue {
  stats: GitHubStatsType | null;
  loading: boolean;
  error: boolean;
}

const RepoStatsContext = createContext<RepoStatsContextValue>({
  stats: null,
  loading: false,
  error: false,
});

export function useRepoStats(): RepoStatsContextValue {
  return useContext(RepoStatsContext);
}

/**
 * Fetches the repository stats once and shares them with every consumer on the
 * page (sidebar stats plus the archived notice near the title), so the same
 * endpoint is not requested twice.
 */
export function RepoStatsProvider({
  repoUrl,
  children,
}: {
  repoUrl?: string;
  children: ReactNode;
}) {
  const [stats, setStats] = useState<GitHubStatsType | null>(null);
  const [loading, setLoading] = useState(Boolean(repoUrl));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!repoUrl) return;

    let active = true;
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/github-stats?repoUrl=${encodeURIComponent(repoUrl)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = (await response.json()) as GitHubStatsType;
        if (active) setStats(data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchStats();
    return () => {
      active = false;
    };
  }, [repoUrl]);

  return (
    <RepoStatsContext.Provider value={{ stats, loading, error }}>
      {children}
    </RepoStatsContext.Provider>
  );
}

/**
 * Turns an ISO timestamp into a short relative label such as "2 months ago".
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const units: Array<{ limit: number; div: number; name: string }> = [
    { limit: 3600, div: 60, name: "minute" },
    { limit: 86400, div: 3600, name: "hour" },
    { limit: 604800, div: 86400, name: "day" },
    { limit: 2629800, div: 604800, name: "week" },
    { limit: 31557600, div: 2629800, name: "month" },
    { limit: Infinity, div: 31557600, name: "year" },
  ];

  for (const unit of units) {
    if (seconds < unit.limit) {
      const value = Math.max(1, Math.floor(seconds / unit.div));
      return `${value} ${unit.name}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "";
}
