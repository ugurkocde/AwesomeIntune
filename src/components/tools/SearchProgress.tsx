"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STAGE_COUNT = 3;

interface SearchProgressProps {
  query: string;
  toolCount: number;
  directMatchCount: number;
}

export function SearchProgress({
  query,
  toolCount,
  directMatchCount,
}: SearchProgressProps) {
  const [activeStage, setActiveStage] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const hasDirectMatches = directMatchCount > 0;
  const stages = [
    "Understanding your search",
    `Reviewing ${toolCount} curated tools`,
    "Ranking related matches",
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;

    let nextStage = 0;
    const interval = window.setInterval(() => {
      nextStage += 1;
      setActiveStage(Math.min(nextStage, STAGE_COUNT - 1));
      if (nextStage >= STAGE_COUNT - 1) window.clearInterval(interval);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
      }
      aria-hidden="true"
      className={`relative mb-6 overflow-hidden rounded-2xl border border-[rgba(0,120,212,0.2)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(0,120,212,0.07))] shadow-[0_14px_36px_rgba(15,23,42,0.06)] ${
        hasDirectMatches ? "px-5 py-4 sm:px-6" : "px-6 py-9 sm:px-10 sm:py-11"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[rgba(0,120,212,0.08)]">
        <motion.div
          className="h-full origin-left bg-[linear-gradient(90deg,var(--accent-primary),#22c7f3)]"
          animate={{
            scaleX: (activeStage + 1) / STAGE_COUNT,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>

      <div
        className={`relative z-10 ${
          hasDirectMatches
            ? "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
            : "mx-auto max-w-3xl"
        }`}
      >
        <div
          className={`flex items-center gap-4 ${
            hasDirectMatches ? "" : "justify-center text-center"
          }`}
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(0,120,212,0.2)] bg-white text-[var(--accent-primary)] shadow-[0_8px_20px_rgba(0,120,212,0.12)]">
            {!prefersReducedMotion && (
              <motion.span
                className="absolute inset-0 rounded-2xl border border-[rgba(0,120,212,0.28)]"
                animate={{ opacity: [0.55, 0], scale: [1, 1.45] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
            <SparkleIcon />
          </div>

          <div className={hasDirectMatches ? "" : "min-w-0"}>
            <p className="font-display text-base font-bold text-[var(--text-primary)] sm:text-lg">
              {hasDirectMatches
                ? "Improving your results…"
                : "Searching for the best tools…"}
            </p>
            <p className="mt-1 text-sm leading-relaxed break-words text-[var(--text-secondary)]">
              {hasDirectMatches
                ? `${directMatchCount} direct ${directMatchCount === 1 ? "match is" : "matches are"} ready while related tools are checked.`
                : `Searching ${toolCount} curated tools for “${query}”.`}
            </p>
          </div>
        </div>

        <div
          className={`grid gap-2 ${
            hasDirectMatches
              ? "sm:grid-cols-3 lg:min-w-[520px]"
              : "mt-8 sm:grid-cols-3"
          }`}
        >
          {stages.map((stage, index) => {
            const isComplete = index < activeStage;
            const isActive = index === activeStage;

            return (
              <div
                key={stage}
                className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-[border-color,background-color,color] ${
                  isActive
                    ? "border-[rgba(0,120,212,0.25)] bg-white text-[var(--text-primary)] shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                    : isComplete
                      ? "border-transparent bg-[rgba(0,120,212,0.06)] text-[var(--accent-primary)]"
                      : "border-transparent bg-white/50 text-[var(--text-tertiary)]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                    isActive
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                      : isComplete
                        ? "border-[rgba(0,120,212,0.2)] bg-white text-[var(--accent-primary)]"
                        : "border-[color:var(--border-subtle)] bg-white text-[var(--text-tertiary)]"
                  }`}
                >
                  {isComplete ? <CheckIcon /> : index + 1}
                </span>
                <span className="truncate">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
