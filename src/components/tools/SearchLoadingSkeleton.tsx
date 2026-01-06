"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const AI_SEARCH_STAGES = [
  { message: "Analyzing your query...", icon: "search" },
  { message: "Understanding search intent...", icon: "brain" },
  { message: "Scanning tool database...", icon: "database" },
  { message: "Finding relevant matches...", icon: "match" },
];

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
        background: "rgba(17, 25, 34, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Shimmer overlay - smooth animation with pause between cycles */}
      <motion.div
        className="absolute inset-0"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
          repeat: Infinity,
          repeatDelay: 0.8,
        }}
        style={{
          background: `linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.02) 20%,
            rgba(255, 255, 255, 0.06) 40%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.06) 60%,
            rgba(255, 255, 255, 0.02) 80%,
            rgba(255, 255, 255, 0) 100%
          )`,
        }}
      />

      <div className="relative p-6">
        {/* Badge placeholder */}
        <div className="mb-4">
          <motion.div
            className="h-7 w-32 rounded-lg"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Title placeholder */}
        <motion.div
          className="h-6 w-3/4 rounded-md"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1,
          }}
        />

        {/* Description placeholders */}
        <div className="mt-3 space-y-2">
          <motion.div
            className="h-4 w-full rounded"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-4 w-5/6 rounded"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </div>

        {/* Author placeholder */}
        <div className="mt-5 flex items-center gap-3">
          <motion.div
            className="h-8 w-8 rounded-full"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
          <div className="space-y-1.5">
            <motion.div
              className="h-3.5 w-24 rounded"
              style={{ background: "rgba(255, 255, 255, 0.04)" }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="h-3 w-16 rounded"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </div>
        </div>

        {/* Action buttons placeholder */}
        <div
          className="mt-6 flex items-center gap-3 border-t pt-5"
          style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <motion.div
            className="h-10 flex-1 rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            }}
          />
          <motion.div
            className="h-10 flex-1 rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function StageIcon({ type }: { type: string }) {
  const iconProps = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "search":
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "brain":
      return (
        <svg {...iconProps}>
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
          <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
          <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
          <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
          <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
          <path d="M6 18a4 4 0 0 1-1.967-.516" />
          <path d="M19.967 17.484A4 4 0 0 1 18 18" />
        </svg>
      );
    case "database":
      return (
        <svg {...iconProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5V19A9 3 0 0 0 21 19V5" />
          <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
      );
    case "match":
      return (
        <svg {...iconProps}>
          <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </svg>
      );
  }
}

export function SearchLoadingSkeleton() {
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let stageTimeout: NodeJS.Timeout;

    // Progress through stages with random delay between 3.5-4.5 seconds
    const scheduleNextStage = () => {
      const randomDelay = 3500 + Math.random() * 1000; // 3.5s to 4.5s
      stageTimeout = setTimeout(() => {
        setCurrentStage((prev) => {
          // Stop at the last stage instead of cycling
          if (prev >= AI_SEARCH_STAGES.length - 1) {
            return prev;
          }
          // Schedule next stage transition
          scheduleNextStage();
          return prev + 1;
        });
      }, randomDelay);
    };

    scheduleNextStage();

    // Update elapsed time every second
    const timeInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(stageTimeout);
      clearInterval(timeInterval);
    };
  }, []);

  const stage = AI_SEARCH_STAGES[currentStage];

  if (!stage) {
    return null;
  }

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
        className="mb-8 flex flex-col items-center gap-4"
      >
        {/* Main status indicator */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ color: "var(--accent-primary)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
            </svg>
          </motion.div>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--accent-primary)" }}
          >
            AI-Powered Search
          </span>
        </div>

        {/* Dynamic stage message */}
        <div
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-4 py-2 sm:w-auto sm:min-w-[280px]"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            height: "40px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <StageIcon type={stage.icon} />
              <span className="text-xs sm:text-sm">{stage.message}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicator and elapsed time */}
        <div className="flex items-center gap-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {AI_SEARCH_STAGES.map((_, index) => (
              <motion.div
                key={index}
                className="h-1.5 w-1.5 rounded-full"
                animate={{
                  scale: index === currentStage ? 1.3 : 1,
                  backgroundColor:
                    index === currentStage
                      ? "var(--accent-primary)"
                      : index < currentStage
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(255, 255, 255, 0.15)",
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>

          {/* Elapsed time */}
          <span
            className="text-xs"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            {elapsedSeconds}s elapsed
          </span>
        </div>
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
