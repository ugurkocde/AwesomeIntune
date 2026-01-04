"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GitHubStats as GitHubStatsType } from "~/app/api/github-stats/route";

interface GitHubStatsProps {
  repoUrl: string;
  accentColor: string;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function GitHubStats({ repoUrl, accentColor }: GitHubStatsProps) {
  const [stats, setStats] = useState<GitHubStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/github-stats?repoUrl=${encodeURIComponent(repoUrl)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = (await response.json()) as GitHubStatsType;
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [repoUrl]);

  if (loading) {
    return (
      <div
        className="mt-8 border-t pt-8"
        style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-lg"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const statItems = [
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
        </svg>
      ),
      label: "Stars",
      value: formatNumber(stats.stars),
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      label: "Issues",
      value: formatNumber(stats.openIssues),
    },
    ...(stats.language
      ? [
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            ),
            label: "Language",
            value: stats.language,
          },
        ]
      : []),
    ...(stats.license
      ? [
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" />
              </svg>
            ),
            label: "License",
            value: stats.license,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-8 border-t pt-8"
      style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <span style={{ color: accentColor }}>{stat.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              {stat.label}
            </span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
