"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_QUERIES = [
  "How do I backup my Intune policies?",
  "Why is my device not syncing?",
  "How can I troubleshoot Autopilot failures?",
  "What tools help deploy apps to Mac?",
  "How do I create Win32 app packages?",
  "What tools help with device compliance?",
  "How can I monitor device health?",
  "How do I report on app deployments?",
];

// Default queries for SSR (first 4) to ensure consistent hydration
const DEFAULT_QUERIES = EXAMPLE_QUERIES.slice(0, 4);

interface SearchExamplesProps {
  isVisible: boolean;
  onExampleClick: (query: string) => void;
}

export function SearchExamples({ isVisible, onExampleClick }: SearchExamplesProps) {
  // Start with default queries for SSR, then randomize on client
  const [displayedQueries, setDisplayedQueries] = useState(DEFAULT_QUERIES);

  useEffect(() => {
    // Randomize queries only on client after hydration
    const shuffled = [...EXAMPLE_QUERIES].sort(() => Math.random() - 0.5);
    setDisplayedQueries(shuffled.slice(0, 4));
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          {/* Label */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mr-1 text-xs font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Try:
          </motion.span>

          {/* Example chips */}
          {displayedQueries.map((query, index) => (
            <motion.button
              key={query}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.1 + index * 0.05,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => onExampleClick(query)}
              className="cursor-pointer group relative overflow-hidden rounded-full px-3 py-1.5 text-xs transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "var(--text-secondary)",
              }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(0, 212, 255, 0.3)",
                background: "rgba(0, 212, 255, 0.08)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover glow */}
              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle at center, rgba(0, 212, 255, 0.15), transparent 70%)",
                }}
              />

              {/* Sparkle icon */}
              <span className="relative mr-1.5 inline-block opacity-60 transition-opacity group-hover:opacity-100">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline"
                >
                  <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                </svg>
              </span>

              {/* Query text */}
              <span className="relative transition-colors group-hover:text-[var(--accent-primary)]">
                {query}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
