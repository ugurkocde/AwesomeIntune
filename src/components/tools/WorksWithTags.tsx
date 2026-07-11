import type { WorksWithTag } from "~/types/tool";
import { WORKS_WITH_CONFIG } from "~/lib/constants";

interface WorksWithTagsProps {
  tags: WorksWithTag[];
  variant?: "compact" | "full";
  maxDisplay?: number;
}

export function WorksWithTags({
  tags,
  variant = "compact",
  maxDisplay = 3,
}: WorksWithTagsProps) {
  if (!tags || tags.length === 0) return null;

  const displayTags = variant === "compact" ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = variant === "compact" ? tags.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayTags.map((tag) => {
        const config = WORKS_WITH_CONFIG[tag];
        if (!config) return null;

        return (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              background: `${config.color}12`,
              color: config.color,
              border: `1px solid ${config.color}20`,
            }}
          >
            {config.label}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-tertiary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
