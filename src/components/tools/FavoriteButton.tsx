"use client";

import { useFavorites } from "~/hooks/useFavorites";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

interface FavoriteButtonProps {
  toolId: string;
  toolName: string;
  variant?: "icon" | "full";
}

/**
 * Toggles a tool in the visitor's locally saved list. The initial render is
 * always unsaved so it matches the server HTML; the effect fills it in.
 */
export function FavoriteButton({
  toolId,
  toolName,
  variant = "icon",
}: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(toolId);
  const label = active
    ? `Remove ${toolName} from saved tools`
    : `Save ${toolName} to your tools`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(toolId)}
        aria-pressed={active}
        className="btn btn-secondary"
        style={
          active
            ? {
                borderColor: "var(--border-accent)",
                color: "var(--accent-primary)",
              }
            : undefined
        }
      >
        <BookmarkIcon filled={active} />
        {active ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(toolId)}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:border-[color:var(--border-accent)] hover:text-[var(--accent-primary)]"
      style={{
        borderColor: active ? "var(--border-accent)" : "var(--border-subtle)",
        color: active ? "var(--accent-primary)" : "var(--text-tertiary)",
      }}
    >
      <BookmarkIcon filled={active} />
    </button>
  );
}
