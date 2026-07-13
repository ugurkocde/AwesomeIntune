"use client";

import { useRepoStats } from "./RepoStatsProvider";

/**
 * Renders a prominent warning near the title when the source repository has
 * been archived on GitHub and is therefore no longer maintained.
 */
export function ArchivedNotice() {
  const { stats } = useRepoStats();

  if (!stats?.archived) return null;

  return (
    <div
      role="status"
      className="mb-5 inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-semibold"
      style={{
        background: "color-mix(in srgb, var(--signal-warning) 12%, transparent)",
        color: "var(--signal-warning)",
        border:
          "1px solid color-mix(in srgb, var(--signal-warning) 35%, transparent)",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="5" rx="1" />
        <path d="M4 9v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
        <path d="M10 13h4" />
      </svg>
      Archived - no longer maintained
    </div>
  );
}
