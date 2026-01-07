"use client";

import { motion } from "framer-motion";
import type { ViewMode } from "~/hooks/useUrlFilters";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div
      className="flex items-center rounded-xl p-1"
      style={{
        background: "rgba(17, 25, 34, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <ToggleButton
        isActive={viewMode === "grid"}
        onClick={() => onViewModeChange("grid")}
        label="Grid view"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </ToggleButton>
      <ToggleButton
        isActive={viewMode === "list"}
        onClick={() => onViewModeChange("list")}
        label="List view"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </ToggleButton>
    </div>
  );
}

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function ToggleButton({ isActive, onClick, label, children }: ToggleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      style={{
        color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      aria-pressed={isActive}
    >
      {/* Active background */}
      {isActive && (
        <motion.div
          layoutId="viewToggleBackground"
          className="absolute inset-0 rounded-lg"
          style={{
            background: "rgba(0, 212, 255, 0.1)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
          }}
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
