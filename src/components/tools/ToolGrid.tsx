"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { Tool } from "~/types/tool";
import { ToolCard } from "./ToolCard";
import { Pagination } from "./Pagination";
import Link from "next/link";
import type { AIExplanations, AIConfidenceScores } from "~/hooks/useToolFilters";

const TOOLS_PER_PAGE = 9;

interface ToolGridProps {
  tools: Tool[];
  aiExplanations?: AIExplanations;
  aiConfidenceScores?: AIConfidenceScores;
}

export function ToolGrid({ tools, aiExplanations, aiConfidenceScores }: ToolGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Calculate pagination
  const totalPages = Math.ceil(tools.length / TOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
  const endIndex = startIndex + TOOLS_PER_PAGE;
  const paginatedTools = tools.slice(startIndex, endIndex);

  // Reset to page 1 when tools change (filter/search)
  useEffect(() => {
    setCurrentPage(1);
  }, [tools.length]);

  // Scroll to top of grid when page changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (gridRef.current) {
      const yOffset = -120; // Account for sticky header
      const y = gridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (tools.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M8 11h6" />
          </svg>
        </div>
        <h3
          className="font-display text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          No tools found
        </h3>
        <p
          className="mt-2 max-w-md text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Try adjusting your search or filter criteria. Or be the first to submit
          a tool that matches!
        </p>
        <Link href="/submit" className="btn btn-primary mt-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Submit a Tool
        </Link>
      </motion.div>
    );
  }

  return (
    <div ref={gridRef}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          }}
        >
          {paginatedTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={index}
              aiExplanation={aiExplanations?.[tool.id]}
              confidenceScore={aiConfidenceScores?.[tool.id]}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
