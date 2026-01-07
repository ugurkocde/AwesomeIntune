"use client";

import { motion } from "framer-motion";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  shownCount: number;
  totalCount: number;
}

export function LoadMoreButton({
  onLoadMore,
  isLoading,
  hasMore,
  shownCount,
  totalCount,
}: LoadMoreButtonProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p
          className="mt-4 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          Loading more tools...
        </p>
      </div>
    );
  }

  // All items loaded
  if (!hasMore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "rgba(0, 212, 255, 0.1)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          You&apos;ve seen all {totalCount} tools
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          Check back later for new additions
        </p>
      </motion.div>
    );
  }

  // Load More button
  const remaining = totalCount - shownCount;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <button
        onClick={onLoadMore}
        className="group flex items-center gap-3 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "rgba(0, 212, 255, 0.1)",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          color: "var(--accent-primary)",
        }}
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
          className="transition-transform duration-200 group-hover:translate-y-0.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        Load More Tools
      </button>
      <p
        className="mt-3 text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        Showing {shownCount} of {totalCount} tools
        {remaining > 0 && ` (${remaining} more)`}
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="relative h-10 w-10">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "2px solid rgba(0, 212, 255, 0.1)",
        }}
      />
      {/* Spinning arc */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "2px solid transparent",
          borderTopColor: "var(--accent-primary)",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Inner dot */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "var(--accent-primary)" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Skeleton loading for initial load or when changing filters
export function ToolGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ToolCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

function ToolCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl"
      style={{
        background: "rgba(17, 25, 34, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div
            className="h-6 w-24 animate-pulse rounded-lg"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
          <div
            className="h-5 w-12 animate-pulse rounded"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
        </div>

        {/* Title */}
        <div
          className="h-6 w-3/4 animate-pulse rounded"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
        />

        {/* Description */}
        <div className="mt-3 space-y-2">
          <div
            className="h-4 w-full animate-pulse rounded"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
          <div
            className="h-4 w-2/3 animate-pulse rounded"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
        </div>

        {/* Author */}
        <div className="mt-5 flex items-center gap-3">
          <div
            className="h-8 w-8 animate-pulse rounded-full"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
          <div className="space-y-1">
            <div
              className="h-4 w-20 animate-pulse rounded"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
            />
            <div
              className="h-3 w-16 animate-pulse rounded"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className="mt-6 flex gap-3 border-t pt-5"
          style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <div
            className="h-10 flex-1 animate-pulse rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
          <div
            className="h-10 flex-1 animate-pulse rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function ToolListSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ToolListItemSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

function ToolListItemSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="grid items-center gap-4 rounded-xl p-4"
      style={{
        background: "rgba(17, 25, 34, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        gridTemplateColumns: "48px minmax(200px, 1fr) 140px 100px 88px",
      }}
    >
      {/* Icon */}
      <div
        className="h-12 w-12 animate-pulse rounded-lg"
        style={{ background: "rgba(255, 255, 255, 0.05)" }}
      />

      {/* Content */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-32 animate-pulse rounded"
            style={{ background: "rgba(255, 255, 255, 0.08)" }}
          />
          <div
            className="h-5 w-16 animate-pulse rounded"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
        </div>
        <div
          className="mt-2 h-4 w-3/4 animate-pulse rounded"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        />
      </div>

      {/* Author */}
      <div className="hidden items-center gap-2 sm:flex">
        <div
          className="h-6 w-6 animate-pulse rounded-full"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        />
        <div
          className="h-4 w-20 animate-pulse rounded"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        />
      </div>

      {/* Stats */}
      <div className="hidden justify-end md:flex">
        <div
          className="h-6 w-16 animate-pulse rounded"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <div
          className="h-8 w-14 animate-pulse rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        />
        <div
          className="h-8 w-8 animate-pulse rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        />
      </div>
    </motion.div>
  );
}
