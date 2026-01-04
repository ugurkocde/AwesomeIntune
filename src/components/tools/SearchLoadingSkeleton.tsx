"use client";

import { motion } from "framer-motion";

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(17, 25, 34, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: `linear-gradient(
            110deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.03) 40%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 60%,
            rgba(255, 255, 255, 0) 100%
          )`,
        }}
      />

      <div className="relative p-6">
        {/* Badge placeholder */}
        <div className="mb-4">
          <div
            className="h-7 w-32 rounded-lg"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
        </div>

        {/* Title placeholder */}
        <div
          className="h-6 w-3/4 rounded-md"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        />

        {/* Description placeholders */}
        <div className="mt-3 space-y-2">
          <div
            className="h-4 w-full rounded"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
          <div
            className="h-4 w-5/6 rounded"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
        </div>

        {/* Author placeholder */}
        <div className="mt-5 flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
          <div className="space-y-1.5">
            <div
              className="h-3.5 w-24 rounded"
              style={{ background: "rgba(255, 255, 255, 0.04)" }}
            />
            <div
              className="h-3 w-16 rounded"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            />
          </div>
        </div>

        {/* Action buttons placeholder */}
        <div
          className="mt-6 flex items-center gap-3 border-t pt-5"
          style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <div
            className="h-10 flex-1 rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
          <div
            className="h-10 flex-1 rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function SearchLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Loading header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex items-center justify-center gap-3"
      >
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </motion.svg>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          Searching with AI...
        </span>
      </motion.div>

      {/* Skeleton grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
