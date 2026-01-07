"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { ToolCategory, ToolType } from "~/types/tool";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "~/lib/constants";

export type SortOption = "alphabetical" | "popular" | "newest";
export type ViewMode = "grid" | "list";

interface UseUrlFiltersReturn {
  // State from URL
  selectedCategory: ToolCategory | null;
  selectedType: ToolType | null;
  sortBy: SortOption;
  viewMode: ViewMode;
  searchQuery: string;

  // Actions
  setCategory: (category: ToolCategory | null) => void;
  setType: (type: ToolType | null) => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  clearAllFilters: () => void;

  // Helpers
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

const VIEW_STORAGE_KEY = "awesome-intune-view-mode";

// Validate category from URL
function isValidCategory(value: string | null): value is ToolCategory {
  if (!value) return false;
  return value in CATEGORY_CONFIG;
}

// Validate type from URL
function isValidType(value: string | null): value is ToolType {
  if (!value) return false;
  return value in TYPE_CONFIG;
}

// Validate sort option from URL
function isValidSort(value: string | null): value is SortOption {
  return value === "alphabetical" || value === "popular" || value === "newest";
}

// Validate view mode
function isValidViewMode(value: string | null): value is ViewMode {
  return value === "grid" || value === "list";
}

export function useUrlFilters(): UseUrlFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial state from URL params
  const categoryParam = searchParams.get("category");
  const typeParam = searchParams.get("type");
  const sortParam = searchParams.get("sort");
  const queryParam = searchParams.get("q");

  // Parse URL values with validation
  const selectedCategory = isValidCategory(categoryParam) ? categoryParam : null;
  const selectedType = isValidType(typeParam) ? typeParam : null;
  const sortBy: SortOption = isValidSort(sortParam) ? sortParam : "alphabetical";
  const searchQuery = queryParam ?? "";

  // View mode from localStorage (not URL - it's a UI preference, not a filter)
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");
  const [isViewModeLoaded, setIsViewModeLoaded] = useState(false);

  // Load view mode from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (isValidViewMode(stored)) {
        setViewModeState(stored);
      }
    } catch {
      // localStorage might be disabled
    }
    setIsViewModeLoaded(true);
  }, []);

  // Helper to update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Actions
  const setCategory = useCallback(
    (category: ToolCategory | null) => {
      updateParams({ category });
    },
    [updateParams]
  );

  const setType = useCallback(
    (type: ToolType | null) => {
      updateParams({ type });
    },
    [updateParams]
  );

  const setSortBy = useCallback(
    (sort: SortOption) => {
      // Don't include alphabetical in URL since it's the default
      updateParams({ sort: sort === "alphabetical" ? null : sort });
    },
    [updateParams]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      updateParams({ q: query || null });
    },
    [updateParams]
  );

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // localStorage might be disabled
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== null ||
      selectedType !== null ||
      searchQuery.length > 0
    );
  }, [selectedCategory, selectedType, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedType) count++;
    if (searchQuery) count++;
    return count;
  }, [selectedCategory, selectedType, searchQuery]);

  return {
    selectedCategory,
    selectedType,
    sortBy,
    viewMode: isViewModeLoaded ? viewMode : "grid",
    searchQuery,
    setCategory,
    setType,
    setSortBy,
    setViewMode,
    setSearchQuery,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
