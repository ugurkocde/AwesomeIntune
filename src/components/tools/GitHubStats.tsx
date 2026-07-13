"use client";

import { motion } from "framer-motion";
import { formatRelativeTime, useRepoStats } from "./RepoStatsProvider";

interface GitHubStatsProps {
  accentColor: string;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function GitHubStats({ accentColor }: GitHubStatsProps) {
  const { stats, loading, error } = useRepoStats();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg"
            style={{
              background: "var(--bg-tertiary)",
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const statItems = [
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
        </svg>
      ),
      label: "Stars",
      value: formatNumber(stats.stars),
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M6 9v6" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      ),
      label: "Forks",
      value: formatNumber(stats.forks),
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-2">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ color: accentColor }}>{stat.icon}</span>
            <span className="min-w-0">
              <span
                className="block truncate text-[11px] uppercase tracking-wide"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </span>
              <span
                className="block truncate font-mono text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </span>
            </span>
          </div>
        ))}
      </div>

      {stats.updatedAt && (
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--text-tertiary)" }}
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
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Updated {formatRelativeTime(stats.updatedAt)}</span>
        </div>
      )}
    </motion.div>
  );
}
