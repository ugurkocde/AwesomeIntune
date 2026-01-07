"use client";

import { motion } from "framer-motion";
import type { ToolCategory, ToolType } from "~/types/tool";
import type { SortOption } from "~/hooks/useToolFilters";
import { CATEGORIES, TYPES, CATEGORY_CONFIG, TYPE_CONFIG } from "~/lib/constants";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "alphabetical", label: "A-Z" },
  { value: "popular", label: "Most Popular" },
  { value: "most-voted", label: "Most Voted" },
  { value: "newest", label: "Newest" },
];

interface FilterBarProps {
  selectedCategory: ToolCategory | null;
  selectedType: ToolType | null;
  sortBy: SortOption;
  onCategoryChange: (category: ToolCategory | null) => void;
  onTypeChange: (type: ToolType | null) => void;
  onSortChange: (sortBy: SortOption) => void;
  resultCount: number;
  totalCount: number;
  isAiSearching?: boolean;
}

export function FilterBar({
  selectedCategory,
  selectedType,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onSortChange,
  resultCount,
  totalCount,
  isAiSearching = false,
}: FilterBarProps) {
  const hasFilters = selectedCategory !== null || selectedType !== null;

  const selectedCategoryColor = selectedCategory
    ? CATEGORY_CONFIG[selectedCategory].color
    : null;
  const selectedTypeColor = selectedType
    ? TYPE_CONFIG[selectedType].color
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Single Row: Filters on left, Results count on right */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label
              className="hidden text-xs font-medium uppercase tracking-wide sm:block"
              style={{ color: "var(--text-tertiary)" }}
            >
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory ?? ""}
                onChange={(e) =>
                  onCategoryChange(
                    e.target.value ? (e.target.value as ToolCategory) : null
                  )
                }
                className="cursor-pointer appearance-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                style={{
                  background: selectedCategoryColor
                    ? `${selectedCategoryColor}15`
                    : "rgba(255, 255, 255, 0.05)",
                  border: selectedCategoryColor
                    ? `1px solid ${selectedCategoryColor}50`
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  color: selectedCategoryColor ?? "var(--text-secondary)",
                }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={selectedCategoryColor ?? "var(--text-tertiary)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-2">
            <label
              className="hidden text-xs font-medium uppercase tracking-wide sm:block"
              style={{ color: "var(--text-tertiary)" }}
            >
              Type
            </label>
            <div className="relative">
              <select
                value={selectedType ?? ""}
                onChange={(e) =>
                  onTypeChange(
                    e.target.value ? (e.target.value as ToolType) : null
                  )
                }
                className="cursor-pointer appearance-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                style={{
                  background: selectedTypeColor
                    ? `${selectedTypeColor}15`
                    : "rgba(255, 255, 255, 0.05)",
                  border: selectedTypeColor
                    ? `1px solid ${selectedTypeColor}50`
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  color: selectedTypeColor ?? "var(--text-secondary)",
                }}
              >
                <option value="">All Types</option>
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={selectedTypeColor ?? "var(--text-tertiary)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              className="hidden text-xs font-medium uppercase tracking-wide sm:block"
              style={{ color: "var(--text-tertiary)" }}
            >
              Sort
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="cursor-pointer appearance-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-secondary)",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => {
                onCategoryChange(null);
                onTypeChange(null);
              }}
              className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </motion.button>
          )}
        </div>

        {/* Right side: Results Count */}
        <motion.p
          key={isAiSearching ? "searching" : resultCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {isAiSearching ? (
            <span style={{ color: "var(--text-tertiary)" }}>
              Analyzing your query...
            </span>
          ) : (
            <>
              Showing{" "}
              <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                {resultCount}
              </span>{" "}
              of {totalCount} tools
            </>
          )}
        </motion.p>
      </div>
    </motion.div>
  );
}
