"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = useCallback(() => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const delta = 1; // Pages to show around current page

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("ellipsis-start");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => getPageNumbers(), [getPageNumbers]);

  // Don't render if only one page
  if (totalPages <= 1) return null;

  const NavButton = ({
    direction,
    disabled,
    onClick,
  }: {
    direction: "prev" | "next";
    disabled: boolean;
    onClick: () => void;
  }) => (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300"
      style={{
        background: "rgba(17, 25, 34, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
      }}
      whileHover={!disabled ? {
        scale: 1.05,
        borderColor: "rgba(0, 212, 255, 0.3)",
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 212, 255, 0.1) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Arrow icon */}
      <motion.svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
          position: "relative",
          zIndex: 1,
        }}
        className="transition-colors duration-300 group-hover:text-[var(--accent-primary)]"
      >
        {direction === "prev" ? (
          <path d="m15 18-6-6 6-6" />
        ) : (
          <path d="m9 18 6-6-6-6" />
        )}
      </motion.svg>
    </motion.button>
  );

  const PageButton = ({ page, isActive }: { page: number; isActive: boolean }) => (
    <motion.button
      onClick={() => onPageChange(page)}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300"
      style={{
        background: isActive ? "transparent" : "rgba(17, 25, 34, 0.4)",
        border: isActive ? "1px solid rgba(0, 212, 255, 0.5)" : "1px solid rgba(255, 255, 255, 0.03)",
        color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
        cursor: "pointer",
      }}
      whileHover={!isActive ? {
        scale: 1.05,
        borderColor: "rgba(255, 255, 255, 0.1)",
      } : {}}
      whileTap={{ scale: 0.95 }}
    >
      {/* Active state glow background */}
      {isActive && (
        <>
          {/* Outer glow */}
          <motion.div
            className="absolute -inset-1 rounded-xl"
            style={{
              background: "radial-gradient(circle at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Inner gradient background */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "transparent",
              boxShadow: "inset 0 0 20px rgba(0, 212, 255, 0.1)",
            }}
            animate={{
              boxShadow: [
                "inset 0 0 20px rgba(0, 212, 255, 0.1)",
                "inset 0 0 25px rgba(0, 212, 255, 0.15)",
                "inset 0 0 20px rgba(0, 212, 255, 0.1)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Hover glow for non-active */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Page number */}
      <span className="relative z-10 transition-colors duration-300 group-hover:text-[var(--text-primary)]">
        {page}
      </span>
    </motion.button>
  );

  const Ellipsis = () => (
    <motion.div
      className="flex h-11 w-8 items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full"
            style={{ background: "var(--text-tertiary)" }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <motion.nav
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 flex flex-col items-center gap-6"
      aria-label="Pagination navigation"
    >
      {/* Main pagination container */}
      <motion.div
        className="relative flex items-center gap-2 rounded-2xl p-2"
        style={{
          background: "rgba(17, 25, 34, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        }}
      >
        {/* Subtle top shine */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.1) 70%, transparent)",
          }}
        />

        {/* Previous button */}
        <NavButton
          direction="prev"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />

        {/* Divider */}
        <div
          className="mx-1 h-6 w-px"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        />

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((page) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return <Ellipsis key={page} />;
            }
            return (
              <PageButton
                key={page}
                page={page}
                isActive={page === currentPage}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div
          className="mx-1 h-6 w-px"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        />

        {/* Next button */}
        <NavButton
          direction="next"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </motion.div>

      {/* Page indicator text */}
      <motion.p
        className="text-xs font-medium tracking-wide"
        style={{ color: "var(--text-tertiary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Page{" "}
        <span style={{ color: "var(--accent-primary)" }}>{currentPage}</span>
        {" "}of{" "}
        <span style={{ color: "var(--text-secondary)" }}>{totalPages}</span>
      </motion.p>
    </motion.nav>
  );
}
