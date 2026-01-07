"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolCategory, ToolType, Tool } from "~/types/tool";
import { CATEGORIES, TYPES } from "~/lib/constants";
import type { SortOption } from "~/hooks/useUrlFilters";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "alphabetical", label: "A-Z" },
  { value: "popular", label: "Most Popular" },
  { value: "most-voted", label: "Most Voted" },
  { value: "newest", label: "Newest" },
];

interface FilterSidebarProps {
  tools: Tool[];
  selectedCategory: ToolCategory | null;
  selectedType: ToolType | null;
  sortBy: SortOption;
  onCategoryChange: (category: ToolCategory | null) => void;
  onTypeChange: (type: ToolType | null) => void;
  onSortChange: (sort: SortOption) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export function FilterSidebar({
  tools,
  selectedCategory,
  selectedType,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    types: true,
  });

  // Calculate tool counts per category and type
  const categoryCounts = tools.reduce(
    (acc, tool) => {
      acc[tool.category] = (acc[tool.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<ToolCategory, number>
  );

  const typeCounts = tools.reduce(
    (acc, tool) => {
      acc[tool.type] = (acc[tool.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<ToolType, number>
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside
      className="flex w-[280px] flex-shrink-0 flex-col overflow-hidden rounded-2xl"
      style={{
        background: "rgba(17, 25, 34, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        maxHeight: "calc(100vh - 300px)",
      }}
    >
      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="font-display text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            Filters
          </h2>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear all
            </motion.button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="mb-6">
          <label
            className="mb-2 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-tertiary)" }}
          >
            Sort by
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full cursor-pointer appearance-none rounded-lg py-2.5 pl-3 pr-8 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
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
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mb-5 h-px"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        />

        {/* Categories Section */}
        <FilterSection
          title="Categories"
          isExpanded={expandedSections.categories}
          onToggle={() => toggleSection("categories")}
        >
          <div className="space-y-1">
            {CATEGORIES.map((category) => {
              const count = categoryCounts[category.value] ?? 0;
              const isSelected = selectedCategory === category.value;
              return (
                <FilterCheckbox
                  key={category.value}
                  label={category.label}
                  count={count}
                  isSelected={isSelected}
                  color={category.color}
                  onClick={() =>
                    onCategoryChange(isSelected ? null : category.value)
                  }
                />
              );
            })}
          </div>
        </FilterSection>

        {/* Divider */}
        <div
          className="my-5 h-px"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        />

        {/* Types Section */}
        <FilterSection
          title="Types"
          isExpanded={expandedSections.types}
          onToggle={() => toggleSection("types")}
        >
          <div className="space-y-1">
            {TYPES.map((type) => {
              const count = typeCounts[type.value] ?? 0;
              const isSelected = selectedType === type.value;
              return (
                <FilterCheckbox
                  key={type.value}
                  label={type.label}
                  count={count}
                  isSelected={isSelected}
                  color={type.color}
                  onClick={() => onTypeChange(isSelected ? null : type.value)}
                />
              );
            })}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-tertiary)" }}
        >
          {title}
        </span>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth="2"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  count: number;
  isSelected: boolean;
  color: string;
  onClick: () => void;
}

function FilterCheckbox({
  label,
  count,
  isSelected,
  color,
  onClick,
}: FilterCheckboxProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
    >
      {/* Checkbox */}
      <div
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all"
        style={{
          background: isSelected ? color : "transparent",
          border: isSelected ? `1px solid ${color}` : "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {isSelected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        )}
      </div>

      {/* Label */}
      <span
        className="flex-1 text-sm transition-colors"
        style={{
          color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        {label}
      </span>

      {/* Count Badge */}
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          background: isSelected ? `${color}20` : "rgba(255, 255, 255, 0.05)",
          color: isSelected ? color : "var(--text-tertiary)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// Mobile Filter Drawer Component
interface FilterDrawerProps extends FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  ...filterProps
}: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 top-0 z-50 w-[320px] overflow-y-auto"
            style={{
              background: "var(--bg-primary)",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Drawer Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-5"
              style={{
                background: "var(--bg-primary)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <h2
                className="font-display text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Filters
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-5">
              <FilterSidebarContent {...filterProps} />
            </div>

            {/* Apply Button (sticky at bottom) */}
            <div
              className="sticky bottom-0 p-5"
              style={{
                background:
                  "linear-gradient(to top, var(--bg-primary) 80%, transparent)",
              }}
            >
              <button
                onClick={onClose}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                  color: "var(--bg-primary)",
                }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Extracted filter content for reuse
function FilterSidebarContent(props: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    types: true,
  });

  const categoryCounts = props.tools.reduce(
    (acc, tool) => {
      acc[tool.category] = (acc[tool.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<ToolCategory, number>
  );

  const typeCounts = props.tools.reduce(
    (acc, tool) => {
      acc[tool.type] = (acc[tool.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<ToolType, number>
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      {/* Clear All */}
      {props.hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={props.onClearAll}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            color: "var(--text-secondary)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear all filters
        </motion.button>
      )}

      {/* Sort */}
      <div className="mb-6">
        <label
          className="mb-2 block text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-tertiary)" }}
        >
          Sort by
        </label>
        <div className="relative">
          <select
            value={props.sortBy}
            onChange={(e) => props.onSortChange(e.target.value as SortOption)}
            className="w-full cursor-pointer appearance-none rounded-lg py-2.5 pl-3 pr-8 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
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
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div className="mb-5 h-px" style={{ background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Categories */}
      <FilterSection
        title="Categories"
        isExpanded={expandedSections.categories}
        onToggle={() => toggleSection("categories")}
      >
        <div className="space-y-1">
          {CATEGORIES.map((category) => {
            const count = categoryCounts[category.value] ?? 0;
            const isSelected = props.selectedCategory === category.value;
            return (
              <FilterCheckbox
                key={category.value}
                label={category.label}
                count={count}
                isSelected={isSelected}
                color={category.color}
                onClick={() =>
                  props.onCategoryChange(isSelected ? null : category.value)
                }
              />
            );
          })}
        </div>
      </FilterSection>

      <div className="my-5 h-px" style={{ background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Types */}
      <FilterSection
        title="Types"
        isExpanded={expandedSections.types}
        onToggle={() => toggleSection("types")}
      >
        <div className="space-y-1">
          {TYPES.map((type) => {
            const count = typeCounts[type.value] ?? 0;
            const isSelected = props.selectedType === type.value;
            return (
              <FilterCheckbox
                key={type.value}
                label={type.label}
                count={count}
                isSelected={isSelected}
                color={type.color}
                onClick={() =>
                  props.onTypeChange(isSelected ? null : type.value)
                }
              />
            );
          })}
        </div>
      </FilterSection>
    </>
  );
}
