"use client";

import type { RepoStats } from "~/types/tool";
import { useRepoStats } from "./RepoStatsProvider";

/**
 * Renders a prominent warning near the title when the source repository has
 * been archived on GitHub and is therefore no longer maintained.
 *
 * The statically stored repoStats are used as the initial value so the notice
 * is server-rendered even when the live GitHub lookup is throttled.
 */
export function ArchivedNotice({
  repoStats,
}: {
  repoStats?: RepoStats | null;
}) {
  const { stats } = useRepoStats();
  const archived = stats?.archived ?? repoStats?.archived ?? false;

  if (!archived) return null;

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
